# Exploration System

Exploration allows pets to forage for items and encounter wild pets or events.

## Exploration Activities

### Foraging

Searching an area for gatherable plants, herbs, and general resources.

| Property | Description |
|----------|-------------|
| Duration | Measured in ticks |
| Energy Cost | Consumes energy |
| Skill Used | Foraging skill level affects results |

### Mining

Extracting ores, stones, and minerals from rocky areas.

| Property | Description |
|----------|-------------|
| Duration | Measured in ticks |
| Energy Cost | Consumes energy |
| Skill Used | Mining skill level affects results |
| Requirement | Location must have minable deposits |

### Fishing

Catching fish and aquatic resources from water sources.

| Property | Description |
|----------|-------------|
| Duration | Measured in ticks |
| Energy Cost | Consumes energy |
| Skill Used | Fishing skill level affects results |
| Requirement | Location must have water source |

### Scouting

Searching for encounters and events.

| Property | Description |
|----------|-------------|
| Duration | Measured in ticks (longer than foraging) |
| Energy Cost | Higher than foraging |
| Skill Used | Scouting skill level affects results |

### Deep Exploration

Thorough exploration for rare finds.

| Property | Description |
|----------|-------------|
| Duration | Measured in ticks (longest) |
| Energy Cost | Highest |
| Skills Used | Foraging, Mining, Fishing, and Scouting |
| Requirement | Minimum skill levels per location |

## Forage Tables

Each location has unique forage tables defining possible item drops.

### Forage Entry Properties

| Property | Description |
|----------|-------------|
| itemId | Item that can drop |
| baseDropRate | Probability before modifiers |
| rarity | Item rarity tier |
| minSkillLevel | Minimum Foraging skill required |

### Drop Rate Calculation

```
effectiveRate = baseDropRate × (1 + skillBonus) × modifiers
```

Where:
- skillBonus = Foraging skill level × bonus per level
- modifiers = weather, species bonuses, equipment, etc.

### Skill-Gated Items

Items with minSkillLevel > 0 are invisible in results if player skill is too low.

```
canDrop = playerForagingSkill >= item.minSkillLevel
```

## Encounter Tables

Each location has encounter tables for events during exploration.

### Encounter Entry Properties

| Property | Description |
|----------|-------------|
| encounterType | Wild Battle, NPC, Discovery, Event |
| probability | Chance of this encounter |
| levelRange | Min/max level offset from pet level |
| conditions | Optional requirements |

### Encounter Types

| Type | Description |
|------|-------------|
| Wild Battle | Combat with wild pet |
| NPC Meeting | Dialogue/quest opportunity |
| Discovery | Find hidden location or item |
| Event | Random positive/negative occurrence |

### Encounter Probability by Activity

| Activity | Base Encounter Chance |
|----------|----------------------|
| Foraging | Low |
| Scouting | Medium |
| Deep Exploration | High |

### Cancellation and Energy Refund

Exploration sessions can be cancelled at any time before completion. When an exploration session is cancelled:

- The pet returns to Idle state
- **Energy is fully refunded** to the pet
- No items are found
- No skill XP is awarded
- No cooldown is applied

### Wild Pet Level Calculation

```
wildLevel = areaBaseLevel + random(minOffset, maxOffset) + scalingFactor
scalingFactor = floor(playerPetLevel / scalingDivisor)
```

## Skill Requirements by Location

Locations can require minimum skill levels:

| Property | Description |
|----------|-------------|
| minForaging | Foraging level to forage here |
| minMining | Mining level to mine here |
| minFishing | Fishing level to fish here |
| minScouting | Scouting level to scout here |
| minDeepExplore | Combined requirement for deep exploration |

Players cannot perform activities below the skill requirement.

## Exploration Rewards

### Battle Victory Rewards

| Reward Type | Description |
|-------------|-------------|
| Currency | Always awarded |
| Item Drop | Chance-based from drop table |
| Skill XP | Scouting XP |
| Move Learning | Very rare chance |

### Discovery Rewards

- New location unlocked
- Unique item granted
- Quest triggered
- Species unlock hint

### Event Outcomes

| Type | Examples |
|------|----------|
| Positive | Free items, temporary buffs, bonus XP |
| Negative | Energy drain, care stat reduction |

## Cooldowns

Cooldowns prevent repeated farming. Measured in ticks.

| Cooldown Type | Description |
|---------------|-------------|
| Same area forage | After foraging completes |
| Same area scout | After scouting completes |
| Deep exploration | Longest cooldown |

## Offline Behavior

Exploration continues offline. Session timers progress during offline time, and sessions complete when their duration is reached.