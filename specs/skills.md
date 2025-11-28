# Skills System

Non-battle skills determine proficiency in exploration, foraging, and other activities.

## Skill List

| Skill | Primary Use |
|-------|-------------|
| **Foraging** | Gathering plants, herbs, and general items from locations |
| **Mining** | Extracting ores, stones, and minerals |
| **Fishing** | Catching fish and aquatic resources |
| **Scouting** | Finding encounters, avoiding danger |
| **Crafting** | Creating items from materials |
| **Trading** | Better prices at shops |
| **Social** | NPC interactions and quest rewards |

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
| Foraging | Foraging plants, herbs, general gathering |
| Mining | Mining ores and minerals |
| Fishing | Fishing activities |
| Scouting | Scouting, exploration |
| Crafting | Crafting items |
| Trading | Shop transactions |
| Social | Completing NPC-given quests, dialogue interactions |

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
- Increased drop rates for plants and herbs
- Access to rarer foraged items (skill-gated)
- Bonus item chance at high levels

### Mining

Higher levels provide:
- Increased ore and mineral drop rates
- Access to rarer ores (skill-gated)
- Bonus ore chance at high levels
- Faster mining speed

### Fishing

Higher levels provide:
- Increased fish catch rates
- Access to rarer fish species (skill-gated)
- Bonus catch chance at high levels
- Better quality fish

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

### Social

Higher levels provide:
- Better NPC dialogue options
- Improved quest rewards
- Access to exclusive quests
- Reputation bonuses with NPCs

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
| Mining + Scouting | Find hidden mineral deposits |
| Fishing + Scouting | Locate prime fishing spots |
| Trading + Scouting | Better rare item shop availability |
| Scouting + Social | Befriend option in encounters |