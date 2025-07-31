# Digital Pets - Development Workflows

This document defines repetitive tasks and workflows for the Digital Pets project.

## Fix UI Display Issues (ID vs Name)
**Last performed:** December 2024 - Issue #49
**Files to modify:**
- `/src/data/locations.ts` - Add utility functions for data lookups
- `/src/components/world/ActivitiesPanel.tsx` - Fix shopkeeper and item displays
- `/src/components/world/ShopModal.tsx` - Fix shopkeeper displays
- `/src/components/quest/QuestDialog.tsx` - Fix NPC displays
- `/src/components/quest/QuestDetails.tsx` - Fix quest giver displays
- `/tests/data/locations.test.ts` - Add tests for new utility functions

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

**Testing commands:**
```bash
bun run typecheck  # Ensure TypeScript compilation
bun run lint       # Check code style and rules
bun test           # Run full test suite
bun run build      # Verify production build
```

All major game systems follow this established pattern:

### System Implementation Workflow
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

## Content Creation Workflows

### Add New Pet Species
**Files to modify:**
- `src/data/pets.ts` - Add species definition with stats and growth data
- `tests/data/pets.test.ts` - Add validation tests
- `src/components/pet/PetDisplay.tsx` - Update rendering if needed

### Create New Item Type
**Files to modify:**
- `src/data/items.ts` - Add item definition with type, effects, and metadata
- `src/types/Item.ts` - Update interfaces if needed
- `src/systems/ItemSystem.ts` - Add usage logic
- `tests/data/items.test.ts` - Add validation tests

### Add New World Location
**Files to modify:**
- `src/data/locations.ts` - Add location definition with activities and connections
- `src/components/world/WorldMap.tsx` - Update UI
- `tests/systems/WorldSystem.test.ts` - Add location tests

### Add New NPC with Quests
**Files to modify:**
- `src/data/npcs.ts` - Add NPC definition with dialog and behavior
- `src/data/quests.ts` - Add quest definitions with objectives and rewards
- `tests/systems/QuestSystem.test.ts` - Add quest tests

### Add New Battle Moves
**Files to modify:**
- `src/data/moves.ts` - Add move definitions with damage, effects, and requirements
- `src/systems/BattleSystem.ts` - Add move effects if complex
- `tests/systems/BattleSystem.test.ts` - Add move tests

## Testing Workflows

### Add Unit Tests for System
**Files to create:**
- `tests/systems/[SystemName].test.ts` - Main test file
- `tests/mocks/[SystemName].ts` - Mock data if needed

**Testing Steps:**
1. Create test file with describe/it structure
2. Mock external dependencies (storage, other systems)
3. Test core system functions with various inputs
4. Test error conditions and edge cases
5. Verify state changes and side effects
6. Aim for 100% coverage of critical paths

## Maintenance Workflows

### Update Save Game Format
**When to use**: Adding new data fields or changing structure
**Files to modify:**
- `src/types/GameState.ts` - Update interfaces
- `src/storage/GameStorage.ts` - Add migration logic
- `src/engine/GameLoop.ts` - Update state handling

### Performance Optimization
**Areas to examine:**
- Game loop tick processing time
- React component re-rendering
- Storage read/write operations
- Large data structure handling

## Quality Assurance

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

## Development Status Summary

### ✅ Completed Core Systems
- **PetSystem**: Complete pet care mechanics with 54+ tests
- **BattleSystem**: Turn-based combat with 30+ tests  
- **WorldSystem**: Location travel and activities with 28+ tests
- **ItemSystem**: Inventory management with comprehensive tests
- **QuestSystem**: Quest management with 32+ tests
- **GameLoop**: 15-second tick system with offline progression
- **GameStorage**: Web Storage API with migration support

### ✅ Completed UI Systems
- **Pet Care Interface**: Real-time stats and care actions
- **World Exploration**: Travel, activities, and shop systems
- **Battle Interface**: Combat visualization and move selection
- **Inventory System**: Grid-based management with categorization
- **Quest Interface**: Progress tracking and NPC dialogue

### ✅ Completed Content
- **31 Pet Species**: Across all rarity tiers (10 common, 8 uncommon, 6 rare, 4 epic, 3 legendary)
- **35+ Items**: Food, drinks, medicine, toys, equipment, special items
- **12 Battle Moves**: Physical, special, status, and healing abilities
- **3 Locations**: Hometown, Forest Path, Riverside with unique activities
- **7 Initial Quests**: Tutorial, story, exploration, and collection quests

### 📅 Next Development Priorities
1. **Location Expansion**: Add more cities, towns, and explorable areas
2. **Advanced Quest Chains**: Create longer narrative storylines
3. **Achievement System**: Track player accomplishments and milestones
4. **Training Facilities**: Pet stat improvement and move learning
5. **NPC Development**: More merchants, characters, and dialogue
6. **UI Polish**: Animations, notifications, and enhanced feedback

### Current Technical State
- **408+ Tests Passing**: Comprehensive unit test coverage
- **Type-Safe Codebase**: Strict TypeScript with no any/unknown types
- **Production Ready**: Clean builds, linting passes, responsive design
- **No Blockers**: All core functionality complete and stable

## Future Development Roadmap

### Phase 4: Content Expansion (Next Priority)
**Estimated Timeline**: 2-3 weeks
**Goal**: Rich world content and extended gameplay

**4.1 World Content Expansion**
- Add 3-5 new locations (cities, dungeons, special areas)
- Create location-specific activities and rewards
- Design unique NPCs with varied personalities and roles
- Implement location unlock progression system

**4.2 Quest Chain Development**
- Expand to 15-20 total quests across multiple storylines
- Create branching quest narratives with player choices
- Add multi-part quest chains with meaningful progression
- Implement quest prerequisites and unlock systems

**4.3 Content Scaling**
- Add 10-15 additional pet species (target: 45+ total)
- Expand item collection to 50+ items with specialized effects
- Create 8-10 new battle moves with unique mechanics
- Design rare/legendary items with significant impact

### Phase 5: Advanced Features (Future Enhancement)
**Estimated Timeline**: 3-4 weeks
**Goal**: Deep gameplay systems and player progression

**5.1 Achievement System**
- Design 25-30 achievements across all gameplay aspects
- Implement achievement tracking and progress visualization
- Create achievement rewards (titles, items, pet unlocks)
- Add achievement notification system

**5.2 Training Facilities**
- Build pet stat improvement facilities
- Create move learning and training mechanics
- Implement training costs and time requirements
- Design advanced training for rare abilities

**5.3 Advanced Mechanics**
- Pet breeding system with genetic traits
- Seasonal events and limited-time content
- Player statistics and progress tracking
- Advanced pet customization options

### Phase 6: Polish & Optimization (Final Phase)
**Estimated Timeline**: 1-2 weeks
**Goal**: Production-ready polish and performance

**6.1 UI/UX Enhancement**
- Add smooth animations and transitions
- Implement notification system for game events
- Create loading states and progress indicators
- Design responsive layouts for all screen sizes

**6.2 Performance Optimization**
- Optimize game loop and tick processing
- Implement efficient state management patterns
- Add performance monitoring and analytics
- Optimize bundle size and load times

**6.3 Quality Assurance**
- Comprehensive playtesting across all features
- Balance testing for game mechanics
- Cross-browser compatibility verification
- Performance testing on various devices

### Development Priorities (Immediate Next Steps)
1. **Location Design**: Create 2-3 new explorable areas with unique themes
2. **NPC Development**: Add 5-8 NPCs with distinct personalities and quest lines
3. **Quest Expansion**: Develop 8-10 new quests focusing on exploration and story
4. **Content Balance**: Add 5-10 new pets and 15+ items to enhance collection aspect
5. **UI Polish**: Implement basic animations and enhanced user feedback systems