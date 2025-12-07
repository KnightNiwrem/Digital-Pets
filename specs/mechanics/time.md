# Time Mechanics

The game operates on real time with offline progression when the browser is closed.

## Game Tick System

All time-based mechanics operate on **game ticks**.

| Unit | Value |
|------|-------|
| 1 tick | 30 seconds |
| 1 minute | 2 ticks |
| 1 hour | 120 ticks |
| 1 day | 2880 ticks |

Game ticks provide:
- Consistent timing across all mechanics
- Integer-based calculations (no floating point)
- Efficient offline catch-up processing

## Time System

### Real Time Basis

All time-based mechanics use real-world time:
- 1 game hour = 1 real hour
- 1 game day = 1 real day

### Active Play

When the browser is open and the game is running:
- Game tick runs every 30 seconds
- All mechanics update per tick
- UI reflects current state

### Offline Progression

When the browser is closed:
- Time continues to pass
- On return, elapsed ticks are calculated and processed
- All mechanics continue (nothing pauses)

## Tick Processing Order

Each tick processes mechanics in this specific order:

1. **Care Life drain/recovery** - Evaluate based on current care stat state (see [Care](./care.md))
2. **Energy regeneration** - Add energy based on awake/sleeping state (see [Energy](./energy.md))
3. **Poop generation check** - Decrement poop timer, generate if ready (see [Care](./care.md))
4. **Care stat decay** - Reduce Satiety, Hydration, Happiness (see [Care](./care.md))
5. **Sleep timer progress** - If sleeping, accumulate sleep time (see [Sleep](./sleep.md))
6. **Growth stage time** - Accumulate age, check stage transitions (see [Growth](./growth.md))
7. **Activity timers** - Progress any ongoing activities

## Offline Calculation

On returning to the game:

```
elapsedSeconds = currentTime - lastSaveTime
elapsedTicks = floor(elapsedSeconds / 30)
for i = 1 to elapsedTicks:
    processTick()
```

### Batch Processing

For performance with large tick counts, batch processing may optimize calculations without changing results:

```
if elapsedTicks > batchThreshold:
    batchProcess(elapsedTicks)  // Mathematically equivalent
else:
    for each tick:
        processTick()
```

## Time Caps

To prevent extreme scenarios while still allowing for meaningful consequences:

| Mechanic | Maximum Offline Ticks |
|----------|----------------------|
| All systems | 86,400 ticks (30 days) |
| Poop generation | 50 poop max |
| Energy regen | Up to maximum only |

The 30-day cap applies universally to all offline processing (care, growth, training, exploration). This ensures that neglected adult pets can still die, while preventing extreme data processing loads.

## Timestamps

Key timestamps stored (as Unix timestamps or equivalent integer):

| Timestamp | Purpose |
|-----------|---------|
| lastSaveTime | Calculate offline progression |
| petBirthTime | Calculate age and growth stage (see [Growth](./growth.md)) |
| sleepStartTime | Calculate sleep duration (see [Sleep](./sleep.md)) |
| activityStartTime | Track ongoing activities |
| nextPoopTime | Track poop generation timer (see [Care](./care.md)) |

## Activity Duration

Activities measured in ticks:

| Activity Type | Example Duration |
|---------------|------------------|
| Short | 60-120 ticks (30-60 min) |
| Medium | 120-240 ticks (1-2 hours) |
| Long | 240-480 ticks (2-4 hours) |

Specific durations defined per activity type in game data.

## Cooldown Timers

Cooldowns measured in ticks and continue offline:

| Timer Type | Behavior |
|------------|----------|
| Activity cooldown | Continues offline |
| Shop restock | Continues offline |
| Daily reset | Real time at midnight local |

## Schedule Events

Certain events trigger at specific real-world times:

| Event | Trigger |
|-------|---------|
| Daily reset | Midnight local time |
| Weekly reset | Sunday midnight local |

See [Quests](./quests.md) for daily and weekly quest resets.

## Tick Event System

Game state updates happen exclusively through tick processing, ensuring:
- Deterministic behavior
- Reproducible offline calculations
- Consistent state across save/load
