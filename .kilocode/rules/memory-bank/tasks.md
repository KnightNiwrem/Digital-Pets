# Digital Pets - Development Workflows

This document defines reusable workflows and patterns for the Digital Pets project.

## Current Project Status (August 2025)
**✅ PRODUCTION READY**: All core systems complete with 478+ tests passing
- **Content Complete**: 6 locations, 17 quests, 12 NPCs, 31 pets, 57+ items
- **Systems Complete**: Pet care, battle, world, inventory, quest management
- **Next Focus**: Optional polish and advanced features

## Core Development Workflows

### System Implementation Pattern
**Used when**: Adding new game systems or major features
**Files to create/modify:**
- `src/systems/[SystemName].ts` - Core system logic with static methods
- `src/types/[SystemName].ts` - TypeScript interfaces and constants
- `src/hooks/use[SystemName].ts` - React hook for UI integration (if needed)
- `src/components/[system]/` - UI components directory
- `src/data/[system].ts` - Static data definitions
- `tests/systems/[SystemName].test.ts` - Comprehensive unit tests (30+ cases)

**Implementation Steps:**
1. **Design Phase**: Define comprehensive requirements from project brief
2. **Core System**: Implement main system class with static methods for all operations
3. **Type Safety**: Create complete TypeScript interfaces with strict typing
4. **Integration**: Update existing systems (GameLoop, useGameState) for integration
5. **Testing**: Write comprehensive unit tests covering all functionality and edge cases
6. **Validation**: Ensure all tests pass, TypeScript compiles, and production builds

**Key Principles:**
- Use static class methods for stateless operations
- Implement Result<T> pattern for operation results with proper error handling
- Integrate with GameLoop for tick-based progression where applicable
- Aim for 50+ test cases per major system
- Follow existing UI component patterns (shadcn/ui, game interface architecture)

### UI Display Fix Pattern
**Used when**: Fixing ID vs name display issues in components
**Files to modify:**
- `/src/data/[dataFile].ts` - Add utility functions for data lookups
- `/src/components/[affected components].tsx` - Fix displays
- `/tests/data/[dataFile].test.ts` - Add tests for new utility functions

**Steps:**
1. Identify all instances where IDs are displayed instead of names using grep/search
2. Create utility functions (`getNpcById`, etc.) in data files for proper lookups
3. Update UI components to use these utilities instead of displaying raw IDs
4. Handle TypeScript type safety (optional fields, null checks)
5. Fix linting issues (case block declarations, prettier formatting)
6. Write comprehensive unit tests for new utility functions
7. Verify all tests pass and linting is clean

**Important notes:**
- Look for patterns like `{shop.keeper}`, `{reward.id}`, `{quest.npcId}` in components
- Use existing utilities like `getItemById()` as examples
- Ensure proper fallbacks for undefined values (e.g., `item?.name || itemId`)
- Wrap case statements with braces to avoid variable declaration errors
- Test edge cases like empty strings and invalid IDs

### Content Creation Workflows

#### Add New Pet Species
**Files to modify:**
- `src/data/pets/[petName].ts` - Create new pet file in pets directory
- `src/data/pets/index.ts` - Export new pet
- `tests/data/pets.test.ts` - Add validation tests

#### Add New Item
**Files to modify:**
- `src/data/items/[itemName].ts` - Create new item file
- `src/data/items/index.ts` - Export new item
- `src/types/Item.ts` - Update interfaces if needed
- `tests/data/items.test.ts` - Add validation tests

#### Add New Location
**Files to modify:**
- `src/data/locations.ts` - Add location definition with activities and connections
- `src/components/world/WorldMap.tsx` - Update UI if needed
- `tests/data/locations.test.ts` - Add location tests

#### Add New Quest
**Files to modify:**
- `src/data/quests.ts` - Add quest definitions with objectives and rewards
- `tests/systems/QuestSystem.test.ts` - Add quest tests

#### Add New Battle Move
**Files to modify:**
- `src/data/moves.ts` - Add move definitions with damage, effects, and requirements
- `src/systems/BattleSystem.ts` - Add move effects if complex
- `tests/systems/BattleSystem.test.ts` - Add move tests

## Testing & Quality Assurance

### Standard Testing Commands
```bash
bun run typecheck  # Ensure TypeScript compilation
bun run lint       # Check code style and rules
bun test           # Run full test suite
bun run build      # Verify production build
```

### Pre-Release Checklist
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

## Optional Enhancement Opportunities

### Achievement System
**Goal**: Track player accomplishments across all gameplay aspects
**Implementation**: Achievement tracking, progress visualization, rewards system
**Timeline**: 1-2 weeks (optional)

### Training Facilities
**Goal**: Advanced pet development and customization
**Implementation**: Stat improvement facilities, move learning mechanics
**Timeline**: 2-3 weeks (optional)

### UI/UX Polish
**Goal**: Production-ready polish and enhanced user experience
**Implementation**: Animations, notifications, responsive improvements
**Timeline**: 1-2 weeks (optional)