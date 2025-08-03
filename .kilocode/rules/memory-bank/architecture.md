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
│  Coordination Layer                                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │           ActionCoordinator                             ││
│  │  • Action dispatching & validation                      ││
│  │  • Proposal-based state management                      ││
│  │  • Cross-system conflict resolution                     ││
│  └─────────────────────────────────────────────────────────┘│
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

### Action Coordinator ([`src/engine/ActionCoordinator.ts`](src/engine/ActionCoordinator.ts))
**Purpose**: Central coordination layer managing all game actions and state changes
**Key Responsibilities**:
- Action dispatching and validation
- Proposal-based state management with conflict resolution
- Cross-system coordination and atomic state changes
- Action rollback and error recovery
- System proposal generation and evaluation

### Game Loop Engine ([`src/engine/GameLoop.ts`](src/engine/GameLoop.ts))
**Purpose**: Core 15-second tick system managing all game state progression
**Key Responsibilities**:
- Pet stat depletion and life mechanics
- Poop system and hygiene tracking
- Energy recovery during sleep
- Automatic saving with timestamps
- Offline progression calculations
- Integration with ActionCoordinator for state changes

### Pet System ([`src/systems/PetSystem.ts`](src/systems/PetSystem.ts))
**Purpose**: Manages all pet-related mechanics and state
**Key Functions**: Pet care actions, growth progression, stat calculations
**Architecture**: Proposal-based operations with ActionCoordinator integration

### Storage System ([`src/storage/GameStorage.ts`](src/storage/GameStorage.ts))
**Purpose**: Web Storage API wrapper with error handling and migration support
**Storage Keys**: `digitalPets_gameState`, `digitalPets_settings`

### World System ([`src/systems/WorldSystem.ts`](src/systems/WorldSystem.ts))
**Purpose**: Location management, travel mechanics, and world activities

### Additional Systems
- **Battle System**: Turn-based combat mechanics
- **Item System**: Inventory management and item effects with proposal-based state changes
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
- **Custom Hooks**: System interactions (`useGameState`, `useBattleState`)
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

### 3. Proposal-Based State Management
- ActionCoordinator as central coordination layer
- Proposal generation and evaluation for all state changes
- Cross-system conflict detection and resolution
- Atomic state changes with rollback capability
- Deterministic action processing with error recovery

### 4. Modular System Design
- Separate systems with clear interfaces
- Static class methods for stateless operations
- Result<T> pattern for error handling
- Proposal-based integration with ActionCoordinator
- Easy testing and extensibility

### 5. Type Safety
- Comprehensive TypeScript interfaces
- Strict type checking enabled
- No `any` or `unknown` types
- Runtime type validation for save data
- Strongly typed proposal and action systems

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
1. **Game State Flow**: GameLoop → ActionCoordinator → Systems → Storage → UI
2. **Pet Care Flow**: UI → useGameState → ActionCoordinator → PetSystem → GameState → Storage
3. **World Activities**: UI → ActionCoordinator → WorldSystem → ActivityLog → GameState
4. **Battle Flow**: UI → ActionCoordinator → BattleSystem → Pet Stats → Results
5. **Action Processing**: UI Action → ActionCoordinator → System Proposals → Conflict Resolution → State Changes → Storage

## Proposal-Based Architecture Details

### SystemProposal Pattern
All state-modifying operations generate proposals containing:
- **Proposed Changes**: Specific modifications to game state
- **Validation Rules**: Prerequisites and constraints
- **Conflict Resolution**: Handling of competing state changes
- **Rollback Data**: Information needed to undo changes

### ActionCoordinator Workflow
1. **Action Reception**: Receives action requests from UI components
2. **Proposal Generation**: Delegates to appropriate systems for proposal creation
3. **Validation**: Validates proposals against current game state
4. **Conflict Resolution**: Resolves competing or conflicting proposals
5. **State Application**: Applies validated proposals atomically
6. **Error Recovery**: Handles failures with automatic rollback

### Integration Points
- **useGameState Hook**: Primary interface for UI → ActionCoordinator communication
- **System Methods**: Static methods that generate proposals instead of direct state changes
- **GameLoop Integration**: Tick-based progression through ActionCoordinator
- **Storage Layer**: Atomic saves triggered after successful proposal application