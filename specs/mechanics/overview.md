# Digital Pets - Game Overview

A browser-based HTML5 virtual pet raising game featuring turn-based 1v1 battles, with all logic running client-side and offline progression support.

## Core Concept

Players raise virtual pets from infancy to adulthood, caring for their needs, training their abilities, and engaging in strategic turn-based battles. Pets can die from neglect but not from battle defeat.

## Game Tick System

All time-based mechanics operate on **game ticks** (30 seconds each). This enables:
- Integer-based arithmetic (avoiding floating point)
- Consistent offline catch-up processing
- Deterministic game state

See [Time Mechanics](./mechanics/time.md) for details.

## Game Mechanics

### Pet Care
- **[Care System](./mechanics/care.md)** - Satiety, Hydration, Happiness, Poop management, and Care Life
- **[Items](./mechanics/items.md)** - Consumables, equipment, and inventory management

### Pet Development
- **[Pet Species](./mechanics/species.md)** - Species with unique stats, multipliers, and resistances
- **[Growth Stages](./mechanics/growth.md)** - Baby → Child → Teen → Young Adult → Adult progression

### Combat
- **[Battle System](./mechanics/battle.md)** - 1v1 turn-based combat with damage types and resistances
- **[Training](./mechanics/training.md)** - Facilities, stat improvement, and move learning

### Energy & Rest
- **[Energy](./mechanics/energy.md)** - Activity costs and regeneration
- **[Sleep](./mechanics/sleep.md)** - Rest mechanics and requirements

### World
- **[Locations](./mechanics/locations.md)** - Graph-based travel between areas
- **[Exploration](./mechanics/exploration.md)** - Foraging, encounters, and rewards
- **[Skills](./mechanics/skills.md)** - Non-battle skills for exploration and activities
- **[Quests](./mechanics/quests.md)** - NPC interactions and quest progression

### Systems
- **[Time Mechanics](./mechanics/time.md)** - Real-time progression with offline support

## Battle Stats

Six core attributes enable strategic depth in 1v1 combat:

| Stat | Purpose |
|------|---------|
| **Strength** | Physical damage output |
| **Endurance** | Health pool and damage mitigation |
| **Agility** | Turn order, dodge chance |
| **Precision** | Accuracy and critical hit chance |
| **Fortitude** | Status resistance and stamina pool |
| **Cunning** | Debuff effectiveness, counter-attack chance |

## Damage Types

Physical damage categories (no elemental type system):
- Slashing
- Piercing
- Crushing
- Chemical
- Thermal
- Electric

Each pet has resistances per damage type.

## Growth Stages

| Stage | Description |
|-------|-------------|
| Baby | Most fragile, limited activities |
| Child | Basic training and nearby exploration |
| Teen | Full battles, standard training |
| Young Adult | Advanced content, all areas |
| Adult | Full game access, endgame |

Target total progression time: ~12 months real time.

## Key Design Principles

1. **No Server Required** - All game state managed client-side
2. **Offline Progression** - Time continues when browser is closed
3. **Integer Arithmetic** - Micro-units avoid floating point
4. **Game Tick Based** - 30-second ticks for all time mechanics
5. **Meaningful Choices** - Care, training, and battle decisions matter
6. **Permadeath via Neglect** - Pets die from poor care, not battle
7. **Strategic Combat** - Damage types, resistances, and resource management

## Micro-Unit System

To avoid floating point, stats use internal micro-units:

| Display Value | Internal Value | Ratio |
|---------------|----------------|-------|
| 1 Satiety | 1000 microSatiety | 1000:1 |
| 1 Hydration | 1000 microHydration | 1000:1 |
| 1 Happiness | 1000 microHappiness | 1000:1 |
| 1 Energy | 1000 microEnergy | 1000:1 |

Display values are always `floor(microValue / 1000)`.

**Care Life** is a hidden stat that uses the same micro-magnitude but has no display conversion - the raw value is used directly for evaluations.
