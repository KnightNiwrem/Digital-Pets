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
| substageCount | Number of substages per stage |
| substageTransition | Triggers visual/notification updates |
| statGains | Minor gains at substage transitions |

## Stage Characteristics

Each growth stage affects:

| Property | How It Changes |
|----------|----------------|
| Max Energy | Increases with stage |
| Max Care Life | Increases with stage |
| Care Stat Max | Base max increases per stage |
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

## Care and Energy by Stage

### Base Care Stat Maximum

Consistent base across all care stats per stage (before species multiplier applied).

| Stage | Base Max (display) | Base Max (micro) |
|-------|-------------------|------------------|
| Baby | 50 | 50,000 |
| Child | 80 | 80,000 |
| Teen | 120 | 120,000 |
| Young Adult | 160 | 160,000 |
| Adult | 200 | 200,000 |

### Base Energy Maximum

| Stage | Base Max (display) | Base Max (micro) |
|-------|-------------------|------------------|
| Baby | 50 | 50,000 |
| Child | 75 | 75,000 |
| Teen | 100 | 100,000 |
| Young Adult | 150 | 150,000 |
| Adult | 200 | 200,000 |

### Care Life Maximum

| Stage | Max Care Life (hours) | Max (micro) |
|-------|----------------------|-------------|
| Baby | 72 | 72,000 |
| Child | 120 | 120,000 |
| Teen | 168 | 168,000 |
| Young Adult | 240 | 240,000 |
| Adult | 336 | 336,000 |

## Battle Stat Growth

At each main stage transition, pets receive battle stat increases based on species growth rates.

See [Pet Species](./pet-species.md) for growth rate mechanics.

## Sleep Requirements

Minimum sleep per day decreases as pets mature.

| Stage | Typical Requirement |
|-------|---------------------|
| Baby | Highest |
| Child | High |
| Teen | Moderate |
| Young Adult | Low |
| Adult | Lowest |

Specific values defined in game data.

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

1. Stats updated (care max, energy max, battle stats)
2. New abilities unlocked
3. Visual appearance changes
4. Notification displayed
5. Stage-locked content becomes available

## Age Calculation

```
currentAge = currentTime - petBirthTime (in ticks)
currentStage = lookupStage(currentAge)
```

Offline progression applies - pets continue aging when browser is closed.