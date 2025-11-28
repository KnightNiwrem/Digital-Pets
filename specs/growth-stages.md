# Growth Stages

Pets progress through five growth stages over approximately 12 months of real time.

## Stage Names

| Stage | Description |
|-------|-------------|
| Baby | Newly hatched, fragile |
| Child | Growing, learning basics |
| Teen | Developing independence |
| Young Adult | Maturing, near full capability |
| Adult | Fully grown |

## Stage Progression

Stages are reached based on accumulated age (in ticks). Specific durations defined in game data, targeting approximately 12 months total to reach Adult.

### Substages

Each main stage has substages (e.g., Baby 1, Baby 2, Baby 3) to maintain sense of progress.

| Property | Description |
|----------|-------------|
| substageCount | Number of substages per stage (varies by species) |
| substageTransition | Triggers visual/notification updates |
| statGains | Stats increase based on species growth stage definitions |

**Species Variation:** Different species may have different numbers of substages.

## Stage Characteristics

Each growth stage affects:

| Property | How It Changes |
|----------|----------------|
| Max Stats | All stats defined per species per stage |
| Battle Eligibility | Unlocks progressively |
| Training Eligibility | Unlocks progressively |
| Exploration Access | Expands with stage |
| Sleep Requirements | Decreases with maturity |

### Progression Overview

| Stage | Characteristics |
|-------|-----------------|
| Baby | Most fragile, limited activities, high sleep needs |
| Child | Basic training/battles, nearby exploration |
| Teen | Full battle system, standard training, most areas |
| Young Adult | Advanced content, all training, all areas |
| Adult | Full game access, endgame content |

## Per-Species Growth Stage Definition

Each species defines every growth stage with complete stat values:

```typescript
{
  stage: "baby",      // Main growth stage
  subStage: 1,        // Substage number
  name: "Baby I",     // Display name
  minAgeTicks: 0,     // Minimum age to enter this stage
  baseStats: {
    care: {
      satiety: 50_000,
      hydration: 50_000,
      happiness: 45_000
    },
    battle: {
      strength: 10,      // Physical power
      endurance: 10,     // Physical defense/stamina
      agility: 10,       // Speed/evasion
      precision: 10,     // Accuracy/critical
      fortitude: 10,     // HP/overall resilience
      cunning: 10        // Status/debuff effectiveness
    },
    energy: 50_000,
    careLife: 72_000
  },
  minSleepTicks: 480  // Minimum sleep per day
}
```

## Typical Stat Ranges by Stage

While actual values vary by species, typical ranges are:

### Care Stats (micro-units)

| Stage | Typical Range |
|-------|---------------|
| Baby | 40,000 - 60,000 |
| Child | 70,000 - 90,000 |
| Teen | 100,000 - 130,000 |
| Young Adult | 140,000 - 170,000 |
| Adult | 180,000 - 220,000 |

### Energy (micro-units)

| Stage | Typical Range |
|-------|---------------|
| Baby | 40,000 - 60,000 |
| Child | 65,000 - 85,000 |
| Teen | 90,000 - 110,000 |
| Young Adult | 130,000 - 160,000 |
| Adult | 180,000 - 220,000 |

### Care Life (hours in micro-units)

| Stage | Typical Range |
|-------|---------------|
| Baby | 60,000 - 84,000 |
| Child | 100,000 - 140,000 |
| Teen | 150,000 - 190,000 |
| Young Adult | 220,000 - 260,000 |
| Adult | 300,000 - 370,000 |

## Bonus Max Stats

Pets can gain permanent bonus max stats that stack on top of species growth stage values:

```typescript
totalMax = speciesGrowthStage.baseStats + pet.bonusMaxStats
```

Bonus max stats can come from:
- Quest rewards
- Special items
- Events
- Achievements

## Sleep Requirements

Minimum sleep per day decreases as pets mature.

| Stage | Typical Requirement |
|-------|---------------------|
| Baby | Highest |
| Child | High |
| Teen | Moderate |
| Young Adult | Low |
| Adult | Lowest |

Specific values defined per species per growth stage.

## Content Unlocks by Stage

| Content | Baby | Child | Teen | Young Adult | Adult |
|---------|------|-------|------|-------------|-------|
| Basic Care | ✓ | ✓ | ✓ | ✓ | ✓ |
| Home Activities | ✓ | ✓ | ✓ | ✓ | ✓ |
| Basic Training | | ✓ | ✓ | ✓ | ✓ |
| Tutorial Battles | | ✓ | ✓ | ✓ | ✓ |
| Full Battles | | | ✓ | ✓ | ✓ |
| Ranked Battles | | | | ✓ | ✓ |
| Standard Training | | | ✓ | ✓ | ✓ |
| Advanced Training | | | | ✓ | ✓ |
| Nearby Exploration | | ✓ | ✓ | ✓ | ✓ |
| Most Exploration | | | ✓ | ✓ | ✓ |
| All Exploration | | | | ✓ | ✓ |
| Endgame Content | | | | | ✓ |

## Growth Progress

Players can view:
- Current stage and substage
- Ticks/time until next substage
- Ticks/time until next main stage
- Total age
- Visual growth indicator

## Stage Transition

When advancing stages:

1. Stats updated based on new species growth stage definition
2. New abilities unlocked
3. Visual appearance changes
4. Notification displayed
5. Stage-locked content becomes available

## Age Calculation

```
currentAge = currentTime - petBirthTime (in ticks)
currentStage = getSpeciesGrowthStage(speciesId, currentAge)
```

Offline progression applies - pets continue aging when browser is closed.