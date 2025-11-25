# Skills System

Non-battle skills determine proficiency in exploration, foraging, and other activities.

## Skill List

| Skill | Primary Use |
|-------|-------------|
| **Foraging** | Gathering items from locations |
| **Scouting** | Finding encounters, avoiding danger |
| **Crafting** | Creating items from materials |
| **Trading** | Better prices at shops |
| **Taming** | NPC pet interactions |

## Skill Levels

Skills have a maximum level cap. Higher levels unlock content and improve effectiveness.

| Tier | Description |
|------|-------------|
| Novice | Basic activities only |
| Apprentice | Standard activities |
| Journeyman | Advanced activities |
| Expert | Expert activities |
| Master | All activities, best rates |

Level ranges per tier are defined in game data.

## Experience and Leveling

### XP Requirements

XP required per level increases progressively. Formula:
```
xpToLevel(n) = baseXP × n × (n + 1) / 2
```

### XP Sources

Skills gain XP from related activities:

| Skill | XP Sources |
|-------|------------|
| Foraging | Foraging activities |
| Scouting | Scouting, exploration |
| Crafting | Crafting items |
| Trading | Shop transactions |
| Taming | NPC interactions |

### XP Modifiers

| Condition | Effect |
|-----------|--------|
| First time in new area | Bonus multiplier |
| Activity matches difficulty | Normal XP |
| Activity too easy | Reduced XP |
| Rested bonus | Bonus multiplier |

## Skill Effects

### Foraging

Higher levels provide:
- Increased drop rates
- Access to rarer items (skill-gated)
- Bonus item chance at high levels

### Scouting

Higher levels provide:
- Pre-battle information (enemy stats)
- Option to avoid encounters
- Increased rare encounter rates
- Reward preview

### Crafting

Higher levels provide:
- Better craft quality
- New recipe unlocks
- Bonus output chance
- Masterwork chance at high levels

### Trading

Higher levels provide:
- Better buy/sell prices
- Bulk discounts
- Rare stock access
- Special order unlocking

### Taming

Higher levels provide:
- Better NPC dialogue options
- Access to taming quests
- Temporary ally options
- Extended ally duration

## Skill Training Methods

### Passive Training

Skills level up by performing related activities. This is the primary leveling method.

### Active Training

Some locations have skill trainers:

| Trainer Property | Description |
|-----------------|-------------|
| skill | Skill that can be trained |
| cost | Currency cost per session |
| duration | Time required (ticks) |
| xpGranted | XP awarded on completion |
| dailyLimit | How often trainer can be used |

## Skill Synergies

Some activities benefit from multiple skills:

| Synergy | Effect |
|---------|--------|
| Foraging + Scouting | Deep exploration bonus |
| Trading + Scouting | Better rare item shop availability |
| Scouting + Taming | Befriend option in encounters |