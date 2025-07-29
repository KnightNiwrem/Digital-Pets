# Digital Pets - Common Tasks & Workflows

This document defines repetitive tasks and workflows for the Digital Pets project. These tasks follow established patterns and can be referenced for consistency.

## Completed Major Systems

### Implement Core Game System (PetSystem Pattern)
**Last performed:** July 29, 2025
**Status:** ✅ COMPLETED  
**Files created/modified:**
- `src/systems/PetSystem.ts` - Core system logic with all pet care mechanics
- `src/types/Pet.ts` - Pet interfaces and constants
- `src/types/GameState.ts` - Game state interfaces
- `src/types/index.ts` - Type exports and constants
- `src/engine/GameLoop.ts` - Integration with existing game loop
- `tests/systems/PetSystem.test.ts` - Comprehensive unit tests (54 test cases)

**Implementation Pattern:**
1. **Design Phase**: Define comprehensive requirements from project brief
2. **Core System**: Implement main system class with static methods for all operations
3. **Type Safety**: Create complete TypeScript interfaces with strict typing
4. **Integration**: Update existing systems (GameLoop) to use new system
5. **Testing**: Write comprehensive unit tests covering all functionality and edge cases
6. **Validation**: Ensure all tests pass, TypeScript compiles, and production builds

**Key Implementation Details:**
- Used static class methods for stateless operations
- Implemented hidden tick counters with display value calculations
- Added comprehensive error handling with Result<T> pattern
- Created realistic game mechanics (poop system, health states, growth progression)
- Integrated with existing GameLoop tick processing
- 54 test cases with 110 expect() assertions for full coverage

**Important Notes:**
- This pattern should be followed for all future core systems (WorldSystem, BattleSystem, etc.)
- Comprehensive testing is critical - aim for 50+ test cases per major system
- Always integrate with GameLoop for tick-based progression
- Use Result<T> pattern for operation results with proper error handling

## Development Setup Tasks

### Initialize New Game System
**When to use**: Adding a new major game system (e.g., Weather, Trading, Breeding)
**Files to modify**:
- `src/systems/[SystemName].ts` - Core system logic
- `src/types/[SystemName].ts` - TypeScript interfaces
- `src/hooks/use[SystemName].ts` - React hook for UI integration
- `src/components/[system]/` - UI components directory
- `src/data/[system].ts` - Static data definitions

**Steps**:
1. Create TypeScript interfaces in `types/` directory
2. Implement core system logic with proper error handling
3. Create React hook for state management and UI integration  
4. Build UI components following shadcn/ui patterns
5. Add static data definitions
6. Integrate with main game loop if needed
7. Write unit tests for system functions
8. Update architecture documentation

### Add New Pet Species
**When to use**: Expanding pet collection with new species
**Files to modify**:
- `src/data/pets.ts` - Add species definition
- `src/types/Pet.ts` - Update interfaces if needed
- `src/assets/pets/` - Add pet artwork/sprites
- `src/systems/PetSystem.ts` - Add species-specific logic
- `src/components/pet/PetDisplay.tsx` - Update rendering

**Steps**:
1. Define pet species in `pets.ts` with stats and growth data
2. Add artwork assets to appropriate directory
3. Update PetDisplay component for new species rendering
4. Add any species-specific behaviors to PetSystem
5. Test pet creation, growth, and display
6. Update pet collection documentation

### Create New Item Type
**When to use**: Adding new consumables, toys, or equipment
**Files to modify**:
- `src/data/items.ts` - Add item definition
- `src/types/Item.ts` - Update interfaces if needed
- `src/systems/ItemSystem.ts` - Add usage logic
- `src/components/inventory/ItemIcon.tsx` - Add icon/display
- `src/systems/PetSystem.ts` - Integrate item effects

**Steps**:
1. Define item in `items.ts` with type, effects, and metadata
2. Add item icon and display logic
3. Implement usage logic in ItemSystem
4. Integrate effects with PetSystem (stats, health, etc.)
5. Add item to appropriate shops or loot tables
6. Test item acquisition, usage, and effects
7. Update inventory UI if new item type requires special handling

### Add New World Location
**When to use**: Expanding the game world with new areas
**Files to modify**:
- `src/data/locations.ts` - Add location definition
- `src/types/World.ts` - Update interfaces if needed
- `src/systems/WorldSystem.ts` - Add location logic
- `src/components/world/LocationMap.tsx` - Update UI
- `src/data/npcs.ts` - Add location NPCs if needed

**Steps**:
1. Define location in `locations.ts` with activities and connections
2. Add location to world map UI
3. Implement location-specific activities (foraging, shops, NPCs)
4. Add travel connections and requirements
5. Create location-specific NPCs and quests
6. Test location access, activities, and transitions
7. Update world documentation

## Testing Tasks

### Add Unit Tests for System
**When to use**: Testing individual game systems
**Files to create**:
- `tests/systems/[SystemName].test.ts` - Main test file
- `tests/mocks/[SystemName].ts` - Mock data if needed

**Steps**:
1. Create test file with describe/it structure
2. Mock external dependencies (storage, other systems)
3. Test core system functions with various inputs
4. Test error conditions and edge cases
5. Verify state changes and side effects
6. Run tests and ensure 100% coverage for critical paths

### Add Integration Tests
**When to use**: Testing system interactions
**Files to create**:
- `tests/integration/[Feature].test.ts` - Integration test file

**Steps**:
1. Set up test environment with multiple systems
2. Test complete user workflows (feeding pet, battle, travel)
3. Verify cross-system data consistency
4. Test save/load functionality with real scenarios
5. Ensure offline progression calculations work correctly

## Content Creation Tasks

### Add New NPC with Quests
**When to use**: Creating interactive NPCs with quest lines
**Files to modify**:
- `src/data/npcs.ts` - Add NPC definition
- `src/data/quests.ts` - Add quest definitions
- `src/systems/QuestSystem.ts` - Add quest logic
- `src/components/world/NPCDialog.tsx` - Update dialog system

**Steps**:
1. Define NPC in `npcs.ts` with dialog, location, and behavior
2. Create quest line in `quests.ts` with objectives and rewards
3. Implement quest logic in QuestSystem
4. Add NPC dialog and interaction UI
5. Test quest progression and completion
6. Verify reward distribution and story continuity

### Add New Battle Moves
**When to use**: Expanding combat system with new abilities
**Files to modify**:
- `src/data/moves.ts` - Add move definitions
- `src/types/Battle.ts` - Update interfaces if needed
- `src/systems/BattleSystem.ts` - Add move effects
- `src/components/battle/MoveSelection.tsx` - Update UI

**Steps**:
1. Define moves in `moves.ts` with damage, effects, and requirements
2. Implement move effects in BattleSystem
3. Update move selection UI with new options
4. Add move learning mechanics to training facilities
5. Test move execution and damage calculations
6. Balance move power and availability

## Maintenance Tasks

### Update Save Game Format
**When to use**: Adding new data fields or changing structure
**Files to modify**:
- `src/types/GameState.ts` - Update interfaces
- `src/storage/GameStorage.ts` - Add migration logic
- `src/engine/GameLoop.ts` - Update state handling

**Steps**:
1. Update GameState interface with new fields
2. Increment save format version number
3. Add migration logic in GameStorage for older saves
4. Test migration with various save file versions
5. Ensure backward compatibility where possible
6. Document breaking changes if any

### Performance Optimization
**When to use**: Addressing performance issues or optimization opportunities
**Areas to examine**:
- Game loop tick processing time
- React component re-rendering
- Storage read/write operations
- Large data structure handling

**Steps**:
1. Profile current performance with browser dev tools
2. Identify bottlenecks in critical game loop functions
3. Optimize algorithms and data structures
4. Implement React optimization patterns (memo, useMemo, useCallback)
5. Minimize storage operations and batch updates
6. Test performance improvements with realistic data
7. Monitor memory usage and prevent leaks

## Quality Assurance

### Pre-Release Checklist
**When to use**: Before any major release or deployment
**Items to verify**:
- [ ] All TypeScript compilation passes without errors
- [ ] Linting passes with no warnings
- [ ] All tests pass (unit, integration, UI)
- [ ] Production build completes successfully
- [ ] Game loads and saves correctly
- [ ] Core gameplay loop functions properly
- [ ] No console errors in browser
- [ ] Performance meets requirements
- [ ] Memory usage remains stable during extended play
- [ ] Offline progression calculations work correctly

## Project TODO Breakdown

### Phase 2: Storage & UI Foundation (CURRENT PHASE)
**Priority: HIGH - Foundation for gameplay**

#### 2.1 Complete Storage System
- [ ] **Storage Integration** (`src/storage/GameStorage.ts`)
  - [ ] Implement complete save/load functionality using Web Storage API
  - [ ] Add save data validation and error recovery
  - [ ] Implement save migration system for version updates
  - [ ] Add offline progression calculation on game load
  - [ ] Test save/load with complex game states

#### 2.2 Basic Pet Care UI
- [ ] **Pet Display Component** (`src/components/pet/PetDisplay.tsx`)
  - [ ] Show pet sprite, name, and basic info
  - [ ] Display current stats (satiety, hydration, happiness)
  - [ ] Show health status and growth stage
  - [ ] Add visual indicators for critical states
- [ ] **Pet Care Interface** (`src/components/pet/PetCarePanel.tsx`)
  - [ ] Feed, water, and play action buttons
  - [ ] Medicine and hygiene controls
  - [ ] Sleep/wake toggle functionality
  - [ ] Status messages and action feedback
- [ ] **Game State Management** (`src/hooks/useGameState.ts`)
  - [ ] React hook for game state access
  - [ ] Automatic save triggering
  - [ ] State change notifications

#### 2.3 Essential Data Models
- [ ] **Item System Types** (`src/types/Item.ts`)
  - [ ] Item interfaces (consumables, medicine, toys, hygiene)
  - [ ] Inventory management types
  - [ ] Item effect definitions
- [ ] **World System Types** (`src/types/World.ts`)
  - [ ] Location definitions and connections
  - [ ] Travel state management
  - [ ] Activity and NPC interfaces

### Phase 3: World & Battle Systems
**Priority: MEDIUM - Core gameplay expansion**

#### 3.1 World System Implementation
- [ ] **WorldSystem** (`src/systems/WorldSystem.ts`)
  - [ ] Location management and travel mechanics
  - [ ] Activity processing (foraging, fishing, mining)
  - [ ] NPC interaction system
  - [ ] Quest progression logic
- [ ] **World UI Components**
  - [ ] Location map and navigation
  - [ ] Travel interface and progress
  - [ ] Activity panels and results
  - [ ] NPC dialog system

#### 3.2 Battle System Implementation
- [ ] **BattleSystem** (`src/systems/BattleSystem.ts`)
  - [ ] Turn-based combat mechanics
  - [ ] Move execution and damage calculation
  - [ ] Status effects and conditions
  - [ ] Victory/defeat handling
- [ ] **Battle UI Components**
  - [ ] Battle field visualization
  - [ ] Move selection interface
  - [ ] Battle stats and health bars
  - [ ] Combat animations and feedback

#### 3.3 Item System Implementation
- [ ] **ItemSystem** (`src/systems/ItemSystem.ts`)
  - [ ] Item usage and effect processing
  - [ ] Inventory management
  - [ ] Shop and trading mechanics
  - [ ] Durability and consumption logic

### Phase 4: Content & Polish
**Priority: LOW - Content expansion**

#### 4.1 Game Content Creation
- [ ] **Pet Species** (`src/data/pets.ts`)
  - [ ] Define all 31 pet species across rarities
  - [ ] Create pet sprites and icons
  - [ ] Balance stats and growth rates
- [ ] **Items Database** (`src/data/items.ts`)
  - [ ] Food, drinks, medicine, toys, hygiene items
  - [ ] Item icons and descriptions
  - [ ] Shop prices and availability
- [ ] **World Content** (`src/data/locations.ts`, `src/data/npcs.ts`)
  - [ ] Multiple towns and cities
  - [ ] Explorable areas with activities
  - [ ] NPCs with dialog and quests
- [ ] **Battle Content** (`src/data/moves.ts`)
  - [ ] Move database with effects
  - [ ] Training facilities
  - [ ] Battle encounters

#### 4.2 Advanced Features
- [ ] **Quest System** (`src/systems/QuestSystem.ts`)
  - [ ] Quest line management
  - [ ] Objective tracking
  - [ ] Reward distribution
- [ ] **Achievement System**
  - [ ] Achievement definitions and tracking
  - [ ] Progress notifications
  - [ ] Unlock rewards
- [ ] **Advanced UI Features**
  - [ ] Settings and preferences
  - [ ] Help and tutorial system
  - [ ] Advanced pet statistics
  - [ ] Collection tracking

#### 4.3 Performance & Polish
- [ ] **Performance Optimization**
  - [ ] Game loop performance tuning
  - [ ] UI rendering optimization
  - [ ] Memory usage monitoring
- [ ] **Testing & Quality**
  - [ ] Integration tests for complete workflows
  - [ ] UI component testing
  - [ ] Cross-browser compatibility testing
- [ ] **Documentation**
  - [ ] Player documentation and guides
  - [ ] Developer documentation updates
  - [ ] API documentation completion

### Current Status Summary
- ✅ **Phase 1 Complete**: PetSystem with comprehensive testing
- 🔄 **Phase 2 In Progress**: Storage system and basic UI foundation
- ⏳ **Phase 3 Planned**: World and battle systems
- 📅 **Phase 4 Future**: Content creation and polish

### Estimated Timeline
- **Phase 2**: 2-3 weeks (storage + basic UI)
- **Phase 3**: 4-6 weeks (world + battle systems)  
- **Phase 4**: 6-8 weeks (content + polish)
- **Total**: ~3-4 months for complete game