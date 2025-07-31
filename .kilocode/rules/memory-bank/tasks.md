# Digital Pets - Development Workflows

This document defines repetitive tasks and workflows for the Digital Pets project.

## 🎉 COMPLETED CRITICAL FIXES

### ✅ COMPLETED: Fix Quest System Reward Distribution - RESOLVED January 2025
**Discovered:** January 2025 - System Verification
**Priority:** CRITICAL - Must fix before production launch
**Status:** ✅ **COMPLETED** - All quest rewards now working correctly
**Impact:** Quest completion now properly awards rewards to players (major gameplay functionality restored)
**Completion Time:** ~45 minutes (as estimated)

**Changes Made:**
- Added missing import for `getItemById` from `/src/data/items.ts`
- Added missing import for `ItemSystem` from `/src/systems/ItemSystem.ts`
- Fixed incomplete item reward distribution in `distributeRewards()` method
- Fixed incomplete experience reward distribution using existing `playerStats.experience`
- Added 6 comprehensive unit tests covering all reward types and edge cases
- Verified graceful handling of invalid item IDs and edge cases

**Files Modified:**
- `/src/systems/QuestSystem.ts` - Fixed reward distribution implementation
- `/tests/systems/QuestSystem.test.ts` - Added comprehensive reward tests

**Validation Results:**
- ✅ All 415 tests passing (increased from 409)
- ✅ TypeScript compilation clean
- ✅ Linting passes
- ✅ Production build successful
- ✅ All reward types verified working: gold, experience, items, location unlocks

## 🚨 URGENT PRODUCTION FIXES (CRITICAL PRIORITY)

## 🚨 URGENT PRODUCTION FIXES (CRITICAL PRIORITY)

**🎉 NO CRITICAL ISSUES**: All major functionality is working correctly!

**🎉 NO TECHNICAL DEBT**: All documentation cleanup completed!

## 🎉 COMPLETED CRITICAL FIXES

### ✅ COMPLETED: Fix Game Loop Documentation Cleanup - RESOLVED January 2025
**Discovered:** January 2025 - System Verification
**Priority:** LOW - Documentation cleanup only
**Status:** ✅ **COMPLETED** - All documentation issues resolved
**Impact:** Technical debt resolved, code quality improved
**Completion Time:** ~10 minutes (faster than estimated 15 minutes)

**Changes Made:**
- **Fixed placeholder implementation** (Lines 245-248): Clarified that processBattleTick() is intentionally minimal because battles are turn-based
- **Fixed stale documentation** (Line 514): Updated comment to reflect that ItemSystem already exists and is implemented
- Added clear documentation explaining battle system architecture (turn-based vs tick-based)

**Files Modified:**
- `/src/engine/GameLoop.ts` - Updated documentation and clarified battle processing approach

**Validation Results:**
- ✅ All 415 tests passing
- ✅ TypeScript compilation clean
- ✅ Linting passes
- ✅ No functional changes, documentation only

### ✅ COMPLETED: Fix UI Display Issues (ID vs Name) - RESOLVED December 2024
**Last performed:** December 2024 - Issue #49
**Priority:** HIGH - User experience critical
**Status:** ✅ **COMPLETED** - All ID vs name display issues resolved
**Impact:** Major improvement to user interface quality and readability

**Files Modified:**
- `/src/data/locations.ts` - Added utility functions for data lookups
- `/src/components/world/ActivitiesPanel.tsx` - Fixed shopkeeper and item displays
- `/src/components/world/ShopModal.tsx` - Fixed shopkeeper displays  
- `/src/components/quest/QuestDialog.tsx` - Fixed NPC displays
- `/src/components/quest/QuestDetails.tsx` - Fixed quest giver displays
- `/tests/data/locations.test.ts` - Added tests for new utility functions

**Changes Made:**
1. ✅ Identified all instances where IDs were displayed instead of names
2. ✅ Created utility functions (`getNpcById`, etc.) in data files for proper lookups
3. ✅ Updated UI components to use utilities instead of displaying raw IDs
4. ✅ Handled TypeScript type safety (optional fields, null checks)
5. ✅ Fixed linting issues (case block declarations, prettier formatting) 
6. ✅ Wrote comprehensive unit tests for new utility functions
7. ✅ Verified all tests pass and linting is clean

**Results:**
- ✅ All UI displays now show proper names instead of technical IDs
- ✅ Enhanced user experience with readable interface text
- ✅ Improved data lookup patterns throughout application
- ✅ All 418 tests passing (at time of completion)


## 📋 NEXT DEVELOPMENT PHASE: WORLD CONTENT EXPANSION

### Current Content Assessment (January 2025)
**Existing Content:**
- **Locations**: 3 locations (Hometown, Forest Path, Riverside)
- **Quests**: 7 initial quests (tutorial and basic exploration)
- **NPCs**: 3 NPCs with basic dialogue
- **Activities**: Basic foraging, fishing, training per location

**Gap Analysis:**
- Limited world size (only 3 locations for ~2 year gameplay)
- Shallow quest chains (mostly single-objective quests)
- Minimal NPC interaction and storylines
- Limited location variety (no cities, dungeons, special areas)

### Phase 4A: World Content Expansion (High Priority)
**Timeline**: Next 2-3 development sessions
**Goal**: Create a richer, more engaging world with meaningful exploration

#### Priority 1: New Locations (Immediate Next Task)
**Target**: Add 2-3 new locations with unique themes and activities
**Locations to Create:**
1. **Mountain Village** - Higher level area with mining activities
   - NPCs: Blacksmith, Mining Guide, Village Elder
   - Activities: Mining (rare metals), Rock Climbing (training), Trading
   - Unique rewards: Equipment items, rare gems, crafting materials

2. **Coastal Harbor** - Trading hub with ship-based activities
   - NPCs: Harbor Master, Merchant Captain, Fishmonger
   - Activities: Deep Sea Fishing, Ship Maintenance, Trade Negotiations
   - Unique rewards: Exotic items, rare fish, navigation tools

3. **Ancient Ruins** - End-game exploration area
   - NPCs: Archaeologist, Guardian Spirit, Treasure Hunter
   - Activities: Artifact Hunting, Puzzle Solving, Battle Challenges
   - Unique rewards: Legendary items, ancient knowledge, rare pets

#### Priority 2: Enhanced Quest Chains
**Target**: Expand from 7 to 15+ quests with meaningful storylines
**Quest Chains to Create:**
1. **The Great Discovery** (4-part chain)
   - Investigate strange phenomena in the forest
   - Travel to mountain village for answers
   - Explore ancient ruins
   - Uncover the truth about the digital pet world

2. **Master Trader** (3-part chain)
   - Learn basic trading in hometown
   - Establish trade routes to new locations
   - Become a renowned merchant

3. **Pet Mastery** (5-part chain)
   - Master basic pet care
   - Learn advanced training techniques
   - Battle increasingly challenging opponents
   - Unlock rare pet species
   - Achieve pet mastery status

#### Priority 3: NPC Development
**Target**: Expand from 3 to 8+ NPCs with rich personalities
**NPC Categories to Add:**
1. **Merchants**: Specialized shop keepers in each location
2. **Trainers**: Pet training specialists and battle masters
3. **Quest Givers**: Story-driven characters with multi-part quests
4. **Lore Keepers**: Characters who provide world background and tips

### Implementation Workflow for World Expansion

#### Create New Location Workflow
**Files to modify per location:**
1. `src/data/locations.ts` - Add location definition with activities and NPCs
2. `src/data/quests.ts` - Add location-specific quests
3. `src/data/items.ts` - Add location-specific rewards (if needed)
4. `tests/data/locations.test.ts` - Add validation tests for new location
5. `tests/systems/WorldSystem.test.ts` - Add integration tests

**Implementation Steps:**
1. **Design Phase**: Define location theme, activities, NPCs, and rewards
2. **Content Creation**: Write location data, NPC dialogue, activity definitions
3. **Quest Integration**: Create quests that guide players to explore new location
4. **Testing**: Validate location functionality and balance
5. **Integration**: Ensure smooth travel and progression flow

#### Quest Chain Development Workflow
**Files to modify per quest chain:**
1. `src/data/quests.ts` - Add quest definitions with prerequisites
2. `src/data/locations.ts` - Update NPCs with quest dialogue
3. `tests/systems/QuestSystem.test.ts` - Add comprehensive quest tests

**Important Considerations:**
- **Prerequisites**: Ensure logical quest progression
- **Rewards**: Balance quest rewards with game economy
- **Narrative**: Create compelling storylines that enhance world lore
- **Objectives**: Mix different objective types (collect, explore, battle, delivery)

### Expected Impact
**Gameplay Duration**: Extend meaningful content from weeks to months
**Player Engagement**: Provide clear progression goals and discovery rewards
**World Depth**: Create immersive environment with rich lore and character interaction
**Replayability**: Multiple quest paths and exploration strategies

## Legacy Task Workflows (Reference Only)

All major system implementation tasks have been completed. The following workflows are preserved for reference in case new systems need to be added in the future:
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