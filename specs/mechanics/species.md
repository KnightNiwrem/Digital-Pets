# Pet Species

Different species have unique stat distributions, growth patterns, and care requirements.

## Species Attributes

Each species is defined by:

| Attribute | Description |
|-----------|-------------|
| **Growth Stages** | Array of per-stage stat definitions (see [Growth](./growth.md)) |
| **Resistance Profile** | Natural damage type resistances (see [Battle](./battle.md)) |
| **Archetype** | Classification describing playstyle |

## Stat Distribution Categories

Species fall into archetypes based on stat distribution:

| Archetype | Primary Stats | Playstyle |
|-----------|---------------|-----------|
| Balanced | Even distribution | Versatile |
| Glass Cannon | High Agility/Precision | Fast, critical-focused |
| Power Tank | High Strength/Endurance | Slow, high damage |
| Evasion | High Agility/Cunning | Dodge-focused |
| Defender | High Endurance/Fortitude | High survivability |
| Status | High Cunning/Precision | Debuff specialist |

## Per-Species Growth Stages

Each species defines its complete growth progression through an array of growth stage definitions. Every growth stage includes:

| Property | Description |
|----------|-------------|
| **stage** | Main stage (baby, child, teen, youngAdult, adult) |
| **subStage** | Substage number (typically 1-3, varies by species) |
| **name** | Display name (e.g., "Baby I", "Child II") |
| **minAgeTicks** | Minimum age to enter this stage |
| **baseStats** | Complete stat maximums for this stage |
| **minSleepTicks** | Sleep requirement for this stage (see [Sleep](./sleep.md)) |

### Base Stats Per Stage

Each growth stage defines all maximum stats:

```typescript
baseStats: {
  care: {
    satiety: MicroValue,   // Max satiety (see Care)
    hydration: MicroValue, // Max hydration (see Care)
    happiness: MicroValue  // Max happiness (see Care)
  },
  battle: {
    strength: number,      // Physical power (see Battle)
    endurance: number,     // Physical defense/stamina
    agility: number,       // Speed/evasion
    precision: number,     // Accuracy/critical
    fortitude: number,     // HP/overall resilience
    cunning: number        // Status/debuff effectiveness
  },
  energy: MicroValue,     // Max energy (see Energy)
  careLife: MicroValue    // Max care life (see Care)
}
```

### Species Variation

Species can vary in:

- **Number of substages**: Some species may have more or fewer substages per main stage
- **Stat progression curves**: Different species reach their peaks at different rates
- **Final adult stats**: Each species has unique maximum potential

## Bonus Max Stats

Pets can gain permanent bonus max stats from:

- Quest rewards (see [Quests](./quests.md))
- Special items (see [Items](./items.md))
- Events
- Achievements

These bonuses stack on top of the species growth stage base stats:

```typescript
totalMaxStat = speciesGrowthStage.baseStats + pet.bonusMaxStats
```

## Resistance Profile

Species have innate resistances to damage types:

| Resistance Level | Damage Reduction |
|------------------|------------------|
| None | 0% |
| Minor | 5-10% |
| Moderate | 15-20% |
| Strong | 25% |

Resistances are per damage type (Slashing, Piercing, Crushing, Chemical, Thermal, Electric). See [Battle](./battle.md) for damage type details.

## Species Unlocking

| Unlock Method | Description |
|---------------|-------------|
| Starting | Available at game start |
| Quest | Complete specific quest chain (see [Quests](./quests.md)) |
| Discovery | Find during exploration (see [Exploration](./exploration.md)) |
| Achievement | Reach certain milestones |

## Species Identity

Each species should have:

- Unique visual design
- Distinct stat profile
- Characteristic resistances
- Thematic move affinity
- Lore/background

## Balance Considerations

When defining species:

- Total adult stats should be comparable across species
- Higher stats in one area offset by lower in others
- Different growth curves create unique gameplay experiences
- No species should dominate all scenarios
- Each species should excel in specific situations
