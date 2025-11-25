# Locations System

The world is structured as a connected graph of locations that pets can travel between.

## World Structure

Locations are nodes connected by edges. Travel follows edges between connected locations.

```mermaid
graph TD
    Home[Home Base]
    Area1[Location 1]
    Area2[Location 2]
    Area3[Location 3]
    Town[Town Location]
    
    Home --- Area1
    Area1 --- Area2
    Area1 --- Town
    Area2 --- Area3
    Town --- Area3
```

Actual world graph is defined in game data.

## Location Properties

Each location has:

| Property | Description |
|----------|-------------|
| id | Unique identifier |
| name | Display name |
| type | Location type |
| connections | Array of connected location IDs |
| levelRange | Min/max encounter levels |
| requirements | Unlock conditions |
| facilities | Available buildings/features |
| forageTable | Reference to forage data |
| encounterTable | Reference to encounter data |
| npcs | Array of NPC IDs present |

## Location Types

### Home

Starting location with basic pet care facilities.

| Characteristic | Description |
|----------------|-------------|
| Safety | No encounters |
| Access | Always accessible |
| Facilities | Basic care, storage |

### Town

Social hubs with shops and services.

| Characteristic | Description |
|----------------|-------------|
| Safety | No wild encounters |
| NPCs | Merchants, trainers, quest givers |
| Facilities | Shops, training, services |

### Wild

Exploration areas with foraging and encounters.

| Characteristic | Description |
|----------------|-------------|
| Activities | Foraging, scouting, battles |
| Danger | Wild encounters possible |
| Requirements | May have skill/stage requirements |

### Dungeon

Challenge areas with difficult content.

| Characteristic | Description |
|----------------|-------------|
| Difficulty | High-level encounters |
| Rewards | Rare loot, quest objectives |
| Requirements | Typically late-game access |

## Travel System

### Travel Cost

Travel consumes energy per edge traversed.

| Factor | Effect |
|--------|--------|
| Base cost | Per edge traveled |
| Terrain modifier | Some edges cost more |
| Multi-hop | Accumulates per edge |

### Path Finding

When traveling multiple edges:
```
totalCost = sum of (baseCost × terrainModifier) for each edge
```

### Travel Restrictions

| Restriction | Check |
|-------------|-------|
| Growth stage | Some locations locked by stage |
| Quest progress | Some require quest completion |
| Skill level | Some require minimum skills |
| Energy | Cannot travel with insufficient energy |
| Sleep | Cannot travel while sleeping |

## Location Facilities

### Home Facilities

| Facility | Function |
|----------|----------|
| Rest Area | Sleep, energy recovery |
| Food Station | Feed pet |
| Water Station | Hydrate pet |
| Play Area | Happiness activities |
| Storage | Store items |

### Town Facilities

| Facility | Function |
|----------|----------|
| Shop | Buy and sell items |
| Trainer | Train battle stats |
| Inn | Rest and recover |
| Quest Board | Accept quests |

### Wild Facilities

| Facility | Function |
|----------|----------|
| Rest Point | Partial recovery |
| Forage Zone | Gather items |
| Battle Area | Find encounters |

## Discovery System

Hidden locations can be discovered through:

| Method | Description |
|--------|-------------|
| High Scouting | Skill check during exploration |
| Quest Completion | Reveal through quest rewards |
| Random Events | Exploration event outcomes |
| NPC Hints | Dialogue options |

Discovered locations are permanently added to the player's map.

## Location Requirements

### Requirement Types

| Type | Description |
|------|-------------|
| stage | Minimum growth stage |
| quest | Must complete specific quest |
| skill | Minimum skill level |
| discovery | Must have discovered location |

### Requirement Evaluation

```
canAccess = all requirements met
```

If not met, location appears locked on map.