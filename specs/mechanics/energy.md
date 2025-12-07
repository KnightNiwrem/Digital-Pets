# Energy System

Energy limits daily activities. All active tasks consume energy.

## Micro-Unit System for Energy

| Display Stat | Internal Unit | Ratio |
|--------------|---------------|-------|
| Energy | microEnergy | 1000:1 |

## Energy Maximum by Growth Stage

| Stage | Base Max (display) | Base Max (micro) |
|-------|-------------------|------------------|
| Baby | 50 | 50,000 |
| Child | 75 | 75,000 |
| Teen | 100 | 100,000 |
| Young Adult | 150 | 150,000 |
| Adult | 200 | 200,000 |

See [Growth](./growth.md) for growth stage details.

## Energy Regeneration

Energy regenerates per game tick:

| State | Regen per Tick (micro) |
|-------|------------------------|
| Awake | +40 |
| Sleeping | +120 |

This results in:
- Awake: ~4800 micro/hour = ~4.8 display/hour
- Sleeping: ~14400 micro/hour = ~14.4 display/hour

See [Sleep](./sleep.md) for sleep mechanics.

## Energy Costs

Activities consume energy (display values). Specific costs defined per activity.

| Activity Type | Typical Range |
|---------------|---------------|
| Light activity | 5-15 |
| Medium activity | 15-30 |
| Heavy activity | 30-50 |
| Travel | Per connection traversed |

### Activity Energy Costs

- **[Training](./training.md)**: Consumes energy based on session type
- **[Exploration](./exploration.md)**: Consumes energy based on activity type
- **[Travel](./locations.md)**: Consumes energy per edge traversed

## Exhaustion

Pets can enter exhausted state when:
- Energy drops too low
- Defeated in battle (see [Battle](./battle.md))

See [Sleep](./sleep.md) for a description of pet states including `Awake`, `Sleeping`, and `Exhausted`.
