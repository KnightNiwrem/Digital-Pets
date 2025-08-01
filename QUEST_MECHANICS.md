---
title: Quest Mechanics Analysis
task_id: quest-mechanics-review-2025-08
date: 2025-08-01
last_updated: 2025-08-01
status: FINAL
owner: 🏗️ Architect
---

Objective
Provide a precise, system-level analysis of how quest mechanics are modeled, how progress is detected and evaluated, how completion and rewards are processed, which systems emit quest-relevant actions, and where UX integrates. Conclude with recommendations to strengthen robustness, extensibility, and cohesion.

Scope
- Model definitions and data sources
- QuestSystem control flow and algorithms
- GameLoop and WorldSystem integration points
- UI integration for available/active/completed quests
- Validation via existing tests
- Improvement recommendations

Not in Scope
- New feature implementation
- Refactors to other systems unless required by findings

1) Data Model and Contracts
Files: [src/types/Quest.ts](src/types/Quest.ts)

Key types:
- Quest: id, name, description, type, status, objectives[], requirements[], rewards[], npcId, location, dialogue, metadata, timing.
- QuestObjective: type union collect_item | deliver_item | visit_location | defeat_pet | care_action | reach_level | complete_quest; payload fields itemId, locationId, petSpecies, careAction, questId; plus numeric progress (targetAmount, currentAmount) and completed flag.
- QuestRequirement: level | quest_completed | location_visited | item_owned | pet_species.
- QuestReward: item | gold | experience | unlock_location | unlock_pet | unlock_quest.
- QuestProgress: snapshot of an active quest for the player (denormalized for display), including objectives cloned from Quest with current progress.
- QuestLog: activeQuests[], completedQuests[], failedQuests[], availableQuests[], questChains[].
- QuestEvent: quest_started | quest_completed | objective_completed | quest_failed; used as side-effect messages from progress processing.
- Constants: QUEST_CONSTANTS.MAX_ACTIVE_QUESTS (10), QUEST_COMPLETION_NOTIFICATION_DURATION (5s).

Observations:
- Objectives are stateful at runtime: currentAmount and completed are mutated in active QuestProgress entries.
- Negative targetAmount design exists to represent selling/losing items (e.g., -3 means objective completes when currentAmount <= -3). This handling is implemented in QuestSystem.
- reach_level uses targetAmount as the level threshold.
- Some requirement types are marked with TODO/comment indicating not fully implemented yet (e.g., location_visited check).

2) Content Definitions
Files: [src/data/quests.ts](src/data/quests.ts)

- Provides canonical content set of 17 quests across story, exploration, collection, battle, and care.
- Examples use all objective types: collect_item, visit_location, care_action, defeat_pet, and negative targets (sell iron_ore).
- Chaining through rewards unlocks: unlock_location and unlock_quest are applied on completion. Requirements for subsequent quests check quest_completed and level.
- Helper: getQuestById(id) to lookup quest definitions.

Observations:
- Requirements rely on quest_completed and sometimes level; level currently mapped to currentPet.growthStage in QuestSystem.
- Several later quests unlock future quests via unlock_quest reward. Available quest surfacing depends on QuestLog.availableQuests.

3) Quest System Mechanics
Files: [src/systems/QuestSystem.ts](src/systems/QuestSystem.ts)

Initialization
- initializeQuestLog(): returns empty QuestLog.

Start gating
- canStartQuest(quest, gameState): blocks if already completed or already active. Iterates requirements via checkRequirement(). Enforces MAX_ACTIVE_QUESTS (hardcoded 10 in code; note constant duplication).
- checkRequirement(requirement, gameState):
  - level: uses currentPet.growthStage as proxy for level.
  - quest_completed: verifies questLog.completedQuests.
  - location_visited: noted as not implemented; assumed OK for unlocked.
  - item_owned: sums quantities across inventory slots by item.id.
  - pet_species: compares currentPet.species.id.

Starting
- startQuest(quest, gameState): asserts canStart, clones objectives with currentAmount=0, completed=false, sets status=active, copies rewards, sets startTime, pushes into activeQuests, removes from availableQuests.

Per-objective progress
- updateObjectiveProgress(questId, objectiveId, amount, gameState):
  - Finds active QuestProgress; then objective by id.
  - Applies additive progress to currentAmount with clamping rules:
    - If targetAmount >= 0: clamp upward to target using Math.min.
    - If targetAmount < 0: clamp downward to target using Math.max.
  - Sets objective.completed based on reaching/exceeding threshold (>= for positive targets, <= for negative).
  - Returns a QuestAction "update_objective" with progress metadata.

Completion evaluation
- isQuestComplete(questId): all objectives completed.

Completion and rewards
- completeQuest(gameState, questId):
  - Validates active and all objectives completed.
  - Moves quest from activeQuests to completedQuests, sets status/timestamp.
  - distributeRewards(rewards, gameState):
    - item: getItemById + ItemSystem.addItem
    - gold: inventory.gold += amount
    - experience: playerStats.experience += amount
    - unlock_location: push into world.unlockedLocations if missing
    - unlock_pet: placeholder
    - unlock_quest: push questId to questLog.availableQuests
  - Returns updated GameState.

Action-driven progress detection
- processGameAction(actionType, actionData, allQuests, gameState) => QuestEvent[]:
  - Iterates all active quests and their incomplete objectives.
  - checkObjectiveProgress(objective, actionType, actionData) returns an integer delta:
    - collect_item: when actionType == "item_obtained" and itemId matches, return amount (default 1).
    - deliver_item: when actionType == "item_delivered" and itemId matches.
    - visit_location: when actionType == "location_visited" and locationId matches, return 1.
    - defeat_pet: when actionType == "battle_won" and opponentSpecies matches objective.petSpecies.
    - care_action: when actionType == "pet_care" and action matches objective.careAction, return 1.
    - reach_level: when actionType == "level_up" and newLevel >= targetLevel, returns remaining to complete.
    - complete_quest: when actionType == "quest_completed" and questId matches the required quest, return 1.
  - If progressResult > 0, calls updateObjectiveProgress() with that delta.
  - Emits an "objective_completed" event after any positive progress (note: naming says completed, but logic does not check that the objective has actually become completed this update; it fires on any progress).
  - Checks isQuestComplete(); on success calls completeQuest() and emits "quest_completed" event.

Observations and nuances:
- processGameAction relies on external systems to emit appropriately typed actions. There is no automatic bridging from WorldSystem/GameLoop to QuestSystem out of the box; see integration section below.
- The "objective_completed" event is emitted even if the objective didn't reach its target on that update; the name is misleading and might be intended as "objective_progressed". Tests expect a single event per call; no explicit assertion on event naming semantics.
- Negative target objective handling enables deliver/sell objectives via amount deltas.
- Unlocking new quests writes to questLog.availableQuests, but surfacing and auto-prompting is up to the UI/application level.

4) Engine and World Integration Points
Files: [src/engine/GameLoop.ts](src/engine/GameLoop.ts), [src/systems/WorldSystem.ts](src/systems/WorldSystem.ts)

GameLoop
- Maintains tick execution and invokes:
  - PetSystem.processPetTick (emits structured actions recorded in actions[] but not routed to QuestSystem).
  - WorldSystem.processTravelTick and processActivitiesTick.
  - processActivityRewards converts ActivityReward[] to inventory/prizes and pushes actions: "gold_earned", "item_earned", "experience_earned".
- Critically, GameLoop does not call QuestSystem.processGameAction. No translation is present to map "item_earned" to "item_obtained" for quests. As-is, item-based objectives will not advance unless some other layer (hooks/UI) calls QuestSystem.processGameAction with expected types.
- Pet growth and events are also not mapped to "level_up" or "pet_care" in the quest system from the loop. The loop sometimes pushes actions like "pet_growth", "pet_pooped", but these are not consumed by QuestSystem.

WorldSystem
- Activities are defined at locations and generate rewards probabilistically upon completion in processActivitiesTick. The rewards are returned upward; GameLoop then applies via ItemSystem.
- No direct quest-system calls are present inside WorldSystem. All potential quest progress must be detected by listening to world/battle/pet/item operations and mapping to QuestSystem.processGameAction.

Implication
- The quest progression engine is pull-based by API, but the runtime never calls it. The intended architecture likely expects the application layer (hooks/useGameState, action dispatchers, or UI handlers) to trigger QuestSystem.processGameAction whenever significant domain actions occur: purchases, item adds/removals, travel completion, battle results, care actions, and level-ups.

5) UI Integration
Files: [src/components/quest/QuestList.tsx](src/components/quest/QuestList.tsx), [src/components/quest/QuestDetails.tsx](src/components/quest/QuestDetails.tsx), [src/components/quest/QuestDialog.tsx](src/components/quest/QuestDialog.tsx)

- QuestList: Displays available, active, and completed quests; uses QuestUtils.calculateQuestProgress and counts completed objectives. Selection and display are present, but this component does not drive mechanics.
- QuestDetails: Displays a combined view for a selected quest. The Complete button invokes onCompleteQuest(questId); it checks readiness via QuestUtils.isQuestComplete. No internal calls to advance objectives.
- QuestDialog: Accept Quest; calls onStartQuest(quest.id). No direct mechanics calls beyond starting.

Observation
- UI components are presentation/controller interfaces and rely on parent handlers (likely via custom hooks) to invoke QuestSystem.startQuest/completeQuest. They do not emit gameplay actions for QuestSystem.processGameAction either.

6) Tests as Ground Truth
Files: [tests/systems/QuestSystem.test.ts](tests/systems/QuestSystem.test.ts)

- Validates:
  - QuestLog initialization
  - Start gating, requirement checks, max active limit
  - Starting quests populates QuestProgress and initializes objectives
  - updateObjectiveProgress behavior (clamping and completion)
  - isQuestComplete logic
  - completeQuest transitions and reward application
  - processGameAction:
    - "pet_care" action advances care objectives and ultimately completes "pet_care_basics" by repeatedly calling processGameAction with the correct actionType and action payload.
    - Confirms that without calling processGameAction there is no automatic progress.
- The tests simulate external calls to QuestSystem.processGameAction rather than relying on the game loop or world systems, reinforcing the intended integration contract: higher layers must forward actions.

7) End-to-End Flow Summary
1. Quest availability
   - Game checks canStartQuest() based on requirements and capacity.
   - UI surfaces availableQuests using application logic (QuestSystem.getAvailableQuests exists but is not auto-wired).

2. Start quest
   - UI calls startQuest(); QuestProgress created and added to activeQuests.

3. Progress detection
   - On domain events, callers must translate them to QuestSystem.processGameAction(actionType, actionData, QUESTS, gameState).
   - Action type mapping contract:
     - Shop purchase/item gain → "item_obtained" with { itemId, amount }
     - Delivery/sale → "item_delivered" with { itemId, amount } (use negative objective targets for sell)
     - Travel/location arrival → "location_visited" with { locationId }
     - Battle results → "battle_won" with { opponentSpecies }
     - Pet care → "pet_care" with { action: "feed" | "drink" | "play" | etc. }
     - Level up → "level_up" with { newLevel }
     - Quest completion cascade → "quest_completed" with { questId }
   - updateObjectiveProgress performs aggregation and completion flags.

4. Quest completion and rewards
   - On all objectives completed, completeQuest() applies rewards, updates quest logs, and may unlock location/quest.
   - Unlocks modify world and QuestLog.availableQuests for future surfacing.

5. UI completion
   - UI can call onCompleteQuest to force completion if objectives are met (guarded by QuestUtils checks).

8) Gaps, Risks, and Edge Cases
Gaps
- Missing integration from GameLoop/WorldSystem/PetSystem/ItemSystem to QuestSystem.processGameAction. As-is, normal gameplay (foraging, fishing, mining, shop buys, travel completion, battles) will not progress quests unless the application code elsewhere forwards the actions.
- "objective_completed" event name is misleading; it is emitted on any progress, not only when an objective reaches completion. Could confuse analytics/UX logic.
- Requirement type location_visited is not yet implemented in checkRequirement; comments say assumed OK for unlocked. This weakens gating for quests that expect explicit visit history.
- Level requirement is mapped to currentPet.growthStage. This is acceptable in this project, but semantics should be documented, especially if a Player-level system emerges.
- MAX_ACTIVE_QUESTS is hardcoded (10) in QuestSystem.canStartQuest rather than importing QUEST_CONSTANTS. Minor drift risk.

Edge Cases
- Negative target amounts: ensure all emitters for "item_delivered" pass negative deltas or that QuestSystem logic is always called with positive deltas and relies on negative target logic only. Currently updateObjectiveProgress expects a positive amount that gets added and compared vs target sign. For selling objectives, processGameAction returns positive deltas; because target is negative, clamping uses Math.max(current + amount, target). This means currentAmount will move from 0 towards positive, never reaching a negative target. Resolution: For sell/lose objectives, processGameAction should emit negative amounts, or the system should invert sign when objective.targetAmount < 0. The current code would not complete such an objective unless a negative amount is applied.
- Multi-source item gains: processActivityRewards adds items directly to inventory and emits "item_earned" but not "item_obtained". No quest progress occurs unless additionally mapped.
- Unlock quest availability: pushing to availableQuests occurs, but the UI layer must fetch and display them; ensure there is a periodic or event-driven refresh.

9) Recommendations
Priority 1: Wire action bus to QuestSystem
- Introduce a centralized action dispatcher that all systems call when domain events occur. For example:
  - After processActivityRewards adds an item, call QuestSystem.processGameAction("item_obtained", { itemId, amount }, QUESTS, gameState).
  - After WorldSystem.processTravelTick completes travel, call QuestSystem.processGameAction("location_visited", { locationId }, QUESTS, gameState).
  - After BattleSystem resolves a win, dispatch QuestSystem.processGameAction("battle_won", { opponentSpecies }, QUESTS, gameState).
  - After shop purchase or ItemSystem.addItem from purchase flows, dispatch "item_obtained".
  - After pet care actions in PetSystem or UI handler, dispatch "pet_care" with the careAction.
  - After growth stage increment, dispatch "level_up" with newLevel.
- This can be done in GameLoop (preferred central place) or in the respective system functions just after state mutation to ensure consistency.

Priority 2: Fix negative target objective handling
- Option A: Ensure processGameAction returns negative amount for deliver/sell actions. For example, when selling 3 iron_ore, return amount = -3 for "item_delivered".
- Option B: In updateObjectiveProgress, if targetAmount < 0 and incoming amount is positive, invert sign when applying, or evaluate completion with remaining delta semantics:
  - For negative target: objective.currentAmount = currentAmount - amount; complete when currentAmount <= targetAmount.
- Validate with tests covering "sell_ore" in mountain_mining_tutorial to guarantee completion works.

Priority 3: Align constants and semantics
- Replace hardcoded 10 with QUEST_CONSTANTS.MAX_ACTIVE_QUESTS to avoid drift.
- Rename "objective_completed" QuestEvent to "objective_progressed" or emit two events: "objective_progress" and "objective_completed" only when completed flag flips to true. Update tests accordingly.

Priority 4: Implement requirement location_visited
- Use world.visitedLocations to verify explicit visits. Quest gating that depends on exploration will then be reliable.
- Consider adding a uniform emitter when travel completes to also mark visitedLocations; already implemented by WorldSystem, but checkRequirement should honor it.

Priority 5: Availability and UX hooks
- Provide a helper to recompute availableQuests on each player state change or after quest completion/reward distribution:
  - E.g., QuestSystem.getAvailableQuests(allQuests, gameState) and then update questLog.availableQuests from that output, de-duplicated.
- UI should rely on quest names/metadata rather than raw IDs for completedQuests display; currently QuestList shows questId in Completed tab.

Priority 6: Telemetry and tests
- Add unit tests for:
  - Negative target sell objective completion path.
  - Action mapping tests from GameLoop/WorldSystem to QuestSystem.processGameAction.
  - location_visited requirement gating.
  - objective_completed vs objective_progressed semantics.
- Consider an integration test that simulates foraging/fishing/mining loop and validates relevant quest objectives progress and completion.

10) Action-Type Mapping Table (Proposed Standard)
Emitter → QuestSystem.processGameAction mapping:
- Item gained via activity/shop: "item_obtained", { itemId, amount }
- Item delivered/sold to NPC/shop: "item_delivered", { itemId, amount: -N }
- Travel completed to X: "location_visited", { locationId: X }
- Battle victory: "battle_won", { opponentSpecies }
- Pet care: "pet_care", { action: "feed" | "drink" | "play" | "clean" | "treat" }
- Growth stage change: "level_up", { newLevel: currentPet.growthStage }
- Quest completion dependency: "quest_completed", { questId }

11) Current Strengths
- Clear, strongly typed quest model with flexible objective and reward types.
- Deterministic progress update logic including clamping.
- Reward distribution covers inventory, economy, experience, and world/location/quest unlocks.
- Clean structure for processing game actions and emitting events for UI/notifications.
- Comprehensive unit tests for QuestSystem core functions and action-driven progression.

12) Identified Weaknesses
- No runtime integration to call QuestSystem.processGameAction from core systems.
- Misnamed event "objective_completed" for any progress.
- Incomplete requirement enforcement (location_visited).
- Potential bug in negative target objective progression without negative deltas.
- Hardcoded cap instead of constant reference.
- UI Completed list shows IDs rather than friendly names.

13) Implementation Plan (high level)
1. Introduce ActionBridge in GameLoop:
   - After processActivityRewards item/gold/exp, call QuestSystem.processGameAction with appropriate mappings.
   - After travel completion, map to "location_visited".
   - After pet growth detection, map to "level_up".
2. Extend BattleSystem integration:
   - On win, emit "battle_won" with opponent species.
3. Update shop purchase flows:
   - After successful purchase add, emit "item_obtained".
   - After sell, emit "item_delivered" with negative amount.
4. Fix updateObjectiveProgress negative target path or enforce negative amounts in emitters; add tests.
5. Implement requirement location_visited using world.visitedLocations and add tests.
6. Rename or bifurcate objective progress events and extend tests.
7. Replace 10 with QUEST_CONSTANTS.MAX_ACTIVE_QUESTS.
8. UI: render completed quest names by lookup getQuestById for nicer display.

14) Acceptance Criteria
- Item-collection quests progress automatically when items are earned through activities or shop purchases.
- Visit-location quests complete on travel arrival.
- Battle quests progress on battle wins.
- Care quests progress on feed/drink/play actions.
- Sell/deliver quests complete reliably with negative targets.
- location_visited requirement enforced using visitedLocations.
- Max active quests uses global constant.
- Tests added for the above behaviors pass.

Appendix: Key Code References
- Types: [src/types/Quest.ts](src/types/Quest.ts)
- Quests: [src/data/quests.ts](src/data/quests.ts)
- System: [src/systems/QuestSystem.ts](src/systems/QuestSystem.ts)
- Engine: [src/engine/GameLoop.ts](src/engine/GameLoop.ts)
- World: [src/systems/WorldSystem.ts](src/systems/WorldSystem.ts)
- UI: [src/components/quest/QuestList.tsx](src/components/quest/QuestList.tsx), [src/components/quest/QuestDetails.tsx](src/components/quest/QuestDetails.tsx), [src/components/quest/QuestDialog.tsx](src/components/quest/QuestDialog.tsx)
- Tests: [tests/systems/QuestSystem.test.ts](tests/systems/QuestSystem.test.ts)