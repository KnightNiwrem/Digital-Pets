# Care System

The care system governs pet well-being through visible care stats and a hidden Care Life value.

## Game Tick

All time-based mechanics operate on **game ticks**. One game tick = 30 seconds real time.

- 1 minute = 2 ticks
- 1 hour = 120 ticks
- 1 day = 2880 ticks

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
displayValue = floor(microValue / 1000)
```

A stat is considered 0 when its display value is 0, even if micro-value is greater than 0.

### Stat Maximum by Growth Stage

Base maximum is consistent across all care stats per growth stage. Species Care Cap Multiplier modifies these values.

| Stage | Base Max (display) | Base Max (micro) |
|-------|-------------------|------------------|
| Baby | 50 | 50,000 |
| Child | 80 | 80,000 |
| Teen | 120 | 120,000 |
| Young Adult | 160 | 160,000 |
| Adult | 200 | 200,000 |

**Actual Maximum Calculation:**
```
actualMax = floor(baseMax × speciesCareCapMultiplier)
```

### Decay Rates

Care stats decay at constant rates per game tick:

| State | Decay per Tick (micro) |
|-------|------------------------|
| Awake | -50 |
| Sleeping | -25 |

This results in:
- Awake: -6000 micro/hour = -6 display/hour
- Sleeping: -3000 micro/hour = -3 display/hour

## Poop System

Poop accumulates over time and must be cleaned by the player using cleaning items.

### Poop Generation

| State | Ticks Between Poop |
|-------|-------------------|
| Awake | 480 ticks (4 hours) |
| Sleeping | 960 ticks (8 hours) |

Each feeding item consumed reduces the next poop timer by 60 ticks (30 minutes).

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

## Interactions with Other Systems

- **Sleep**: Reduced decay rates, pet cannot eat/drink/play
- **Training**: Requires minimum care thresholds to begin
- **Battle**: Cannot participate if any care stat is critical
- **Items**: Primary method for restoring care stats