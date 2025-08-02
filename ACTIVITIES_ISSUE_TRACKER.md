# Digital Pets - Activities System Issue Tracker

This document tracks all identified issues in the activities system and provides detailed task breakdowns for implementing fixes.

## Priority 1: Critical Issues (Must Fix First)

**OVERALL STATUS**: ✅ **ALL CRITICAL ISSUES COMPLETED**

All critical activity system issues have been resolved:
- ✅ Negative energy activities fixed
- ✅ Activity type definitions corrected  
- ✅ Offline reward processing implemented
- ✅ Comprehensive error handling added
- ✅ All 503 tests passing (including 6 new validation tests)

### 🔴 CRITICAL-001: Fix Invalid Negative Energy Activities

**Status**: ✅ COMPLETED  
**Impact**: Game-breaking - activities restore energy instead of consuming it  
**Files**: `src/data/locations.ts`

#### Subtasks:

- [x] **CRITICAL-001.1**: Fix Riverside Rest Activity
  - [x] Open `src/data/locations.ts`
  - [x] Navigate to Riverside location (~line 206)
  - [x] Find activity with `id: "riverside_rest"`
  - [x] Change `energyCost: -10` to `energyCost: 5`
  - [x] Update `name: "Rest by the Water"` to `name: "Peaceful Reflection"`
  - [x] Update id to match new name
  - [x] Update description to reflect energy consumption
  - [x] Increase experience reward from 5 to 8
  - [x] Add herb item reward: `{ type: "item", id: "herb", amount: 1, probability: 0.2 }`

- [x] **CRITICAL-001.2**: Fix Mountain Rest Activity
  - [x] Open `src/data/locations.ts`
  - [x] Navigate to Mountain Village location (~line 312)
  - [x] Find activity with `id: "mountain_rest"`
  - [x] Change `energyCost: -15` to `energyCost: 15`
  - [x] Update `name: "Rest at High Altitude"` to `name: "High Altitude Training"`
  - [x] Update id to match new name
  - [x] Change `type: "foraging"` to `type: "training"`
  - [x] Update description to reflect training activity
  - [x] Increase experience reward from 8 to 12
  - [x] Add gold reward: `{ type: "gold", amount: 5, probability: 0.2 }`

- [x] **CRITICAL-001.3**: Fix Pond Meditation Activity
  - [x] Open `src/data/locations.ts`
  - [x] Navigate to Quiet Pond location (~line 1117)
  - [x] Find activity with `id: "pond_meditation"`
  - [x] Change `energyCost: -5` to `energyCost: 10`
  - [x] Update `name: "Peaceful Meditation"` to `name: "Mindful Practice"`
  - [x] Update id to match new name
  - [x] Change `type: "foraging"` to `type: "training"`
  - [x] Update description to reflect training activity
  - [x] Increase experience reward from 6 to 8

- [x] **CRITICAL-001.4**: Verify All Energy Costs Are Positive
  - [x] Run through all 22 activities in locations.ts (verified all positive)
  - [x] Confirm no activities have negative energyCost values
  - [x] Create test to validate all future activities have positive energy costs

### 🔴 CRITICAL-002: Fix Activity Type Definitions

**Status**: ✅ COMPLETED  
**Impact**: Type system allows invalid activity types  
**Files**: `src/types/World.ts`

#### Subtasks:

- [x] **CRITICAL-002.1**: Update ActivityType Definition
  - [x] Open `src/types/World.ts`
  - [x] Navigate to line 5
  - [x] Find: `export type ActivityType = "foraging" | "fishing" | "mining" | "shop" | "training" | "battle" | "quest";`
  - [x] Replace with: `export type ActivityType = "foraging" | "fishing" | "mining" | "training";`
  - [x] Remove the invalid types: "shop", "battle", "quest"

- [x] **CRITICAL-002.2**: Verify Type Usage Across Codebase
  - [x] Search codebase for any usage of "shop", "battle", or "quest" as activity types
  - [x] Confirm no activities are using these invalid types (verified via tests)
  - [x] Update any type checking or validation that references these types

### 🔴 CRITICAL-003: Fix Offline Activity Reward Processing

**Status**: ✅ COMPLETED  
**Impact**: Players lose all rewards from offline activity completion  
**Files**: `src/engine/GameLoop.ts`

#### Subtasks:

- [x] **CRITICAL-003.1**: Import Required Dependencies
  - [x] Open `src/engine/GameLoop.ts`
  - [x] Add import: `import { getLocationById } from "@/data/locations";`
  - [x] Verify `ActivityReward` type is imported from `@/types/World`

- [x] **CRITICAL-003.2**: Fix Offline Activity Processing Logic
  - [x] Navigate to lines 500-513 in `GameLoop.ts`
  - [x] Replace the entire offline activity filter logic
  - [x] Create `completedActivities` array to track activities and their rewards
  - [x] For each completed activity, get activity definition from location data
  - [x] Calculate rewards based on probability rolls
  - [x] Store activity and rewards for later processing

- [x] **CRITICAL-003.3**: Process Offline Activity Rewards
  - [x] After the activity filtering loop
  - [x] Iterate through all completed activities
  - [x] Call existing `processActivityRewards` method for each set of rewards
  - [x] Ensure rewards are properly added to inventory and game state and saved

- [x] **CRITICAL-003.4**: Add Offline Reward Processing Tests
  - [x] Create test that starts an activity
  - [x] Simulate offline time passage
  - [x] Verify rewards are properly distributed to inventory and saved
  - [x] Test multiple activity completions during offline time

### 🔴 CRITICAL-004: Improve Activity Reward Error Handling

**Status**: ✅ COMPLETED  
**Impact**: Silent reward loss when item additions fail  
**Files**: `src/engine/GameLoop.ts`

#### Subtasks:

- [x] **CRITICAL-004.1**: Fix Item Reward Error Handling
  - [x] Open `src/engine/GameLoop.ts`
  - [x] Navigate to `processActivityRewards` method (~line 277-329)
  - [x] Find the "item" case in the reward processing switch
  - [x] Add error handling for failed `ItemSystem.addItem` calls
  - [x] Convert failed item additions to gold compensation
  - [x] Add action logging for compensation events

- [x] **CRITICAL-004.2**: Handle Missing Item Definitions
  - [x] In the same "item" case
  - [x] Add error handling for when `getItemById` returns null/undefined
  - [x] Provide default gold compensation for missing items
  - [x] Log errors for debugging and monitoring
  - [x] Add action logging for missing item events

- [x] **CRITICAL-004.3**: Handle Malformed Item Rewards
  - [x] Add validation for rewards missing required properties (id, amount)
  - [x] Provide minimal gold compensation for malformed rewards
  - [x] Add comprehensive error logging
  - [x] Ensure game doesn't crash on bad reward data

- [x] **CRITICAL-004.4**: Add Reward Processing Tests
  - [x] Test successful item addition
  - [x] Test failed item addition (full inventory)
  - [x] Test missing item definition
  - [x] Test malformed reward data
  - [x] Verify compensation gold is properly awarded

## Priority 2: High Priority Issues

**OVERALL STATUS**: ✅ **HIGH PRIORITY ISSUES COMPLETED**

### 🟡 HIGH-001: Complete Activity Requirements Validation

**Status**: ✅ COMPLETED  
**Impact**: Some activity requirements cannot be enforced  
**Files**: `src/systems/WorldSystem.ts`

#### Subtasks:

- [x] **HIGH-001.1**: Add Quest Completion Requirement Handling
  - [x] Open `src/systems/WorldSystem.ts`
  - [x] Navigate to requirements validation switch (~line 258-274)
  - [x] Add case for "quest_completed"
  - [x] Add warning log for unimplemented quest integration
  - [x] Plan for future QuestSystem integration

- [x] **HIGH-001.2**: Add Pet Species Requirement Handling
  - [x] In the same switch statement
  - [x] Add case for "pet_species"
  - [x] Compare `pet.species.id` with required species
  - [x] Return appropriate error message for species mismatch

- [x] **HIGH-001.3**: Add Default Case for Unknown Requirements
  - [x] Add default case to switch statement
  - [x] Log warning for unknown requirement types
  - [x] Prevent crashes from future requirement types

- [x] **HIGH-001.4**: Test Activity Requirements
  - [x] Test level requirements (existing)
  - [x] Test item requirements (existing)
  - [x] Test pet species requirements (new)
  - [x] Test unknown requirement types don't crash

## Priority 3: Medium Priority Improvements

### 🟢 MEDIUM-001: Enhanced Activity Cancellation

**Status**: ❌ Not Started  
**Impact**: Improved user experience and fairness  
**Files**: `src/systems/WorldSystem.ts`

#### Subtasks:

- [ ] **MEDIUM-001.1**: Modify cancelActivity Method Signature
  - [ ] Open `src/systems/WorldSystem.ts`
  - [ ] Find `cancelActivity` method (~line 399-415)
  - [ ] Add optional `refundEnergy: boolean = false` parameter
  - [ ] Update return type to include `energyRefunded?: number`

- [ ] **MEDIUM-001.2**: Implement Energy Refund Logic
  - [ ] Calculate activity progress based on remaining ticks
  - [ ] Calculate partial energy refund (50% of unused energy)
  - [ ] Only refund for activities with positive energy costs
  - [ ] Update return message to include refund information

- [ ] **MEDIUM-001.3**: Update UI for Energy Refunds
  - [ ] Modify activity cancellation calls in components
  - [ ] Display energy refund information to user
  - [ ] Update cancel button tooltip/description

- [ ] **MEDIUM-001.4**: Test Activity Cancellation
  - [ ] Test cancellation without refund (existing behavior)
  - [ ] Test cancellation with energy refund
  - [ ] Test partial progress refund calculations
  - [ ] Test edge cases (just started, almost complete)
 
 ### 🟢 MEDIUM-002: Activity Log System Implementation
 
 **Status**: ❌ Not Started
 **Impact**: Provides players with detailed history and progress tracking
 **Files**: `src/types/GameState.ts`, `src/systems/WorldSystem.ts`, `src/engine/GameLoop.ts`, `src/components/world/ActivityLogPanel.tsx`
 
 #### Subtasks:
 
 - [ ] **MEDIUM-002.1**: Define Activity Log Data Types
   - [ ] Open `src/types/World.ts`
   - [ ] Add `ActivityLogEntry` interface with required fields:
     - [ ] `id: string` - unique identifier for each log entry
     - [ ] `activityId: string` - reference to the activity definition
     - [ ] `locationId: string` - where the activity was performed
     - [ ] `status: "started" | "cancelled" | "completed"` - current state
     - [ ] `energyCost: number` - energy consumed when starting
     - [ ] `startTime: number` - timestamp when activity began
     - [ ] `endTime?: number` - timestamp when activity finished (optional)
     - [ ] `results: ActivityLogResult[]` - array of rewards/outcomes
   - [ ] Add `ActivityLogResult` interface:
     - [ ] `type: "item" | "gold" | "experience" | "none"`
     - [ ] `itemId?: string` - for item rewards
     - [ ] `amount?: number` - quantity received
     - [ ] `description: string` - human-readable description
 
 - [ ] **MEDIUM-002.2**: Add Activity Log to Game State
   - [ ] Open `src/types/GameState.ts`
   - [ ] Add `activityLog: ActivityLogEntry[]` to GameState interface
   - [ ] Ensure log is included in save/load operations
   - [ ] Add migration logic for existing save games without activity log
 
 - [ ] **MEDIUM-002.3**: Implement Activity Log Manager
   - [ ] Create new file `src/systems/ActivityLogSystem.ts`
   - [ ] Add static method `addLogEntry(gameState: GameState, entry: Omit<ActivityLogEntry, 'id'>): void`
     - [ ] Generate unique ID for each entry
     - [ ] Add entry to beginning of activity log array
     - [ ] Maintain maximum of 100 entries (remove oldest)
     - [ ] Ensure log is properly sorted by start time (newest first)
   - [ ] Add static method `updateLogEntry(gameState: GameState, entryId: string, updates: Partial<ActivityLogEntry>): void`
     - [ ] Find entry by ID
     - [ ] Update specified fields
     - [ ] Handle case where entry is not found
   - [ ] Add static method `getLogEntries(gameState: GameState, limit?: number): ActivityLogEntry[]`
     - [ ] Return log entries with optional limit
     - [ ] Default to returning all entries
     - [ ] Maintain chronological order (newest first)
 
 - [ ] **MEDIUM-002.4**: Integrate Log Creation in WorldSystem
   - [ ] Open `src/systems/WorldSystem.ts`
   - [ ] Import `ActivityLogSystem` from new file
   - [ ] Modify `startActivity` method (~line 165):
     - [ ] After successful activity start, create log entry
     - [ ] Set status to "started"
     - [ ] Record start time, energy cost, activity and location IDs
     - [ ] Initialize empty results array
   - [ ] Modify `cancelActivity` method (~line 399):
     - [ ] Find corresponding log entry by activity and start time
     - [ ] Update status to "cancelled"
     - [ ] Set end time to current timestamp
     - [ ] Add cancellation result with "-" description
 
 - [ ] **MEDIUM-002.5**: Integrate Log Completion in GameLoop
   - [ ] Open `src/engine/GameLoop.ts`
   - [ ] Import `ActivityLogSystem`
   - [ ] Modify activity completion logic in `tick` method:
     - [ ] When activity completes, find corresponding log entry
     - [ ] Update status to "completed"
     - [ ] Calculate end time as start time + activity duration for online completion
     - [ ] For offline completion, set end time to completion timestamp
     - [ ] Record all rewards received in results array
   - [ ] Update offline activity processing:
     - [ ] For each completed offline activity, update corresponding log entry
     - [ ] Calculate proper end time using activity duration
     - [ ] Record rewards in results array
 
 - [ ] **MEDIUM-002.6**: Create Activity Log UI Component
   - [ ] Create new file `src/components/world/ActivityLogPanel.tsx`
   - [ ] Implement main component with proper imports and types
   - [ ] Add state management for log display (filtering, pagination)
   - [ ] Create log entry display component:
     - [ ] Show activity name (resolved from activityId)
     - [ ] Show location name (resolved from locationId)
     - [ ] Show status with appropriate styling/badges
     - [ ] Display energy cost consumed
     - [ ] Format start and end times in readable format
     - [ ] List all results/rewards received
   - [ ] Add filtering options:
     - [ ] Filter by status (all, completed, cancelled, in progress)
     - [ ] Filter by activity type (foraging, fishing, mining, training)
     - [ ] Filter by location
     - [ ] Filter by date range (today, this week, all time)
 
 - [ ] **MEDIUM-002.7**: Implement Activity Log Display Features
   - [ ] In `ActivityLogPanel.tsx`, add search functionality:
     - [ ] Search by activity name
     - [ ] Search by location name
     - [ ] Search by reward items
   - [ ] Add sorting options:
     - [ ] Sort by start time (default: newest first)
     - [ ] Sort by duration (shortest to longest)
     - [ ] Sort by energy cost (lowest to highest)
     - [ ] Sort by rewards value
   - [ ] Add pagination or virtual scrolling for performance:
     - [ ] Display 20 entries per page
     - [ ] Add navigation controls
     - [ ] Show total count and current page
   - [ ] Add export/summary features:
     - [ ] Show summary statistics (total activities, time spent, rewards earned)
     - [ ] Add "Export Log" button for data download
 
 - [ ] **MEDIUM-002.8**: Integrate Activity Log into World Screen
   - [ ] Open `src/components/world/WorldScreen.tsx`
   - [ ] Import `ActivityLogPanel` component
   - [ ] Add new tab or expandable section for Activity Log
   - [ ] Ensure proper state management and re-rendering
   - [ ] Add responsive design for mobile devices
   - [ ] Include loading states and error handling
 
 - [ ] **MEDIUM-002.9**: Add Activity Log Helper Functions
   - [ ] Create utility functions in `src/lib/utils.ts`:
     - [ ] `formatActivityDuration(startTime: number, endTime?: number): string`
     - [ ] `formatActivityResults(results: ActivityLogResult[]): string`
     - [ ] `getActivityDisplayName(activityId: string): string`
     - [ ] `getLocationDisplayName(locationId: string): string`
     - [ ] `calculateActivityValue(results: ActivityLogResult[]): number`
   - [ ] Add time formatting utilities:
     - [ ] Format timestamps to local time
     - [ ] Show relative time (e.g., "2 hours ago")
     - [ ] Handle timezone display preferences
 
 - [ ] **MEDIUM-002.10**: Implement Activity Log Data Migration
   - [ ] Open `src/storage/GameStorage.ts`
   - [ ] Add migration logic for existing save games:
     - [ ] Check if activityLog exists in loaded game state
     - [ ] Initialize empty log array if missing
     - [ ] Ensure backward compatibility
     - [ ] Add version tracking for future migrations
   - [ ] Update save validation:
     - [ ] Validate log entry structure
     - [ ] Ensure log doesn't exceed 100 entries
     - [ ] Clean up malformed entries during load
 
 - [ ] **MEDIUM-002.11**: Add Comprehensive Activity Log Tests
   - [ ] Create `tests/systems/ActivityLogSystem.test.ts`:
     - [ ] Test log entry creation and ID generation
     - [ ] Test 100-entry limit maintenance
     - [ ] Test log entry updates
     - [ ] Test chronological ordering
     - [ ] Test edge cases (empty log, invalid IDs)
   - [ ] Add integration tests:
     - [ ] Test activity start → log creation
     - [ ] Test activity completion → log update
     - [ ] Test activity cancellation → log update
     - [ ] Test offline activity completion
   - [ ] Add UI component tests:
     - [ ] Test log display rendering
     - [ ] Test filtering and sorting
     - [ ] Test search functionality
     - [ ] Test pagination controls
 
 - [ ] **MEDIUM-002.12**: Performance Optimization and Polish
   - [ ] Optimize log rendering performance:
     - [ ] Implement virtual scrolling for large logs
     - [ ] Memoize expensive computations
     - [ ] Lazy load activity/location names
   - [ ] Add accessibility features:
     - [ ] Screen reader support
     - [ ] Keyboard navigation
     - ] Proper ARIA labels and descriptions
   - [ ] Add responsive design:
     - [ ] Mobile-friendly layout
     - [ ] Touch-friendly controls
     - [ ] Compact view for smaller screens
   - [ ] Polish user experience:
     - [ ] Add smooth animations and transitions
     - [ ] Include helpful tooltips and explanations
     - [ ] Add empty state messaging
     - [ ] Include activity icons for visual appeal
 
 ### 🟢 MEDIUM-003: Activity Statistics Tracking

**Status**: ❌ Not Started  
**Impact**: Enables achievement systems and progression tracking  
**Files**: `src/types/GameState.ts`, `src/engine/GameLoop.ts`

#### Subtasks:

- [ ] **MEDIUM-003.1**: Add ActivityStats Interface
  - [ ] Open `src/types/GameState.ts`
  - [ ] Add `ActivityStats` interface with completion counts
  - [ ] Include stats by activity type
  - [ ] Add total time spent and rewards earned tracking

- [ ] **MEDIUM-003.2**: Add ActivityStats to GameState
  - [ ] Add `activityStats: ActivityStats` to GameState interface
  - [ ] Update game state initialization
  - [ ] Ensure stats are saved and loaded properly

- [ ] **MEDIUM-003.3**: Update Activity Completion Tracking
  - [ ] Modify activity completion logic in GameLoop
  - [ ] Increment completion counters
  - [ ] Track time spent per activity type
  - [ ] Track rewards earned by type

- [ ] **MEDIUM-003.4**: Create Activity Statistics Display
  - [ ] Add UI component to display activity statistics
  - [ ] Show completion counts by activity type
  - [ ] Display time spent and rewards earned
  - [ ] Add to game menu or statistics screen

## Priority 4: Low Priority Enhancements

### 🔵 LOW-001: Activity System Optimization

**Status**: ❌ Not Started  
**Impact**: Performance and maintainability improvements  

#### Subtasks:

- [ ] **LOW-001.1**: Optimize Activity Lookup Performance
  - [ ] Cache activity definitions for faster access
  - [ ] Index activities by ID for O(1) lookup
  - [ ] Profile activity processing performance

- [ ] **LOW-001.2**: Add Activity Data Validation
  - [ ] Create validation schema for activity definitions
  - [ ] Validate all activities at startup
  - [ ] Add warnings for balance issues (energy vs rewards)

- [ ] **LOW-001.3**: Improve Activity Balance
  - [ ] Analyze energy cost vs reward ratios
  - [ ] Ensure progression feels balanced
  - [ ] Adjust durations for better pacing

## Testing Checklist

### Critical Tests (Must Pass Before Release)

- [x] **Energy Cost Tests**
  - [x] All activities have positive energy costs (verified: 22 activities all positive)
  - [x] Energy validation prevents negative costs
  - [x] Energy is properly deducted on activity start

- [x] **Offline Reward Tests**
  - [x] Activities completed offline distribute rewards (implemented in GameLoop)
  - [x] Multiple offline activities process correctly
  - [x] Rewards are added to correct inventory slots

- [x] **Error Handling Tests**
  - [x] Failed item additions provide gold compensation (implemented)
  - [x] Missing item definitions are handled gracefully (implemented)
  - [x] Malformed reward data doesn't crash game (implemented)

- [x] **Activity Type Tests**
  - [x] Only valid activity types are accepted (verified: foraging, fishing, mining, training)
  - [x] Type checking prevents invalid activities
  - [x] All existing activities use valid types (verified: 22 activities)

### Integration Tests

- [x] **Full Activity Cycle**
  - [x] Start activity → energy deducted → time passes → rewards received
  - [x] Activity cancellation works correctly
  - [x] Pet state updates properly during activities

- [x] **Save/Load Tests**
  - [x] Active activities persist across save/load
  - [x] Activity progress is maintained
  - [x] Offline progression calculates correctly

## Implementation Schedule

### Week 1: Critical Fixes
- [ ] Days 1-2: Fix negative energy activities and type definitions
- [ ] Days 3-4: Fix offline reward processing
- [ ] Day 5: Add energy validation and error handling

### Week 2: High Priority
- [ ] Days 1-2: Complete activity requirements validation
- [ ] Days 3-5: Testing and bug fixes

### Week 3+: Medium/Low Priority
- [ ] Enhanced cancellation system
- [ ] Statistics tracking
- [ ] Performance optimizations

## Notes

- All critical fixes must be completed before any new features
- Each fix should include comprehensive tests
- Consider backward compatibility for existing save games
- Document any breaking changes for players