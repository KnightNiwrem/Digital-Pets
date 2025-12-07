# Care System

The care system governs pet well-being through visible care stats and a hidden Care Life value.

## Game Tick

All time-based mechanics operate on **game ticks**. See [Time](./time.md) for details.

## Care Stats

Three primary stats reflect immediate pet needs:

| Stat | Description |
|------|-------------|
| **Satiety** | Hunger level |
| **Hydration** | Thirst level |
| **Happiness** | Mood/contentment |

### Micro-Unit System

To avoid floating point arithmetic, care stats use internal micro-units:

| Display Stat | Internal Unit | Ratio |
|--------------|---------------|-------|
| Satiety | microSatiety | 1000:1 |
| Hydration | microHydration | 1000:1 |
| Happiness | microHappiness | 1000:1 |

**Display Value Calculation:**
```
displayValue = ceil(microValue / 1000)
```

This uses ceiling rounding, meaning any remaining micro-units round up to the next display value. For example, a microSatiety of 50,001 produces a display value of 51.

A stat is considered 0 only when its micro-value is exactly 0.

### Stat Maximum by Species and Growth Stage

Each species defines maximum stat values for every growth stage. Stats can vary independently:

```typescript
// Example: A species' baby stage might have
care: {
  satiety: 50_000,   // Max satiety in micro-units
  hydration: 50_000, // Max hydration
  happiness: 45_000  // Slightly lower happiness cap
}
```

The total max for a pet is calculated as:
```
totalMaxStat = speciesGrowthStageMax + bonusMaxStats
```

Where `bonusMaxStats` come from items, quests, or events.

### Typical Progression

Stats generally increase as pets grow:

| Stage | Typical Care Max Range (display) |
|-------|----------------------------------|
| Baby | 40-60 |
| Child | 70-90 |
| Teen | 100-130 |
| Young Adult | 140-170 |
| Adult | 180-220 |

Actual values vary by species. See [Species](./species.md) and [Growth](./growth.md) for details.

### Decay Rates

Care stats decay at constant rates per game tick:

| State | Decay per Tick (micro) |
|-------|------------------------|
| Awake | -50 |
| Sleeping | -25 |

This results in:
- Awake: -6000 micro/hour = -6 display/hour
- Sleeping: -3000 micro/hour = -3 display/hour

See [Sleep](./sleep.md) for sleep state details.

## Poop System

Poop accumulates over time and must be cleaned by the player using cleaning items.

### Poop Generation

Poop generation uses a decay-rate system to handle mid-cycle state changes:

| State | Effective Time to Poop |
|-------|------------------------|
| Awake | 480 ticks (4 hours) |
| Sleeping | 960 ticks (8 hours) |

**Implementation:**
- Timer uses a micro-threshold of 960 units
- Awake state: decays 2 units per tick (960/2 = 480 ticks)
- Sleeping state: decays 1 unit per tick (960/1 = 960 ticks)

This ensures that going to sleep mid-cycle properly extends the remaining time. For example, if the timer is half-depleted (480 units remaining):
- Staying awake: 480/2 = 240 more ticks until poop
- Going to sleep: 480/1 = 480 more ticks until poop

Each feeding item consumed reduces the poop timer by a specified amount (typically 60-120 micro-units).

### Poop Effects

Uncleaned poop affects Happiness decay:

| Poop Count | Happiness Decay Multiplier |
|------------|---------------------------|
| 0-2 | ×1 (normal) |
| 3-4 | ×1.5 |
| 5-6 | ×2 |
| 7+ | ×3, Care Life drains faster |

### Cleaning

Cleaning requires **cleaning items**. Each cleaning item has a `poopRemoved` property indicating how much poop it removes. Multiple items may be needed to fully clean a pet with lots of poop.

```
remainingPoop = currentPoop - item.poopRemoved
```

See [Items](./items.md) for cleaning item details.

## Care Life (Hidden Stat)

A hidden value representing overall pet health. When Care Life reaches 0, the pet dies permanently.

Care Life uses the same micro-magnitude as other stats but has no display conversion since it is never shown to the player. The raw value is used directly for all evaluations.

### Care Life Maximum by Growth Stage

| Stage | Max Care Life |
|-------|---------------|
| Baby | 72,000 (~72 hours) |
| Child | 120,000 (~120 hours) |
| Teen | 168,000 (~168 hours) |
| Young Adult | 240,000 (~240 hours) |
| Adult | 336,000 (~336 hours) |

### Care Life Drain

Care Life drains when any care stat display value is 0:

| Condition | Drain per Tick |
|-----------|----------------|
| 1 stat at 0 | -8 |
| 2 stats at 0 | -25 |
| 3 stats at 0 | -50 |
| 7+ poop | Additional -8 |

### Care Life Recovery

When all care stats are above threshold percentages:

| Condition | Recovery per Tick |
|-----------|-------------------|
| All stats > 50% max | +8 |
| All stats > 75% max | +16 |
| All stats = 100% max | +25 |

Care Life cannot exceed its maximum for the current growth stage.

## Care Thresholds

Care stat percentages define pet states (for UI/feedback purposes):

| Percentage | State |
|------------|-------|
| 76-100% | Content |
| 51-75% | Okay |
| 26-50% | Uncomfortable |
| 1-25% | Distressed |
| 0% | Critical |

## Tick Processing Order

When processing ticks (including offline catch-up), the order is:

1. Care Life drain/recovery evaluation
2. Energy regeneration
3. Poop generation check
4. Care stat decay
5. Other mechanics (growth, etc.)

See [Time](./time.md) for full tick processing details.

## Interactions with Other Systems

- **[Sleep](./sleep.md)**: Reduced decay rates, pet cannot eat/drink/play
- **[Training](./training.md)**: Requires minimum care thresholds to begin
- **[Battle](./battle.md)**: Cannot participate if any care stat is critical
- **[Items](./items.md)**: Primary method for restoring care stats
