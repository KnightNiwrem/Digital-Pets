# Digital Pets - System Architecture

## Overview
The Digital Pets game follows a client-side architecture with React components managing UI state, a central game engine handling core mechanics, and Web Storage API providing persistence. The system is designed for offline-first operation with automatic state synchronization.

## High-Level Architecture

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

## Core Systems

### Game Loop Engine ([`src/engine/GameLoop.ts`](src/engine/GameLoop.ts))
**Purpose**: Core 15-second tick system managing all game state progression
**Key Responsibilities**:
- Pet stat depletion and life mechanics
- Poop system and hygiene tracking
- Energy recovery during sleep
- Automatic saving with timestamps
- Offline progression calculations

### Pet System ([`src/systems/PetSystem.ts`](src/systems/PetSystem.ts))
**Purpose**: Manages all pet-related mechanics and state
**Key Functions**: Pet care actions, growth progression, stat calculations

### Storage System ([`src/storage/GameStorage.ts`](src/storage/GameStorage.ts))
**Purpose**: Web Storage API wrapper with error handling and migration support
**Storage Keys**: `digitalPets_gameState`, `digitalPets_settings`

### World System ([`src/systems/WorldSystem.ts`](src/systems/WorldSystem.ts))
**Purpose**: Location management, travel mechanics, and world activities

### Additional Systems
- **Battle System**: Turn-based combat mechanics
- **Item System**: Inventory management and item effects
- **Quest System**: Quest progression and management
- **Activity Log System**: Activity history tracking

## UI Architecture

### Component Structure
```
App → GameScreen (Main tabbed interface)
├── Pet Care Tab (PetDisplay, PetCarePanel)
├── World Tab (WorldMap, ActivitiesPanel, ShopPanel)
├── Inventory Tab (InventoryGrid, ItemDetailsPanel)
├── Battle Tab (BattleField, MoveSelection)
├── Quests Tab (QuestList, QuestDetails, QuestDialog)
└── Log Tab (ActivityLogPanel, ActivityStatsPanel)
```

### State Management
- **React Context**: Global game state access
- **Custom Hooks**: System interactions (`useGameState`, `useWorldState`, `useBattleState`)
- **Local State**: UI-specific state management

## Key Architectural Decisions

### 1. Offline-First Design
- All game logic runs client-side
- Web Storage API for persistence
- Offline progression calculations on game load
- No network dependencies

### 2. Tick-Based Mechanics
- 15-second tick intervals for consistent progression
- Deterministic offline calculations
- Timestamp-based save states

### 3. Modular System Design
- Separate systems with clear interfaces
- Static class methods for stateless operations
- Result<T> pattern for error handling
- Easy testing and extensibility

### 4. Type Safety
- Comprehensive TypeScript interfaces
- Strict type checking enabled
- No `any` or `unknown` types
- Runtime type validation for save data

## File Structure Overview
```
src/
├── components/     # React UI components
├── systems/       # Game logic systems
├── engine/        # Core game engine
├── storage/       # Data persistence
├── hooks/         # React state management
├── data/          # Game content definitions
├── types/         # TypeScript interfaces
└── lib/           # Helper utilities
```

## Critical Implementation Paths
1. **Game State Flow**: GameLoop → Systems → Storage → UI
2. **Pet Care Flow**: UI → PetSystem → GameState → Storage
3. **World Activities**: UI → WorldSystem → ActivityLog → GameState
4. **Battle Flow**: UI → BattleSystem → Pet Stats → Results