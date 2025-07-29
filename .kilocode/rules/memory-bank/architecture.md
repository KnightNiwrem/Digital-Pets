# Digital Pets - System Architecture

## Overview
The Digital Pets game follows a client-side architecture with React components managing UI state, a central game engine handling core mechanics, and Web Storage API providing persistence. The system is designed for offline-first operation with automatic state synchronization.

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Digital Pets Game                        │
├─────────────────────────────────────────────────────────────┤
│  UI Layer (React Components)                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Pet Care UI │ │ World UI    │ │ Battle UI   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Game Engine Layer                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Pet System  │ │ World Sys   │ │ Battle Sys  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Item System │ │ Quest Sys   │ │ Game Loop   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Storage Layer (Web Storage API)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Game State  │ │ Pet Data    │ │ World Data  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Core Data Models

### Pet System
```typescript
interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  rarity: PetRarity;
  growthStage: number; // 0-49 (50 stages)
  
  // Care Stats (displayed)
  satiety: number;
  hydration: number;
  happiness: number;
  
  // Hidden Counters
  satietyTicksLeft: number;
  hydrationTicksLeft: number;
  happinessTicksLeft: number;
  poopTicksLeft: number;
  sickByPoopTicksLeft: number;
  
  // Core Stats
  life: number; // max 1,000,000
  maxEnergy: number; // increases per growth stage
  currentEnergy: number;
  health: HealthState;
  state: PetState; // idle, sleeping, travelling
  
  // Battle Stats
  attack: number;
  defense: number;
  speed: number;
  maxHealth: number;
  currentHealth: number;
  moves: Move[];
}
```

### Game State
```typescript
interface GameState {
  version: string;
  lastSaveTime: number;
  currentPet: Pet;
  inventory: {
    items: Item[];
    eggs: Egg[];
  };
  world: {
    currentLocation: LocationId;
    unlockedLocations: LocationId[];
    travelState?: TravelState;
  };
  quests: QuestProgress[];
  settings: GameSettings;
}
```

## System Components

### 1. Game Loop Engine (`src/engine/GameLoop.ts`)
**Purpose**: Core 15-second tick system managing all game state progression
**Key Functions**:
- `tick()`: Process one game tick
- `calculateOfflineProgression()`: Handle offline time gaps
- `saveGameState()`: Persist current state
- `loadGameState()`: Restore from storage

**Responsibilities**:
- Pet stat depletion (satiety, hydration, happiness)
- Life mechanics (decrease/recovery)
- Poop system progression
- Energy recovery during sleep
- Automatic saving with timestamps

### 2. Pet System (`src/systems/PetSystem.ts`)
**Purpose**: Manages all pet-related mechanics and state
**Key Functions**:
- `feedPet()`, `giveDrink()`, `playWithPet()`
- `treatPet()`: Handle medicine/healing
- `cleanPoop()`: Hygiene management
- `processGrowth()`: Handle stage progression
- `calculateDisplayStats()`: Convert ticks to display values

### 3. Storage System (`src/storage/GameStorage.ts`)
**Purpose**: Web Storage API wrapper with error handling
**Key Functions**:
- `saveGame()`: Serialize and store game state
- `loadGame()`: Deserialize and validate stored data
- `hasExistingSave()`: Check for existing saves
- `clearSave()`: Reset game data

**Storage Keys**:
- `digitalPets_gameState`: Main game data
- `digitalPets_settings`: User preferences

### 4. World System (`src/systems/WorldSystem.ts`)
**Purpose**: Manage locations, travel, and world interactions
**Key Functions**:
- `travelTo()`: Initiate travel between locations
- `processTravel()`: Handle travel state progression
- `getAvailableActivities()`: Location-specific actions
- `processActivity()`: Handle foraging/fishing/mining

### 5. Battle System (`src/systems/BattleSystem.ts`)
**Purpose**: Turn-based combat mechanics
**Key Functions**:
- `initiateBattle()`: Start combat encounter
- `executeMove()`: Process battle actions
- `calculateDamage()`: Damage calculations
- `checkBattleEnd()`: Victory/defeat conditions

## UI Architecture

### Component Hierarchy
```
App
├── GameProvider (Context for global state)
├── Router/Screen Manager
│   ├── PetCareScreen
│   │   ├── PetDisplay
│   │   ├── StatsPanel
│   │   ├── ActionButtons
│   │   └── ItemQuickUse
│   ├── WorldScreen
│   │   ├── LocationMap
│   │   ├── TravelInterface
│   │   └── ActivityPanel
│   ├── BattleScreen
│   │   ├── BattleField
│   │   ├── MoveSelection
│   │   └── BattleStats
│   ├── InventoryScreen
│   └── SettingsScreen
└── GameLoop (Background tick processor)
```

### State Management Pattern
- **React Context**: Global game state access
- **Custom Hooks**: Game system interactions (`usePet`, `useWorld`, `useBattle`)
- **Local State**: UI-specific state (modals, animations)

## Key Architectural Decisions

### 1. Offline-First Design
- All game logic runs client-side
- Web Storage API for persistence
- Offline progression calculations on game load
- No network dependencies

### 2. Tick-Based Mechanics
- 15-second tick intervals
- Consistent state progression
- Deterministic offline calculations
- Timestamp-based save states

### 3. Modular System Design
- Separate systems for Pet, World, Battle, etc.
- Clear interfaces between systems
- Easy testing and maintenance
- Extensible for new features

### 4. Type Safety
- Comprehensive TypeScript interfaces
- Strict type checking enabled
- No `any` or `unknown` types
- Runtime type validation for save data

## File Structure
```
src/
├── components/          # React UI components
│   ├── pet/            # Pet care interfaces
│   ├── world/          # World/travel interfaces  
│   ├── battle/         # Battle interfaces
│   ├── inventory/      # Item management
│   └── ui/             # Shared UI components
├── systems/            # Game logic systems
│   ├── PetSystem.ts
│   ├── WorldSystem.ts
│   ├── BattleSystem.ts
│   └── ItemSystem.ts
├── engine/             # Core game engine
│   ├── GameLoop.ts
│   └── GameState.ts
├── storage/            # Data persistence
│   └── GameStorage.ts
├── data/               # Game content definitions
│   ├── pets.ts         # Pet species/rarity data
│   ├── items.ts        # Item definitions
│   ├── locations.ts    # World locations
│   └── moves.ts        # Battle moves
├── types/              # TypeScript interfaces
│   ├── Pet.ts
│   ├── Item.ts
│   ├── World.ts
│   └── Battle.ts
└── utils/              # Helper functions
    ├── calculations.ts
    └── validation.ts
```

## Implementation Priority
1. **Foundation**: Core data models and TypeScript interfaces
2. **Storage**: Web Storage API integration and save/load
3. **Pet System**: Basic pet care mechanics and stats
4. **Game Loop**: Tick system and offline progression
5. **UI Components**: Pet care interface and basic screens
6. **World System**: Locations and travel mechanics
7. **Battle System**: Turn-based combat
8. **Content**: Pets, items, locations, and quests

## Testing Strategy
- **Unit Tests**: Individual system functions
- **Integration Tests**: System interactions
- **Storage Tests**: Save/load reliability
- **Game Loop Tests**: Tick progression accuracy
- **UI Tests**: Component rendering and interactions