# Exploration System

Exploration allows pets to search locations for items and encounter wild pets or events.

## Exploration Activities

Exploration activities are defined in game data. Each activity specifies its properties and requirements.

### Activity Properties

| Property | Description |
|----------|-------------|
| id | Unique identifier for the activity |
| name | Display name of the activity |
| description | Text describing what the activity does |
| duration | Time to complete, measured in ticks (see [Time](./time.md)) |
| energyCost | Energy consumed when starting the activity (see [Energy](./energy.md)) |
| requirements | Conditions that must be met to perform this activity |
| encounterChance | Base probability of triggering an encounter |

### Activity Requirements

Requirements determine whether a pet can perform an exploration activity. All requirements are optional and defined per-activity in game data.

| Requirement | Description |
|-------------|-------------|
| minSkillLevels | Map of skill IDs to minimum required levels (see [Skills](./skills.md)) |
| minPetStage | Minimum growth stage required (see [Growth](./growth.md)) |
| questCompleted | Quest IDs that must be completed (see [Quests](./quests.md)) |

A pet can only start an exploration activity if all specified requirements are met.

### Example Activity Definitions

```
Foraging:
  duration: 10 ticks
  energyCost: 15
  requirements: none
  encounterChance: Low

Mining:
  duration: 15 ticks
  energyCost: 20
  requirements: { minSkillLevels: { mining: 1 } }
  encounterChance: Low

Deep Exploration:
  duration: 30 ticks
  energyCost: 40
  requirements: { minPetStage: "adult", minSkillLevels: { foraging: 5, scouting: 5 } }
  encounterChance: High
```

## Drop Tables

Each location has drop tables defining possible item rewards for exploration activities.

### Drop Table Entry Properties

| Property | Description |
|----------|-------------|
| itemId | Item that can drop (see [Items](./items.md)) |
| quantity | Number of items granted when this entry passes |
| minRoll | Minimum roll value required (0.0 to 1.0) |
| requirements | Conditions that must be met for this entry to be evaluated |

### Drop Entry Requirements

Each drop table entry can have its own independent requirements, separate from the exploration activity requirements. This allows items to have stricter conditions than the activity itself.

| Requirement | Description |
|-------------|-------------|
| minSkillLevels | Map of skill IDs to minimum required levels |
| minPetStage | Minimum growth stage required |
| questCompleted | Quest IDs that must be completed |

If a pet meets the activity requirements but not a specific drop entry's requirements, the entry is skipped during drop calculation.

### Drop Calculation

When an exploration activity completes, a single roll determines all drops:

1. Generate a random roll value between 0.0 and 1.0
2. For each entry in the drop table:
   - Check if the pet meets the entry's requirements
   - Check if the roll value >= entry's minRoll
   - If both pass, add the entry's quantity of the item to drops
3. Aggregate all passing entries by itemId

```
roll = random(0.0, 1.0)
drops = {}

for each entry in dropTable:
  if meetsRequirements(pet, entry.requirements) AND roll >= entry.minRoll:
    drops[entry.itemId] += entry.quantity

return drops
```

### Skill Progression via Duplicate Entries

To improve drops as skills increase, add multiple entries for the same item with different requirements. Higher skill levels unlock additional entries, granting more items on successful rolls.

### Example Drop Table

```
Foraging Drop Table:
  # Base apple drop - always available
  - itemId: "apple"
    quantity: 1
    minRoll: 0.2
    requirements: none

  # Second apple - always available, harder roll
  - itemId: "apple"
    quantity: 1
    minRoll: 0.4
    requirements: none

  # Bonus apple - requires foraging skill 3+
  - itemId: "apple"
    quantity: 1
    minRoll: 0.2
    requirements: { minSkillLevels: { foraging: 3 } }

  # Rare herb - requires good roll
  - itemId: "rare_herb"
    quantity: 1
    minRoll: 0.8
    requirements: none

  # Extra rare herb - high skill unlocks easier roll
  - itemId: "rare_herb"
    quantity: 1
    minRoll: 0.5
    requirements: { minSkillLevels: { foraging: 10 } }

  # Legendary item - strict requirements
  - itemId: "ancient_artifact"
    quantity: 1
    minRoll: 0.95
    requirements: { minPetStage: "elder", questCompleted: "ancient_mysteries" }
```

### Example Scenarios

**Scenario 1:** Roll = 0.1, Foraging skill = 1
- All entries fail minRoll check
- Result: No drops

**Scenario 2:** Roll = 0.5, Foraging skill = 1
- Entry 1 (apple, minRoll 0.2): Pass
- Entry 2 (apple, minRoll 0.4): Pass
- Entry 3 (apple, minRoll 0.2, skill 3+): Fail requirements
- Result: 2 apples

**Scenario 3:** Roll = 0.3, Foraging skill = 5
- Entry 1 (apple, minRoll 0.2): Pass
- Entry 2 (apple, minRoll 0.4): Fail minRoll
- Entry 3 (apple, minRoll 0.2, skill 3+): Pass
- Result: 2 apples

## Encounter Tables

Each location has encounter tables for events during exploration.

### Encounter Entry Properties

| Property | Description |
|----------|-------------|
| encounterType | Wild Battle, NPC, Discovery, Event |
| probability | Chance of this encounter |
| levelRange | Min/max level offset from pet level |
| activityIds | List of activity IDs that can trigger this encounter |
| requirements | Conditions for this encounter to be possible |

### Encounter Types

| Type | Description |
|------|-------------|
| Wild Battle | Combat with wild pet (see [Battle](./battle.md)) |
| NPC Meeting | Dialogue/quest opportunity (see [Quests](./quests.md)) |
| Discovery | Find hidden location or item |
| Event | Random positive/negative occurrence |

### Wild Pet Level Calculation

```
wildLevel = areaBaseLevel + random(minOffset, maxOffset) + scalingFactor
scalingFactor = floor(playerPetLevel / scalingDivisor)
```

## Session Management

### Cancellation and Energy Refund

Exploration sessions can be cancelled at any time before completion. When an exploration session is cancelled:

- The pet returns to Idle state
- **Energy is fully refunded** to the pet
- No items are found
- No skill XP is awarded
- No cooldown is applied

## Exploration Rewards

### Completion Rewards

| Reward Type | Description |
|-------------|-------------|
| Items | Rolled from location's drop table based on activity |
| Skill XP | Awarded to skills in the activity's skillFactors (see [Skills](./skills.md)) |
| Currency | May be awarded based on activity and location |

### Battle Victory Rewards

| Reward Type | Description |
|-------------|-------------|
| Currency | Always awarded |
| Item Drop | Chance-based from encounter drop table |
| Skill XP | Awarded to relevant skills |
| Move Learning | Very rare chance |

### Discovery Rewards

- New location unlocked (see [Locations](./locations.md))
- Unique item granted
- Quest triggered
- Species unlock hint

### Event Outcomes

| Type | Examples |
|------|----------|
| Positive | Free items, temporary buffs, bonus XP |
| Negative | Energy drain, care stat reduction |

## Cooldowns

Cooldowns prevent repeated farming. Measured in ticks. Each activity can define its own cooldown duration in game data.

| Property | Description |
|----------|-------------|
| cooldownDuration | Ticks before this activity can be performed again at this location |

## Offline Behavior

Exploration continues offline. Session timers progress during offline time, and sessions complete when their duration is reached. See [Time](./time.md) for offline progression details.
