# Exploration System Overhaul Implementation Plan

This document outlines the implementation plan for overhauling the exploration system to conform to the new specifications defined in `specs/exploration.md`.

## Overview

The new exploration system introduces:
- **Activity-based exploration** with configurable requirements (skill levels, pet stage, quest completion)
- **Roll-based drop tables** with a single roll determining all drops
- **Encounter tables** for events during exploration
- **Session management** with full energy refund on cancellation
- **Cooldowns** per activity at each location
- **Skill XP rewards** via activity-defined `skillFactors`

## Implementation Strategy

**Important:** To avoid type conflicts between legacy and new implementations, we will:
1. **Phase 0 (Cleanup):** Delete all legacy exploration code, tests, and types first
2. **Phase 1+:** Implement the new system from scratch with clean types

This approach prevents the agent from struggling with type mismatches from old `ForageTable`, `ExplorationActivityType`, `forageTableId`, etc. mixing with the new activity-based system.

## Current Legacy Implementation (To Be Deleted)

### Legacy Types
- `ExplorationActivityType` enum in `src/game/types/activity.ts`
- `ActiveExploration.activityType` (uses enum)
- `ActiveExploration.forageTableId` (foraging-specific)
- `ForageTable` and `ForageEntry` interfaces in `src/game/data/tables/forage.ts`
- `Location.forageTableId` in location definitions

### Legacy Files
- `src/game/data/tables/forage.ts` - Old forage table definitions
- `src/game/core/exploration/forage.ts` - Old foraging logic
- `src/game/core/exploration/forage.test.ts` - Tests for old system

### Legacy Dependencies (Need Updates After Cleanup)
- `src/game/state/actions/exploration.ts` - Imports from forage.ts
- `src/game/core/tickProcessor.ts` - Uses forage completion logic
- `src/components/exploration/ActivitySelect.tsx` - Uses ForageTable type
- `src/components/exploration/ExplorationProgress.tsx` - Uses activityType
- `src/components/screens/ExplorationScreen.tsx` - Uses forage functions

---

## Phase 0: Cleanup Legacy Code

Before implementing the new system, delete all legacy exploration code to start fresh.

### Task 0.1: Delete Legacy Test File

- [x] Delete `src/game/core/exploration/forage.test.ts`

This file tests the old forage-specific system and will be replaced with tests for the new activity-based system.

### Task 0.2: Delete Legacy Forage Logic

- [x] Delete `src/game/core/exploration/forage.ts`

This file contains:
- `canStartForaging()` - Will be replaced by `canStartActivity()`
- `startForaging()` - Will be replaced by `startExplorationActivity()`
- `processExplorationTick()` - Kept but moved to new exploration.ts
- `calculateForageDrops()` - Replaced by roll-based drop calculation
- `completeForaging()` - Replaced by `completeExplorationActivity()`
- `applyExplorationCompletion()` - Kept but moved to new exploration.ts
- `cancelExploration()` - Kept but moved to new exploration.ts
- `getExplorationProgress()` - Kept but moved to new exploration.ts
- `getLocationForageInfo()` - Replaced by activity-based lookup

### Task 0.3: Delete Legacy Forage Data

- [x] Delete `src/game/data/tables/forage.ts`

This file contains the old `ForageTable` and `ForageEntry` types plus all location-specific forage tables. Will be replaced by the new drop table system.

### Task 0.4: Clean Up Legacy Types in `src/game/types/activity.ts`

- [x] Remove `ExplorationActivityType` enum
- [x] Update `ActiveExploration` interface (replace `activityType` with `activityId`, remove `forageTableId`)

Remove:
```typescript
export const ExplorationActivityType = {
  Forage: "forage",
} as const;

export type ExplorationActivityType =
  (typeof ExplorationActivityType)[keyof typeof ExplorationActivityType];
```

Update `ActiveExploration` interface:
```typescript
// OLD (remove):
export interface ActiveExploration {
  activityType: ExplorationActivityType;
  locationId: string;
  forageTableId: string;  // <-- remove this
  startTick: Tick;
  durationTicks: Tick;
  ticksRemaining: Tick;
  energyCost: number;
}

// NEW (replace with):
export interface ActiveExploration {
  activityId: string;     // <-- activity ID instead of enum
  locationId: string;
  startTick: Tick;
  durationTicks: Tick;
  ticksRemaining: Tick;
  energyCost: number;
}
```

### Task 0.5: Update Location Type

- [x] Remove `forageTableId?: string` from Location interface
- [x] Add `dropTableIds?: Record<string, string[]>` to Location interface

In `src/game/types/location.ts`, update the `Location` interface:
- Remove `forageTableId?: string`
- Add `dropTableIds?: Record<string, string[]>` (activity ID → drop table IDs)
- (encounterTableId already exists)

### Task 0.6: Update Location Data Files

- [x] Remove `forageTableId` field from all locations
- [x] Add empty `dropTableIds: {}` placeholder to all locations

For each location in `src/game/data/locations/wild.ts`:
- Remove `forageTableId` field
- Add empty `dropTableIds: {}` as placeholder
- These will be populated when drop tables are created

### Task 0.7: Stub Out Broken Imports

After deleting the legacy files, the following files will have broken imports:

- [x] `src/game/state/actions/exploration.ts` - Stub exploration actions
- [x] `src/game/core/tickProcessor.ts` - Stub exploration completion logic
- [x] `src/components/exploration/ActivitySelect.tsx` - Stub component
- [x] `src/components/exploration/ExplorationProgress.tsx` - Stub component
- [x] `src/components/screens/ExplorationScreen.tsx` - Stub screen

For each file:
1. Remove/comment out broken imports
2. Add `// TODO: Implement with new exploration system` comments
3. Stub functions to return placeholder values or do nothing
4. Ensure the code compiles (typecheck passes)

### Task 0.8: Verify Clean State

- [x] Run `bun check && bun typecheck && bun test` to ensure all passes

Run `bun check && bun typecheck && bun test` to ensure:
- No type errors
- No broken imports
- All remaining tests pass

---

## Phase 1: New Type System

After cleanup, define the new types from scratch.

### Task 1.1: Define Activity Types (`src/game/types/activity.ts`)

- [x] Add `ExplorationRequirements` interface

Add new exploration types:
```typescript
/**
 * Requirements for exploration activities and drop entries.
 */
export interface ExplorationRequirements {
  /** Map of skill IDs to minimum required levels */
  minSkillLevels?: Record<string, number>;
  /** Minimum growth stage required */
  minPetStage?: GrowthStage;
  /** Quest IDs that must be completed */
  questCompleted?: string[];
}

/**
 * Active exploration state stored on the pet.
 */
export interface ActiveExploration {
  /** Activity ID being performed */
  activityId: string;
  /** Location ID where exploration is occurring */
  locationId: string;
  /** Tick when exploration started */
  startTick: Tick;
  /** Total ticks required */
  durationTicks: Tick;
  /** Ticks remaining */
  ticksRemaining: Tick;
  /** Energy cost paid to start (in micro units, for refund on cancel) */
  energyCost: number;
}
```

### Task 1.2: Define Activity Data Type (`src/game/types/exploration.ts`)

- [x] Create `src/game/types/exploration.ts` with new activity and drop table types

Create new file with activity definition types:
```typescript
import type { Tick } from "./common";
import type { ExplorationRequirements } from "./activity";

/**
 * Exploration activity definition.
 */
export interface ExplorationActivity {
  id: string;
  name: string;
  description: string;
  duration: Tick;
  energyCost: number;
  requirements?: ExplorationRequirements;
  encounterChance: number; // 0.0 to 1.0
  cooldownDuration?: Tick;
  skillFactors: Record<string, number>; // skill ID → XP multiplier
}

/**
 * Drop table entry with roll-based drops.
 */
export interface DropTableEntry {
  itemId: string;
  quantity: number;
  minRoll: number; // 0.0 to 1.0
  requirements?: ExplorationRequirements;
}

/**
 * Drop table for a location-activity combination.
 */
export interface DropTable {
  id: string;
  entries: DropTableEntry[];
}
```

### Task 1.3: Update Location Type (`src/game/types/location.ts`)

- [x] Ensure Location has `dropTableIds` and `encounterTableId` fields

Ensure Location has:
```typescript
export interface Location {
  // ... existing fields ...
  /** Drop table IDs for each activity at this location */
  dropTableIds?: Record<string, string[]>;
  /** Encounter table ID for this location */
  encounterTableId?: string;
}
```

### Task 1.4: Add Cooldown Tracking to Pet Type

- [x] Add `activityCooldowns` field to Pet type

In `src/game/types/pet.ts`:
```typescript
export interface Pet {
  // ... existing fields ...
  /** Activity cooldowns: locationId → activityId → cooldown end tick */
  activityCooldowns?: Record<string, Record<string, Tick>>;
}
```

---

## Phase 2: Data Layer

Create the data definitions for activities and drop tables.

### Task 2.1: Create Activity Definitions (`src/game/data/exploration/activities.ts`)

- [ ] Define activities like Foraging, Mining, Deep Exploration per spec examples

### Task 2.2: Create Drop Tables (`src/game/data/exploration/dropTables.ts`)

- [ ] Create roll-based drop tables for each location-activity combination

### Task 2.3: Update Location Data (`src/game/data/locations/wild.ts`)

- [ ] Add `dropTableIds` mappings to each wild location

### Task 2.4: Update Encounter Tables (`src/game/data/tables/encounters.ts`)

- [ ] Add `activityIds` field to filter encounters by activity

---

## Phase 3: Core Logic

Implement the new exploration system logic.

### Task 3.1: Create Exploration Module (`src/game/core/exploration/exploration.ts`)

- [x] Implement exploration module functions:
  - `canStartExplorationActivity(pet, locationId, activityId)`
  - `startExplorationActivity(pet, locationId, activityId, currentTick)`
  - `processExplorationTick(exploration)`
  - `completeExplorationActivity(pet, player)`
  - `cancelExploration(pet)`
  - `calculateExplorationDrops(dropTables, pet, roll)`
  - `getExplorationProgress(exploration)`
  - `getActivityCooldownRemaining(pet, locationId, activityId, currentTick)`

### Task 3.2: Update Encounter System (`src/game/core/exploration/encounter.ts`)

- [x] Filter encounters by activityIds
- [x] Implement level calculation per spec

### Task 3.3: Update Tick Processor (`src/game/core/tickProcessor.ts`)

- [x] Use new exploration functions
- [x] Award skill XP via activity's skillFactors
- [x] Apply cooldowns on completion

### Task 3.4: Write Tests (`src/game/core/exploration/exploration.test.ts`)

- [x] Test all new functions with the new type system

---

## Phase 4: State Actions

Wire up the exploration system to game state.

### Task 4.1: Update Exploration Actions (`src/game/state/actions/exploration.ts`)

- [ ] Implement `startExplorationActivity(state, activityId)`
- [ ] Implement `cancelExploration(state)`
- [ ] Implement `applyExplorationResults(state, result)`

### Task 4.2: Write Tests (`src/game/state/actions/exploration.test.ts`)

- [ ] Test state action handlers

---

## Phase 5: Components

Update UI components to use the new system.

### Task 5.1: Update ActivitySelect Component

- [ ] Accept list of activities from data
- [ ] Show requirements and costs
- [ ] Indicate cooldown status

### Task 5.2: Update ExplorationProgress Component

- [ ] Display activity name from activity data
- [ ] Remove hardcoded "Foraging"

### Task 5.3: Update ExplorationScreen Component

- [ ] Fetch available activities for location
- [ ] Filter by requirements
- [ ] Handle activity selection

---

## Implementation Order

1. **Phase 0** - Delete legacy code and tests (clean slate)
2. **Phase 1** - Define new type system
3. **Phase 2** - Create data layer (activities, drop tables)
4. **Phase 3** - Implement core logic with tests
5. **Phase 4** - Wire up state actions
6. **Phase 5** - Update UI components

## Notes

- Breaking changes are acceptable as this project is not live yet
- Run `bun check && bun typecheck && bun test` after each phase
- Phase 0 cleanup ensures no type conflicts between old and new systems
- After Phase 0, some features will be temporarily broken until Phase 3+ completes
