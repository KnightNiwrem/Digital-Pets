# Sleep Mechanics

Sleeping pets regenerate energy faster but cannot perform other actions.

## Sleep Duration

Sleep is measured in ticks. Minimum sleep requirements vary by growth stage. See [Time](./time.md) for tick definitions.

| Stage | Min Sleep (ticks) | Min Sleep (hours) |
|-------|-------------------|-------------------|
| Baby | 1920 | 16 |
| Child | 1680 | 14 |
| Teen | 1440 | 12 |
| Young Adult | 1200 | 10 |
| Adult | 960 | 8 |

See [Growth](./growth.md) for growth stage details.

## Sleep States

| State | Description |
|-------|-------------|
| Awake | Normal activities available |
| Sleeping | Energy regen ×3, care decay ×0.5 |
| Exhausted | Forced rest until energy threshold reached |

## Sleep Effects

When sleeping:

| Mechanic | Effect |
|----------|--------|
| Energy regeneration | ×3 normal rate (see [Energy](./energy.md)) |
| Care stat decay | ×0.5 normal rate (see [Care](./care.md)) |
| Poop generation | ×0.5 rate (see [Care](./care.md)) |

## Sleep Restrictions

While sleeping, pet cannot:
- Eat or drink (see [Items](./items.md))
- Play
- Battle (see [Battle](./battle.md))
- Explore or travel (see [Exploration](./exploration.md), [Locations](./locations.md))
- Train (see [Training](./training.md))

Care stats continue to decay at reduced rate.

## Waking Up

Pets can be woken up at any time, but:
- If minimum sleep requirement is not met, there may be penalties
- Exhausted pets cannot be woken until energy threshold is reached

## Offline Sleep

Sleep continues during offline time. Sleep timers progress and complete when their duration is reached. See [Time](./time.md) for offline progression details.
