# Digital Pets - Common Tasks & Workflows

This document defines repetitive tasks and workflows for the Digital Pets project. These tasks follow established patterns and can be referenced for consistency.

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