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

### 6. Item System (`src/systems/ItemSystem.ts`)
**Purpose**: Inventory management and item effects
**Key Functions**:
- `useItem()`: Apply item effects to pets
- `addItem()`, `removeItem()`: Inventory management
- `sellItem()`: Shop transaction handling
- `sortInventory()`: Organization utilities

### 7. Quest System (`src/systems/QuestSystem.ts`)
**Purpose**: Quest progression and management
**Key Functions**:
- `startQuest()`: Initiate quest progression
- `updateQuestProgress()`: Track objective completion
- `completeQuest()`: Handle quest completion and rewards
- `checkQuestRequirements()`: Validate quest prerequisites

## UI Architecture

### Component Hierarchy
```
App (src/App.tsx)
├── GameScreen (Main tabbed interface)
│   ├── Pet Care Tab
│   │   ├── PetDisplay (Pet visualization and stats)
│   │   └── PetCarePanel (Action buttons and controls)
│   ├── World Tab
│   │   ├── WorldMap (Location navigation)
│   │   ├── ActivitiesPanel (Foraging, fishing, training)
│   │   └── ShopPanel (NPC merchants and trading)
│   ├── Inventory Tab
│   │   ├── InventoryGrid (Item management interface)
│   │   ├── ItemDetailsPanel (Item information and actions)
│   │   └── ItemCategoryTabs (Filtering and organization)
│   ├── Battle Tab
│   │   ├── BattleField (Combat visualization)
│   │   └── MoveSelection (Attack and ability choices)
│   └── Quests Tab
│       ├── QuestList (Available and active quests)
│       ├── QuestDetails (Objectives and rewards)
│       └── QuestDialog (NPC interactions)
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

## Current File Structure
```
src/
├── components/          # React UI components (✅ Complete)
│   ├── pet/            # Pet care interfaces
│   ├── world/          # World/travel interfaces
│   ├── battle/         # Battle interfaces
│   ├── inventory/      # Item management
│   ├── quest/          # Quest management
│   └── ui/             # Shared UI components
├── systems/            # Game logic systems (✅ Complete)
│   ├── PetSystem.ts
│   ├── WorldSystem.ts
│   ├── BattleSystem.ts
│   ├── ItemSystem.ts
│   └── QuestSystem.ts
├── engine/             # Core game engine (✅ Complete)
│   ├── GameLoop.ts
│   └── GameStateFactory.ts
├── storage/            # Data persistence (✅ Complete)
│   └── GameStorage.ts
├── hooks/              # React state management (✅ Complete)
│   ├── useGameState.ts
│   ├── useBattleState.ts
│   └── useWorldState.ts
├── data/               # Game content definitions (✅ Complete)
│   ├── pets.ts         # 31 pet species across all rarities
│   ├── items.ts        # 35+ items across all categories
│   ├── locations.ts    # 3 world locations with activities
│   ├── moves.ts        # 12 battle moves
│   └── quests.ts       # 7 initial quests
├── types/              # TypeScript interfaces (✅ Complete)
│   ├── Pet.ts
│   ├── Item.ts
│   ├── World.ts
│   ├── Battle.ts
│   ├── Quest.ts
│   ├── GameState.ts
│   └── index.ts
└── lib/                # Helper utilities (✅ Complete)
    └── utils.ts        # PetValidator, GameMath, EnergyManager
tests/                  # Comprehensive test coverage (✅ 408+ tests)
├── systems/            # System unit tests
├── components/         # UI component tests
├── engine/             # Game engine tests
├── hooks/              # React hook tests
└── data/               # Content validation tests
```

## Implementation Status (✅ All Complete)
1. **✅ Foundation**: Core data models and TypeScript interfaces
2. **✅ Storage**: Web Storage API integration with migration support
3. **✅ Pet System**: Complete pet care mechanics with offline progression
4. **✅ Game Loop**: 15-second tick system with autosave
5. **✅ UI Components**: All major interfaces (Pet Care/World/Inventory/Battle/Quests)
6. **✅ World System**: Locations, travel, activities, and NPCs
7. **✅ Battle System**: Turn-based combat with AI opponents
8. **✅ Content**: 31 pets, 35+ items, 3 locations, 12 moves, 7 quests
9. **✅ Quest System**: Complete quest management with progression tracking
10. **✅ Testing**: 408+ tests with comprehensive coverage

## Testing Strategy (✅ Implemented)
- **✅ Unit Tests**: 408+ tests covering all system functions
- **✅ Integration Tests**: Cross-system functionality validation
- **✅ Storage Tests**: Save/load reliability and migration testing
- **✅ Game Loop Tests**: Tick progression and offline calculations
- **✅ UI Tests**: Component rendering and user interactions
- **✅ Content Tests**: Data validation for pets, items, moves, quests