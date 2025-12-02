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

## Current State Analysis

### Files to Modify
- `src/game/types/activity.ts` - Update types for new exploration system
- `src/game/types/location.ts` - Add drop/encounter table references per location
- `src/game/data/exploration/activities.ts` - Already partially implemented, needs refinement
- `src/game/data/exploration/dropTables.ts` - Already partially implemented, needs integration with locations
- `src/game/data/tables/encounters.ts` - Needs update for activity-specific encounters
- `src/game/data/tables/forage.ts` - **DEPRECATE** - Replace with new drop table system
- `src/game/data/locations/wild.ts` - Update to use new drop/encounter table structure
- `src/game/core/exploration/exploration.ts` - Already partially implemented, needs completion
- `src/game/core/exploration/forage.ts` - **DEPRECATE** - Merge into exploration.ts
- `src/game/core/exploration/encounter.ts` - Update for activity-specific encounters
- `src/game/core/tickProcessor.ts` - Update to use new exploration system
- `src/game/state/actions/exploration.ts` - Update action handlers
- `src/components/exploration/ActivitySelect.tsx` - Update for multiple activities
- `src/components/exploration/ExplorationProgress.tsx` - Update for new activity system
- `src/components/screens/ExplorationScreen.tsx` - Update to support multiple activities

### Files to Delete (after migration)
- `src/game/data/tables/forage.ts` - Replaced by drop tables
- `src/game/core/exploration/forage.ts` - Merged into exploration.ts

---

## Phase 1: Type System Updates

### Task 1.1: Update Activity Types (`src/game/types/activity.ts`)

Update `ActiveExploration` interface:
```typescript
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

Add requirement types:
```typescript
export interface ExplorationActivityRequirements {
  /** Map of skill IDs to minimum required levels */
  minSkillLevels?: Record<string, number>;
  /** Minimum growth stage required */
  minPetStage?: GrowthStage;
  /** Quest IDs that must be completed */
  questCompleted?: string[];
}

export interface DropEntryRequirements {
  /** Map of skill IDs to minimum required levels */
  minSkillLevels?: Record<string, number>;
  /** Minimum growth stage required */
  minPetStage?: GrowthStage;
  /** Quest IDs that must be completed */
  questCompleted?: string[];
}
```

Remove deprecated:
- `ExplorationActivityType` enum (activities are now data-driven by ID)
- `forageTableId` from `ActiveExploration`

### Task 1.2: Update Location Types (`src/game/types/location.ts`)

Add new fields to `Location` interface:
```typescript
export interface Location {
  // ... existing fields ...
  /** Drop table IDs for each activity at this location */
  dropTableIds?: Record<string, string[]>;
  /** Encounter table ID for this location */
  encounterTableId?: string;
}
```

Remove deprecated:
- `forageTableId` (replaced by `dropTableIds`)

### Task 1.3: Update Pet Cooldown Tracking

Add to Pet type or a separate cooldown tracker:
```typescript
/** Map of activity ID to cooldown end tick per location */
activityCooldowns?: Record<string, Record<string, Tick>>;
```

---

## Phase 2: Data Layer Updates

### Task 2.1: Update Activity Definitions (`src/game/data/exploration/activities.ts`)

Ensure all activities have:
- `id`, `name`, `description`
- `duration` (ticks)
- `energyCost`
- `requirements` (optional)
- `encounterChance` (0.0-1.0)
- `cooldownDuration` (optional, ticks)
- `skillFactors` (map of skill ID to XP multiplier)

### Task 2.2: Create Drop Table System (`src/game/data/exploration/dropTables.ts`)

Already partially implemented. Ensure:
- Each entry has: `itemId`, `quantity`, `minRoll`, `requirements`
- Drop tables are organized by location and activity
- Helper function: `getDropTablesForLocationAndActivity(locationId, activityId)`

### Task 2.3: Update Encounter Tables (`src/game/data/tables/encounters.ts`)

Add `activityIds` field to encounter entries:
```typescript
export interface EncounterEntry {
  encounterType: EncounterType;
  probability: number;
  speciesIds: string[];
  levelOffset: [number, number];
  activityIds?: string[];  // NEW: activities that can trigger this encounter
  requirements?: EncounterEntryRequirements;
}
```

Add encounter types:
```typescript
export const EncounterType = {
  WildBattle: "wildBattle",
  NPCMeeting: "npcMeeting",
  Discovery: "discovery",
  Event: "event",
} as const;
```

### Task 2.4: Update Location Data (`src/game/data/locations/wild.ts`)

For each wild location:
- Remove `forageTableId`
- Add `dropTableIds` mapping activity IDs to drop table IDs
- Verify `encounterTableId` is set

Example:
```typescript
export const sunnyMeadow: Location = {
  id: "meadow",
  // ... other fields ...
  dropTableIds: {
    forage: ["meadow_foraging"],
    mining: ["meadow_mining"],
  },
  encounterTableId: "meadow_encounters",
};
```

---

## Phase 3: Core Logic Updates

### Task 3.1: Consolidate Exploration Logic (`src/game/core/exploration/exploration.ts`)

Merge functionality from `forage.ts` into `exploration.ts`:

1. **`canStartExplorationActivity(pet, locationId, activityId)`**
   - Check location exists and is wild
   - Check activity exists
   - Check activity requirements (skills, stage, quests)
   - Check pet has enough energy
   - Check cooldown

2. **`startExplorationActivity(pet, locationId, activityId, currentTick)`**
   - Deduct energy
   - Set activity state
   - Create `ActiveExploration` record

3. **`processExplorationTick(exploration)`**
   - Decrement `ticksRemaining`
   - Return null when complete

4. **`completeExplorationActivity(pet, player)`**
   - Get drop tables for location + activity
   - Calculate drops using single roll
   - Check encounter chance
   - Return result with items, encounter info

5. **`cancelExploration(pet)`**
   - Refund full energy
   - Clear activity state
   - No cooldown applied

6. **`calculateExplorationDrops(dropTables, pet)`**
   - Generate single random roll (0.0-1.0)
   - For each entry: check requirements, check roll >= minRoll
   - Aggregate drops by itemId

### Task 3.2: Update Encounter System (`src/game/core/exploration/encounter.ts`)

1. **`checkForEncounter(activityId, encounterChance)`**
   - Roll against activity's encounterChance
   - Return encounter result

2. **`generateEncounter(locationId, activityId, pet)`**
   - Filter encounter table by activityIds
   - Roll for encounter type
   - Generate wild pet level using formula from spec

### Task 3.3: Update Tick Processor (`src/game/core/tickProcessor.ts`)

Update exploration processing:
- Use `exploration.ts` functions instead of `forage.ts`
- Handle new `activityId` field instead of `activityType`
- Award skill XP based on activity's `skillFactors`
- Apply cooldown on completion

---

## Phase 4: State Actions Updates

### Task 4.1: Update Exploration Actions (`src/game/state/actions/exploration.ts`)

1. **`startExplorationActivity(state, activityId)`**
   - Replace `startForaging` with generic activity start
   - Validate activity and requirements

2. **`cancelExploration(state)`**
   - Already implemented, verify full energy refund

3. **`applyExplorationResults(state, result)`**
   - Update to handle multiple skill XP awards
   - Use activity's `skillFactors` for XP distribution

Remove deprecated:
- `startForaging` (use `startExplorationActivity`)

### Task 4.2: Update Exploration Tests (`src/game/state/actions/exploration.test.ts`)

- Update tests for new activity-based system
- Add tests for requirements checking
- Add tests for skill XP distribution via skillFactors
- Add tests for cooldown behavior

---

## Phase 5: Component Updates

### Task 5.1: Update Activity Selection (`src/components/exploration/ActivitySelect.tsx`)

- Accept list of available activities
- Show activity requirements and costs
- Indicate cooldown status
- Allow selecting any unlocked activity

### Task 5.2: Update Progress Display (`src/components/exploration/ExplorationProgress.tsx`)

- Display activity name dynamically
- Remove hardcoded "Foraging" text
- Show activity-specific icon/emoji

### Task 5.3: Update Exploration Screen (`src/components/screens/ExplorationScreen.tsx`)

- Fetch available activities for current location
- Filter activities by requirements
- Display multiple activity options
- Handle activity selection and start

---

## Phase 6: Cleanup

### Task 6.1: Remove Deprecated Files

After all migrations complete and tests pass:
- Delete `src/game/data/tables/forage.ts`
- Delete `src/game/core/exploration/forage.ts`
- Delete `src/game/core/exploration/forage.test.ts`

### Task 6.2: Update Imports

Search and replace all imports from deprecated files:
- `forage.ts` → `exploration.ts`
- `ForageTable` type → `DropTable`

### Task 6.3: Final Test Pass

Run full test suite to ensure:
- All exploration features work
- No regressions in related systems
- Type checking passes

---

## Implementation Order

1. **Phase 1** - Type System Updates (foundation for all other changes)
2. **Phase 2** - Data Layer Updates (activities, drop tables, locations)
3. **Phase 3** - Core Logic Updates (main implementation)
4. **Phase 4** - State Actions Updates (integration layer)
5. **Phase 5** - Component Updates (UI layer)
6. **Phase 6** - Cleanup (remove deprecated code)

## Notes

- Breaking changes are acceptable as this project is not live yet
- Each phase should be tested before moving to the next
- Keep the old system functional until the new system is fully validated
- Run `bun check && bun typecheck && bun test` after each phase
