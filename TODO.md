# Digital Pets - Implementation TODO

A feature-focused implementation plan with interleaved UI and logic for visual testing at each milestone.

---

## Milestone 0: Foundation

Core types and base infrastructure.

### 0.1 Base Types
- [x] Create `src/game/types/common.ts` - MicroValue, Timestamp, Tick types
- [x] Create `src/game/types/constants.ts` - GrowthStage, DamageType, ItemCategory, Rarity as `const` objects with derived union types
- [x] Create `src/game/types/stats.ts` - CareStats, BattleStats interfaces
- [x] Create `src/game/types/gameState.ts` - GameState, PlayerState interfaces
- [x] Create `src/game/types/pet.ts` - Pet, PetState interfaces

### 0.2 Base Infrastructure
- [x] Create `src/game/state/persistence.ts` - localStorage save/load scaffolding
- [x] Create `src/game/context/GameContext.tsx` - React context provider shell
- [x] Create `src/game/hooks/useGameState.ts` - Basic state hook

### 0.3 Base UI Layout
- [x] Create `src/components/game/Layout.tsx` - Main game layout shell
- [x] Create `src/components/game/Header.tsx` - Header placeholder
- [x] Create `src/components/game/Navigation.tsx` - Tab navigation between screens
- [x] Update `src/App.tsx` - Integrate game layout

**✓ Testable:** App loads with navigation tabs visible

---

## Milestone 1: Pet Display & Basic Care Stats

First visual pet with care stat bars.

### 1.1 Types & Data
- [ ] Create `src/game/types/species.ts` - Species interface
- [ ] Create `src/game/data/growthStages.ts` - Growth stage definitions
- [ ] Create `src/game/data/species.ts` - Initial species (2-3 starter species)
- [ ] Create `src/game/data/starting.ts` - New game pet creation

### 1.2 Pet State Logic
- [ ] Create `src/game/state/initialState.ts` - Create new pet with starting stats
- [ ] Create `src/game/state/selectors.ts` - Pet stat selectors

### 1.3 Pet Display UI
- [ ] Create `src/components/pet/PetSprite.tsx` - Pet visual (placeholder/emoji initially)
- [ ] Create `src/components/pet/PetInfo.tsx` - Name, species, age, stage display
- [ ] Create `src/components/pet/PetStatus.tsx` - Care stat bars (Satiety, Hydration, Happiness)
- [ ] Create `src/components/pet/EnergyBar.tsx` - Energy display
- [ ] Create `src/components/screens/CareScreen.tsx` - Main care screen with pet display

### 1.4 Debug Tools
- [ ] Add delete save data tab/button in Navigation for testing

**✓ Testable:** See pet with name, species, and care stat bars on Care screen

---

## Milestone 2: Time & Care Decay (Passive)

Stats decay over time, visible in real-time.

### 2.1 Time System
- [ ] Create `src/game/core/time.ts` - Timestamp utilities
- [ ] Create `src/game/core/tick.ts` - Single tick processing logic
- [ ] Create `src/game/core/tickProcessor.ts` - Tick processor with correct order

### 2.2 Care Decay Logic
- [ ] Create `src/game/core/care/careStats.ts` - Care stat decay per tick
- [ ] Create `src/game/core/care/careLife.ts` - Care life drain/recovery

### 2.3 Game Loop
- [ ] Create `src/game/GameManager.ts` - Tick scheduling, runs every 30 seconds
- [ ] Integrate GameManager into GameContext
- [ ] Connect tick updates to state

### 2.4 UI Updates
- [ ] Update PetStatus.tsx - Show decay in real-time
- [ ] Add visual indicators for low stats (color changes)

**✓ Testable:** Watch care stats slowly decrease over time in the UI

---

## Milestone 3: Feeding & Items (Basic)

Consumable items to restore care stats.

### 3.1 Types & Data
- [ ] Create `src/game/types/item.ts` - Item, Food, Drink interfaces
- [ ] Create `src/game/data/items/food.ts` - Food items (3-5 items)
- [ ] Create `src/game/data/items/drinks.ts` - Drink items (3-5 items)
- [ ] Create `src/game/data/items/index.ts` - Combined item database

### 3.2 Inventory Logic
- [ ] Create `src/game/core/inventory.ts` - Add, remove, find items
- [ ] Create `src/game/state/actions/inventory.ts` - Inventory state actions

### 3.3 Item Usage Logic
- [ ] Create `src/game/core/items.ts` - Use food/drink items
- [ ] Create `src/game/state/actions/care.ts` - Feed, water actions

### 3.4 Care Action UI
- [ ] Create `src/components/care/FeedButton.tsx` - Open food selection
- [ ] Create `src/components/care/WaterButton.tsx` - Open drink selection
- [ ] Create `src/components/inventory/ItemSelector.tsx` - Item selection modal
- [ ] Update CareScreen.tsx - Add feed/water buttons

**✓ Testable:** Click Feed → Select food → See Satiety increase. Same for Water.

---

## Milestone 4: Poop & Cleaning

Poop accumulates, requires cleaning items.

### 4.1 Types & Data
- [ ] Create `src/game/data/items/cleaning.ts` - Cleaning items
- [ ] Update items index

### 4.2 Poop Logic
- [ ] Create `src/game/core/care/poop.ts` - Poop generation per tick, poop effects

### 4.3 Cleaning Logic
- [ ] Update `src/game/core/items.ts` - Use cleaning items

### 4.4 Poop UI
- [ ] Create `src/components/care/PoopIndicator.tsx` - Show poop count
- [ ] Create `src/components/care/CleanButton.tsx` - Cleaning item selection
- [ ] Update CareScreen.tsx - Add poop display and clean button

**✓ Testable:** See poop accumulate over time, use cleaning item to remove

---

## Milestone 5: Toys & Happiness

Toys restore Happiness with durability.

### 5.1 Types & Data
- [ ] Update `src/game/types/item.ts` - Toy interface with durability
- [ ] Create `src/game/data/items/toys.ts` - Toy items

### 5.2 Toy Logic
- [ ] Update `src/game/core/items.ts` - Use toys, reduce durability

### 5.3 Toy UI
- [ ] Create `src/components/care/PlayButton.tsx` - Toy selection
- [ ] Update ItemSelector to show durability for toys
- [ ] Update CareScreen.tsx - Add play button

**✓ Testable:** Use toy → Happiness increases, toy durability decreases

---

## Milestone 6: Sleep System

Pet can sleep to restore energy faster.

### 6.1 Sleep Logic
- [ ] Create `src/game/core/energy.ts` - Energy regen based on sleep state
- [ ] Create `src/game/core/sleep.ts` - Sleep state transitions
- [ ] Create `src/game/state/actions/sleep.ts` - Sleep/wake actions
- [ ] Update tickProcessor - Different decay rates while sleeping

### 6.2 Sleep UI
- [ ] Create `src/components/care/SleepToggle.tsx` - Put to sleep / Wake up
- [ ] Update PetSprite.tsx - Sleeping visual state
- [ ] Update CareScreen.tsx - Show sleep status, disable actions while sleeping

**✓ Testable:** Put pet to sleep → See sleeping state, faster energy regen, can't feed

---

## Milestone 7: Inventory Screen

Full inventory management UI.

### 7.1 Inventory UI
- [ ] Create `src/components/screens/InventoryScreen.tsx` - Inventory screen
- [ ] Create `src/components/inventory/ItemGrid.tsx` - Item display grid
- [ ] Create `src/components/inventory/ItemSlot.tsx` - Single item with count/durability
- [ ] Create `src/components/inventory/ItemDetail.tsx` - Item info panel
- [ ] Update Navigation - Add inventory tab

**✓ Testable:** Navigate to Inventory → See all items, view item details

---

## Milestone 8: Starting Items & New Game

New game flow with starting items.

### 8.1 Starting Data
- [ ] Update `src/game/data/starting.ts` - Starting inventory items
- [ ] Create species selection logic

### 8.2 New Game UI
- [ ] Create `src/components/screens/NewGameScreen.tsx` - Species selection, pet naming
- [ ] Update App.tsx - Show NewGame if no save, else load saved game

**✓ Testable:** First load shows new game screen, select species, name pet, start with items

---

## Milestone 9: Offline Progression

Catch up on missed time when returning.

### 9.1 Offline Logic
- [ ] Update GameManager - Calculate elapsed ticks on load
- [ ] Process batch ticks for offline catch-up
- [ ] Implement time cap (7 days max)

### 9.2 Offline UI
- [ ] Create `src/components/game/OfflineReport.tsx` - Show what happened while away
- [ ] Display on return if significant time passed

**✓ Testable:** Close browser, wait, reopen → See stats have changed, optional report

---

## Milestone 10: Growth & Stage Transitions

Pet ages and grows through stages.

### 10.1 Growth Logic
- [ ] Create `src/game/core/growth.ts` - Age accumulation, stage checks
- [ ] Update tickProcessor - Include growth processing
- [ ] Stage transition stat updates

### 10.2 Growth UI
- [ ] Update PetInfo.tsx - Show age, stage, substage
- [ ] Create `src/components/pet/GrowthProgress.tsx` - Progress to next stage
- [ ] Add stage transition notification/animation

**✓ Testable:** See age increase, progress bar to next stage (can test by adjusting time)

---

## Milestone 11: Locations & Travel

World map with connected locations.

### 11.1 Types & Data
- [ ] Create `src/game/types/location.ts` - Location interfaces
- [ ] Create `src/game/data/locations/home.ts` - Home base
- [ ] Create `src/game/data/locations/towns.ts` - Initial town
- [ ] Create `src/game/data/locations/wild.ts` - 1-2 wild areas
- [ ] Create `src/game/data/locations/index.ts` - World graph

### 11.2 Travel Logic
- [ ] Create `src/game/core/travel.ts` - Travel cost, access checks
- [ ] Create `src/game/state/actions/travel.ts` - Travel action

### 11.3 Map UI
- [ ] Create `src/components/screens/MapScreen.tsx` - World map
- [ ] Create `src/components/map/LocationNode.tsx` - Location display
- [ ] Create `src/components/map/LocationDetail.tsx` - Location info
- [ ] Update Navigation - Add Map tab

**✓ Testable:** View map → See connected locations → Travel to adjacent location

---

## Milestone 12: Training (Basic)

Train to improve battle stats.

### 12.1 Types & Data
- [ ] Create `src/game/types/activity.ts` - Training activity interface
- [ ] Create `src/game/data/facilities.ts` - Training facility definitions

### 12.2 Training Logic
- [ ] Create `src/game/core/training.ts` - Start training, complete training, stat gains
- [ ] Create `src/game/state/actions/training.ts` - Training actions
- [ ] Update tickProcessor - Progress training timer

### 12.3 Training UI
- [ ] Create `src/components/screens/TrainingScreen.tsx` - Training interface
- [ ] Create `src/components/training/FacilityCard.tsx` - Training option
- [ ] Create `src/components/training/TrainingProgress.tsx` - Active training indicator
- [ ] Create `src/components/training/StatsDisplay.tsx` - Battle stats overview

**✓ Testable:** Start training → See progress → Complete → Stats increased

---

## Milestone 13: Exploration & Foraging

Forage for items in wild areas.

### 13.1 Types & Data
- [ ] Create `src/game/data/tables/forage.ts` - Forage tables per location

### 13.2 Exploration Logic
- [ ] Create `src/game/core/exploration/forage.ts` - Forage logic, drop calculation
- [ ] Create `src/game/state/actions/exploration.ts` - Start/complete exploration

### 13.3 Exploration UI
- [ ] Create `src/components/screens/ExplorationScreen.tsx` - Exploration interface
- [ ] Create `src/components/exploration/ActivitySelect.tsx` - Forage option
- [ ] Create `src/components/exploration/ExplorationProgress.tsx` - Active exploration
- [ ] Create `src/components/exploration/ResultsPanel.tsx` - Show found items

**✓ Testable:** Travel to wild area → Forage → See items added to inventory

---

## Milestone 14: Battle System (Core)

Turn-based 1v1 combat.

### 14.1 Types & Data
- [ ] Create `src/game/types/move.ts` - Move, StatusEffect interfaces
- [ ] Create `src/game/data/moves.ts` - Default moves + some learnable
- [ ] Create `src/game/data/tables/encounters.ts` - Wild encounters

### 14.2 Battle Logic
- [ ] Create `src/game/core/battle/stats.ts` - Derived stat calculations
- [ ] Create `src/game/core/battle/damage.ts` - Damage formula
- [ ] Create `src/game/core/battle/turn.ts` - Turn order, action resolution
- [ ] Create `src/game/core/battle/status.ts` - Status effects
- [ ] Create `src/game/core/battle/battle.ts` - Battle state machine
- [ ] Create `src/game/core/exploration/encounter.ts` - Encounter generation

### 14.3 Battle UI
- [ ] Create `src/components/screens/BattleScreen.tsx` - Battle interface
- [ ] Create `src/components/battle/BattleArena.tsx` - Both pets
- [ ] Create `src/components/battle/PetBattleCard.tsx` - HP, status
- [ ] Create `src/components/battle/MoveSelect.tsx` - Move selection
- [ ] Create `src/components/battle/BattleLog.tsx` - Turn actions
- [ ] Create `src/components/battle/VictoryScreen.tsx` - Results

**✓ Testable:** Explore → Encounter wild pet → Battle → Win/Lose → See results

---

## Milestone 15: Skills System

Non-battle skills for exploration.

### 15.1 Types & Data
- [ ] Create `src/game/types/skill.ts` - Skill interface

### 15.2 Skills Logic
- [ ] Create `src/game/core/skills.ts` - XP gain, level ups
- [ ] Update forage logic - Skill affects drop rates

### 15.3 Skills UI
- [ ] Create `src/components/screens/SkillsScreen.tsx` - Skills overview
- [ ] Create `src/components/skills/SkillBar.tsx` - Single skill display
- [ ] Update Navigation - Add Skills tab

**✓ Testable:** Forage → Gain Foraging XP → Level up → Better drops

---

## Milestone 16: NPCs & Dialogue

Interactable NPCs in towns.

### 16.1 Types & Data
- [ ] Create `src/game/types/npc.ts` - NPC, Dialogue interfaces
- [ ] Create `src/game/data/npcs.ts` - Initial NPCs
- [ ] Create `src/game/data/dialogues.ts` - Dialogue trees

### 16.2 Dialogue Logic
- [ ] Create `src/game/core/dialogue.ts` - Dialogue navigation

### 16.3 NPC UI
- [ ] Create `src/components/npc/NPCDisplay.tsx` - NPC visual
- [ ] Create `src/components/npc/DialogueBox.tsx` - Dialogue display
- [ ] Create `src/components/npc/DialogueChoices.tsx` - Response options
- [ ] Update LocationDetail - Show NPCs in location

**✓ Testable:** Visit town → Click NPC → Read dialogue → Make choices

---

## Milestone 17: Shops

Buy items from merchants.

### 17.1 Shop Logic
- [ ] Add shop inventory to NPC merchants
- [ ] Create buy/sell functions

### 17.2 Shop UI
- [ ] Create `src/components/screens/ShopScreen.tsx` - Shop interface
- [ ] Create `src/components/shop/ShopInventory.tsx` - Items for sale
- [ ] Create `src/components/shop/BuySellPanel.tsx` - Transaction interface

**✓ Testable:** Visit merchant NPC → Open shop → Buy item → See in inventory

---

## Milestone 18: Quests (Basic)

Quest tracking and completion.

### 18.1 Types & Data
- [ ] Create `src/game/types/quest.ts` - Quest, Objective, Reward interfaces
- [ ] Create `src/game/data/quests/tutorial.ts` - Tutorial quest chain

### 18.2 Quest Logic
- [ ] Create `src/game/core/quests/requirements.ts` - Requirement checks
- [ ] Create `src/game/core/quests/objectives.ts` - Objective tracking
- [ ] Create `src/game/core/quests/rewards.ts` - Grant rewards
- [ ] Create `src/game/core/quests/quests.ts` - Quest state machine

### 18.3 Quest UI
- [ ] Create `src/components/screens/QuestScreen.tsx` - Quest journal
- [ ] Create `src/components/quests/QuestList.tsx` - Active/available quests
- [ ] Create `src/components/quests/QuestDetail.tsx` - Quest info
- [ ] Create `src/components/quests/ObjectiveList.tsx` - Progress display

**✓ Testable:** Start tutorial quest → Complete objectives → See rewards

---

## Milestone 19: More Content

Expand game content.

### 19.1 More Items
- [ ] Add more food, drink, toy, cleaning items
- [ ] Create `src/game/data/items/medicine.ts` - Medicine items
- [ ] Create `src/game/data/items/battle.ts` - Battle consumables
- [ ] Create `src/game/data/items/equipment.ts` - Equipment
- [ ] Create `src/game/data/items/materials.ts` - Materials

### 19.2 More Locations
- [ ] Add more wild areas
- [ ] Create dungeon locations

### 19.3 More Quests
- [ ] Create `src/game/data/quests/main.ts` - Main story quests
- [ ] Create `src/game/data/quests/side.ts` - Side quests
- [ ] Create `src/game/data/quests/daily.ts` - Daily quests

### 19.4 More Species
- [ ] Add unlock requirements for species
- [ ] Add 3-4 more species

**✓ Testable:** Play through expanded content

---

## Milestone 20: Polish & Balance

Final polish pass.

### 20.1 Animations
- [ ] Pet idle animations
- [ ] Care action feedback
- [ ] Battle animations

### 20.2 Balance
- [ ] Playtest and adjust decay rates
- [ ] Playtest and adjust battle formulas
- [ ] Adjust progression timing

### 20.3 Testing
- [ ] Unit tests for tick processor
- [ ] Unit tests for battle damage
- [ ] Unit tests for care decay
- [ ] Integration tests

### 20.4 Settings Menu
- [ ] Create `src/components/screens/MenuScreen.tsx`
- [ ] Manual save/export
- [ ] Settings options

**✓ Testable:** Polished game ready for extended play

---

## Summary

Each milestone produces a testable increment:

| Milestone | Key Feature | Can Test |
|-----------|-------------|----------|
| 0 | Foundation | App loads |
| 1 | Pet Display | See pet with stats |
| 2 | Time & Decay | Watch stats decrease |
| 3 | Feeding | Use food/drink |
| 4 | Poop | Clean poop |
| 5 | Toys | Play with toys |
| 6 | Sleep | Sleep/wake |
| 7 | Inventory | View all items |
| 8 | New Game | Start fresh |
| 9 | Offline | Return after time |
| 10 | Growth | See pet age |
| 11 | Locations | Travel map |
| 12 | Training | Improve stats |
| 13 | Foraging | Find items |
| 14 | Battle | Fight wild pets |
| 15 | Skills | Level skills |
| 16 | NPCs | Talk to characters |
| 17 | Shops | Buy items |
| 18 | Quests | Complete objectives |
| 19 | Content | More everything |
| 20 | Polish | Finished game |