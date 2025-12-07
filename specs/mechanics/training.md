# Training System

Training improves battle stats and may unlock new moves at dedicated facilities.

## Training Facilities

Different facilities exist across locations. Each specializes in specific battle stats. See [Locations](./locations.md) for facility locations.

### Facility Types

Facilities train primary and secondary battle stats:

| Facility Type | Primary Stat | Secondary Stat |
|---------------|-------------|----------------|
| Strength | Strength | Endurance |
| Endurance | Endurance | Fortitude |
| Agility | Agility | Precision |
| Precision | Precision | Cunning |
| Fortitude | Fortitude | Cunning |
| Cunning | Cunning | Precision |

See [Battle](./battle.md) for battle stat details.

### Training Sessions

Training sessions have:
- Duration (in ticks, see [Time](./time.md))
- Energy cost (see [Energy](./energy.md))
- Stat gain (primary and secondary)
- Cooldown before next session

| Session Type | Duration (ticks) | Typical Energy |
|--------------|------------------|----------------|
| Basic | 120 (1 hour) | Low |
| Intensive | 240 (2 hours) | Medium |
| Advanced | 480 (4 hours) | High |

Advanced training may have growth stage requirements (see [Growth](./growth.md)).

### Cancellation and Energy Refund

Training sessions can be cancelled at any time before completion. When a training session is cancelled:

- The pet returns to Idle state
- **Energy is fully refunded** to the pet
- No stat gains are awarded
- No cooldown is applied

### Training Modifiers

Training effectiveness may be modified by:
- Care stat thresholds (minimum required, see [Care](./care.md))
- Consecutive session penalties (fatigue)
- Facility variety bonuses
- Species affinities (see [Species](./species.md))

## Move Learning

Training has a chance to learn new moves. Probability varies by:
- Training duration/intensity
- Facility type
- Current moveset
- Species affinity

Move learned is selected from eligible moves based on:
- Facility type
- Pet's current stats
- Species

See [Battle](./battle.md) for move details.

## Stat Caps

Maximum trainable stat values increase with growth stages. Caps are defined as:
```
statCap = baseStatCap + (growthStage × stageBonusCap)
```

See [Growth](./growth.md) for growth stage details.

## Training Cooldowns

Cooldowns measured in ticks:

| Cooldown Type | Typical Range |
|---------------|---------------|
| Same facility | Longer |
| Different facility | Shorter |
| After intensive | Extended |

## Offline Training

Training continues offline. Session timers progress during offline time, and sessions complete when their duration is reached. See [Time](./time.md) for offline progression details.
