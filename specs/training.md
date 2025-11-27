# Training System

Training improves battle stats and may unlock new moves at dedicated facilities.

## Energy System

Energy limits daily activities. All active tasks consume energy.

### Micro-Unit System for Energy

| Display Stat | Internal Unit | Ratio |
|--------------|---------------|-------|
| Energy | microEnergy | 1000:1 |

### Energy Maximum by Growth Stage

| Stage | Base Max (display) | Base Max (micro) |
|-------|-------------------|------------------|
| Baby | 50 | 50,000 |
| Child | 75 | 75,000 |
| Teen | 100 | 100,000 |
| Young Adult | 150 | 150,000 |
| Adult | 200 | 200,000 |

### Energy Regeneration

Energy regenerates per game tick:

| State | Regen per Tick (micro) |
|-------|------------------------|
| Awake | +40 |
| Sleeping | +120 |

This results in:
- Awake: ~4800 micro/hour = ~4.8 display/hour
- Sleeping: ~14400 micro/hour = ~14.4 display/hour

### Energy Costs

Activities consume energy (display values). Specific costs defined per activity.

| Activity Type | Typical Range |
|---------------|---------------|
| Light activity | 5-15 |
| Medium activity | 15-30 |
| Heavy activity | 30-50 |
| Travel | Per connection traversed |

## Sleep Mechanics

Sleeping pets regenerate energy faster but cannot perform other actions.

### Sleep Duration

Sleep is measured in ticks. Minimum sleep requirements vary by growth stage.

| Stage | Min Sleep (ticks) | Min Sleep (hours) |
|-------|-------------------|-------------------|
| Baby | 1920 | 16 |
| Child | 1680 | 14 |
| Teen | 1440 | 12 |
| Young Adult | 1200 | 10 |
| Adult | 960 | 8 |

### Sleep States

| State | Description |
|-------|-------------|
| Awake | Normal activities available |
| Sleeping | Energy regen ×3, care decay ×0.5 |
| Exhausted | Forced rest until energy threshold reached |

### Sleep Restrictions

While sleeping, pet cannot:
- Eat or drink
- Play
- Battle
- Explore or travel
- Train

Care stats continue to decay at reduced rate.

## Training Facilities

Different facilities exist across locations. Each specializes in specific battle stats.

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

### Training Sessions

Training sessions have:
- Duration (in ticks)
- Energy cost
- Stat gain (primary and secondary)
- Cooldown before next session

| Session Type | Duration (ticks) | Typical Energy |
|--------------|------------------|----------------|
| Basic | 120 (1 hour) | Low |
| Intensive | 240 (2 hours) | Medium |
| Advanced | 480 (4 hours) | High |

Advanced training may have growth stage requirements.

### Cancellation and Energy Refund

Training sessions can be cancelled at any time before completion. When a training session is cancelled:

- The pet returns to Idle state
- **Energy is fully refunded** to the pet
- No stat gains are awarded
- No cooldown is applied

### Training Modifiers

Training effectiveness may be modified by:
- Care stat thresholds (minimum required)
- Consecutive session penalties (fatigue)
- Facility variety bonuses
- Species affinities

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

## Stat Caps

Maximum trainable stat values increase with growth stages. Caps are defined as:
```
statCap = baseStatCap + (growthStage × stageBonusCap)
```

## Training Cooldowns

Cooldowns measured in ticks:

| Cooldown Type | Typical Range |
|---------------|---------------|
| Same facility | Longer |
| Different facility | Shorter |
| After intensive | Extended |

## Offline Training

Training continues offline. Session timers progress during offline time, and sessions complete when their duration is reached.