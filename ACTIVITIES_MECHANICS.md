# Digital Pets - Activities Mechanics Analysis

## Overview

This document provides a comprehensive analysis of the activities system in the Digital Pets game, examining the current implementation, identifying gaps and issues, and providing detailed recommendations for fixes and improvements.

## Current Implementation

### System Architecture

The activities system consists of several interconnected components:

1. **Activity Definitions** ([`src/data/locations.ts`](src/data/locations.ts))
2. **Core Logic** ([`src/systems/WorldSystem.ts`](src/systems/WorldSystem.ts))
3. **Game Loop Integration** ([`src/engine/GameLoop.ts`](src/engine/GameLoop.ts))
4. **User Interface** ([`src/components/world/ActivitiesPanel.tsx`](src/components/world/ActivitiesPanel.tsx))
5. **Type Definitions** ([`src/types/World.ts`](src/types/World.ts))
6. **React Hook** ([`src/hooks/useWorldState.ts`](src/hooks/useWorldState.ts))

### Activity Types Implemented

```typescript
type ActivityType = "foraging" | "fishing" | "mining" | "training";
```

Currently implemented:
- ✅ **Foraging**: 12 activities across 6 locations
- ✅ **Fishing**: 3 activities (riverside, coastal harbor, quiet pond)  
- ✅ **Mining**: 1 activity (mountain village)
- ✅ **Training**: 7 activities across 5 locations

**Note**: The type definition in [`src/types/World.ts`](src/types/World.ts) incorrectly includes "shop", "battle", and "quest" as activity types, but these are not actual activities and should be removed.

### Current Activity Locations and Distribution

| Location | Foraging | Fishing | Mining | Training | Total |
|----------|----------|---------|---------|----------|-------|
| Hometown | 1 | 0 | 0 | 0 | 1 |
| Town Garden | 2 | 0 | 0 | 0 | 2 |
| Peaceful Meadow | 2 | 0 | 0 | 2 | 4 |
| Forest Path | 1 | 0 | 0 | 1 | 2 |
| Quiet Pond | 2 | 1 | 0 | 0 | 3 |
| Riverside | 1 | 1 | 0 | 0 | 2 |
| Mountain Village | 1 | 0 | 1 | 1 | 3 |
| Ancient Ruins | 1 | 0 | 0 | 2 | 3 |
| Coastal Harbor | 1 | 1 | 0 | 1 | 3 |
| **Total** | **12** | **3** | **1** | **7** | **23** |

## Detailed Activity Analysis

### Energy Cost Distribution
- **Low Cost (5-15 energy)**: 8 activities (beginner-friendly)
- **Medium Cost (20-30 energy)**: 11 activities (standard activities)
- **High Cost (35+ energy)**: 4 activities (advanced activities)
- **❌ INVALID: Negative Energy**: 3 activities (BUGS - must be fixed)

### Duration Analysis
- **Short (15-25 ticks)**: 7 activities (3.75-6.25 minutes)
- **Medium (30-60 ticks)**: 11 activities (7.5-15 minutes)
- **Long (75+ ticks)**: 5 activities (18.75+ minutes)

### Reward Types Distribution
- **Gold rewards**: 15 activities (65% of activities)
- **Item rewards**: 20 activities (87% of activities)
- **Experience rewards**: 15 activities (65% of activities)

## Critical Issues and Gaps

### 1. **CRITICAL: Incomplete Offline Activity Reward Processing**

**Location**: [`src/engine/GameLoop.ts:500-513`](src/engine/GameLoop.ts:500-513)

**Issue**: Offline progression processes activity completion but doesn't distribute rewards to inventory.

```typescript
// Current implementation - rewards are lost
gameState.world.activeActivities = gameState.world.activeActivities.filter(activity => {
  activity.ticksRemaining -= actualTicksToProcess;
  
  if (activity.ticksRemaining <= 0) {
    majorEvents.push("activity_completed");
    // MISSING: Reward distribution logic
    return false; // Remove completed activity
  }
  
  return true; // Keep ongoing activity
});
```

**Impact**: Players lose all rewards from activities completed while offline.

### 2. **CRITICAL: Missing Activity Reward Processing in GameLoop**

**Location**: [`src/engine/GameLoop.ts:277-329`](src/engine/GameLoop.ts:277-329)

**Issue**: The reward processing in `processActivityRewards()` doesn't handle all reward distribution cases properly.

```typescript
case "item":
  if (reward.id) {
    // Add item to inventory using ItemSystem
    const item = getItemById(reward.id);
    if (item) {
      const addResult = ItemSystem.addItem(this.gameState.inventory, item, reward.amount);
      if (addResult.success) {
        this.gameState.inventory = addResult.data!;
      }
      // MISSING: Error handling for failed item additions
    }
    // MISSING: Error handling for missing item definitions
  }
```

**Impact**: Failed item additions and missing item definitions cause silent reward loss.

### 3. **CRITICAL: Invalid Negative Energy Cost Activities**

**Location**: [`src/data/locations.ts`](src/data/locations.ts) - Multiple activities

**Issue**: Three activities have negative energy costs, which violates the rule that all activities must consume energy:

1. **Riverside Rest** (`riverside_rest`): `energyCost: -10`
2. **Mountain Rest** (`mountain_rest`): `energyCost: -15`  
3. **Pond Meditation** (`pond_meditation`): `energyCost: -5`

```typescript
// From riverside location - INVALID
{
  id: "riverside_rest",
  name: "Rest by the Water",
  type: "foraging",
  description: "Relax by the peaceful water and restore energy",
  energyCost: -10, // ❌ INVALID: Should be positive
  duration: 30,
  rewards: [{ type: "experience", amount: 5, probability: 1.0 }],
}
```

**Impact**: These activities break game mechanics by restoring energy instead of consuming it.

### 4. **HIGH: Invalid Activity Type Definitions**

**Location**: [`src/types/World.ts:5`](src/types/World.ts:5)

**Issue**: The ActivityType includes invalid types:

```typescript
// Current definition - INCORRECT
export type ActivityType = "foraging" | "fishing" | "mining" | "shop" | "training" | "battle" | "quest";
//                                                                    ^^^^    ^^^^^^^   ^^^^^
//                                                                    These are not activities
```

**Impact**: Type system allows invalid activity types to be created.

### 5. **HIGH: Activity Requirements Validation Gaps**

**Location**: [`src/systems/WorldSystem.ts:258-274`](src/systems/WorldSystem.ts:258-274)

**Issue**: Activity requirements validation only handles "level" and "item" types, missing "quest_completed" and "pet_species":

```typescript
switch (req.type) {
  case "level":
    // Implemented
    break;
  case "item":
    // Implemented
    break;
  // MISSING: "quest_completed" and "pet_species" validation
}
```

**Impact**: Some activity requirements cannot be enforced.

### 6. **MEDIUM: Activity Cancellation Issues**

**Location**: [`src/systems/WorldSystem.ts:399-415`](src/systems/WorldSystem.ts:399-415)

**Issue**: Activity cancellation doesn't handle:
- Energy cost refunds
- Partial progress rewards
- Item requirement refunds

**Impact**: Players lose energy and items when canceling activities.

### 7. **MEDIUM: Missing Activity Statistics**

**Issue**: No tracking of:
- Activity completion counts
- Success rates
- Total time spent in activities
- Rewards earned per activity type

**Impact**: No progression tracking or achievement systems possible.

### 8. **LOW: Energy Cost Validation in WorldSystem**

**Location**: [`src/systems/WorldSystem.ts:244-246`](src/systems/WorldSystem.ts:244-246)

**Issue**: The energy validation doesn't prevent negative energy activities from being processed:

```typescript
// Check energy requirements
if (!EnergyManager.hasEnoughEnergy(pet, activity.energyCost)) {
  return { success: false, error: EnergyManager.ERROR_MESSAGES.ACTIVITY };
}
// Should also validate that energyCost > 0
```

**Impact**: Negative energy activities can still be started.

## Detailed Fix Requirements

### Priority 1: Critical Fixes (Must Fix)

#### 1.1 Fix Invalid Negative Energy Activities

**File**: [`src/data/locations.ts`](src/data/locations.ts)

**Changes Required**:
```typescript
// Fix Riverside location - line ~206
{
  id: "riverside_rest",
  name: "Peaceful Reflection", // Rename to reflect energy consumption
  type: "foraging",
  description: "Meditate by the peaceful water and gather inner strength",
  energyCost: 10, // Changed from -10 to positive cost
  duration: 30,
  rewards: [
    { type: "experience", amount: 8, probability: 1.0 }, // Increased reward to compensate
    { type: "item", id: "herb", amount: 1, probability: 0.2 }, // Add small item chance
  ],
}

// Fix Mountain Village location - line ~312
{
  id: "mountain_rest",
  name: "High Altitude Training", // Rename to reflect energy consumption
  type: "training",
  description: "Train endurance in the crisp mountain air",
  energyCost: 15, // Changed from -15 to positive cost
  duration: 45,
  rewards: [
    { type: "experience", amount: 12, probability: 1.0 }, // Increased reward
    { type: "item", id: "herb", amount: 1, probability: 0.3 }, // Mountain herbs
    { type: "gold", amount: 5, probability: 0.2 },
  ],
}

// Fix Quiet Pond location - line ~1117
{
  id: "pond_meditation",
  name: "Mindful Practice", // Rename to reflect energy consumption
  type: "training",
  description: "Practice mindfulness and focus by the tranquil pond",
  energyCost: 5, // Changed from -5 to positive cost
  duration: 25,
  rewards: [
    { type: "experience", amount: 8, probability: 1.0 }, // Increased reward
    { type: "item", id: "kelp_supplement", amount: 1, probability: 0.1 },
  ],
}
```

#### 1.2 Fix Activity Type Definitions

**File**: [`src/types/World.ts`](src/types/World.ts)

**Changes Required**:
```typescript
// Line 5 - Remove invalid activity types
export type ActivityType = "foraging" | "fishing" | "mining" | "training";
//                                      ^^^^^^ REMOVED: "shop" | "battle" | "quest"
```

#### 1.3 Fix Offline Activity Reward Processing

**File**: [`src/engine/GameLoop.ts`](src/engine/GameLoop.ts)

**Changes Required**:
```typescript
// Replace the offline activity processing section (lines 500-513)
const completedActivities: Array<{activity: ActiveActivity, rewards: ActivityReward[]}> = [];

gameState.world.activeActivities = gameState.world.activeActivities.filter(activity => {
  activity.ticksRemaining -= actualTicksToProcess;
  
  if (activity.ticksRemaining <= 0) {
    // Get activity definition and calculate rewards
    const location = getLocationById(activity.locationId);
    const activityDef = location?.activities.find(a => a.id === activity.activityId);
    const rewards: ActivityReward[] = [];
    
    if (activityDef) {
      for (const reward of activityDef.rewards) {
        if (Math.random() < reward.probability) {
          rewards.push(reward);
        }
      }
    }
    
    completedActivities.push({ activity, rewards });
    majorEvents.push("activity_completed");
    return false;
  }
  
  return true;
});

// Process all rewards from completed activities
for (const { rewards } of completedActivities) {
  // Use existing processActivityRewards logic but fix the call
  this.processActivityRewards(rewards, [], []);
}
```

#### 1.4 Improve Activity Reward Error Handling

**File**: [`src/engine/GameLoop.ts`](src/engine/GameLoop.ts)

**Changes Required**:
```typescript
// Fix the processActivityRewards method (lines 277-329)
case "item":
  if (reward.id) {
    const item = getItemById(reward.id);
    if (item) {
      const addResult = ItemSystem.addItem(this.gameState.inventory, item, reward.amount);
      if (addResult.success) {
        this.gameState.inventory = addResult.data!;
      } else {
        console.warn(`Failed to add reward item ${reward.id}: ${addResult.error}`);
        // Convert failed item to gold as compensation
        this.gameState.inventory.gold += item.value * reward.amount;
        actions.push({
          type: "compensation_gold",
          payload: { amount: item.value * reward.amount, reason: "failed_item_add" },
          timestamp: Date.now(),
          source: "system",
        });
      }
    } else {
      console.error(`Reward item not found: ${reward.id}`);
      // Provide default gold compensation for missing items
      const compensationGold = 10 * reward.amount;
      this.gameState.inventory.gold += compensationGold;
      actions.push({
        type: "compensation_gold",
        payload: { amount: compensationGold, reason: "missing_item_definition" },
        timestamp: Date.now(),
        source: "system",
      });
    }
  } else {
    console.error("Item reward missing ID");
    // Provide minimal compensation for malformed rewards
    this.gameState.inventory.gold += 5;
  }
  break;
```

#### 1.5 Add Energy Cost Validation

**File**: [`src/systems/WorldSystem.ts`](src/systems/WorldSystem.ts)

**Changes Required**:
```typescript
// Add validation in startActivity method after line 241
// Validate energy cost is positive
if (activity.energyCost <= 0) {
  return { success: false, error: "Invalid activity: energy cost must be positive" };
}

// Check energy requirements (existing code but add validation)
if (!EnergyManager.hasEnoughEnergy(pet, activity.energyCost)) {
  return { success: false, error: EnergyManager.ERROR_MESSAGES.ACTIVITY };
}
```

### Priority 2: High Priority Fixes

#### 2.1 Complete Activity Requirements Validation

**File**: [`src/systems/WorldSystem.ts`](src/systems/WorldSystem.ts)

**Changes Required**:
```typescript
// Add missing requirement types in startActivity method (lines 258-274)
switch (req.type) {
  case "level":
    if (pet.growthStage < (req.value as number)) {
      return { success: false, error: `Pet must be at least level ${req.value}` };
    }
    break;
  case "item":
    if (!ItemSystem.hasItem(inventory, req.value as string, 1)) {
      return { success: false, error: `Requires ${req.value}` };
    }
    break;
  case "quest_completed":
    // Add quest completion check
    // Note: Requires integration with QuestSystem
    // For now, log warning about unimplemented requirement
    console.warn(`Quest completion requirement not implemented: ${req.value}`);
    break;
  case "pet_species":
    if (pet.species !== req.value) {
      return { success: false, error: `Only ${req.value} pets can perform this activity` };
    }
    break;
  default:
    console.warn(`Unknown activity requirement type: ${req.type}`);
    break;
}
```

### Priority 3: Medium Priority Improvements

#### 3.1 Enhanced Activity Cancellation

**File**: [`src/systems/WorldSystem.ts`](src/systems/WorldSystem.ts)

**Changes Required**:
```typescript
static cancelActivity(
  worldState: WorldState, 
  petId: string, 
  refundEnergy: boolean = false
): Result<{worldState: WorldState, energyRefunded?: number}> {
  const activeActivityIndex = worldState.activeActivities.findIndex(a => a.petId === petId);
  if (activeActivityIndex === -1) {
    return { success: false, error: "No active activity to cancel" };
  }

  const activeActivity = worldState.activeActivities[activeActivityIndex];
  let energyRefunded = 0;
  
  if (refundEnergy) {
    // Calculate partial energy refund based on progress
    const location = getLocationById(activeActivity.locationId);
    const activity = location?.activities.find(a => a.id === activeActivity.activityId);
    
    if (activity && activity.energyCost > 0) {
      const progressRatio = (activity.duration - activeActivity.ticksRemaining) / activity.duration;
      energyRefunded = Math.floor(activity.energyCost * (1 - progressRatio) * 0.5); // 50% refund
    }
  }

  const updatedWorldState: WorldState = {
    ...worldState,
    activeActivities: worldState.activeActivities.filter((_, index) => index !== activeActivityIndex),
  };

  return {
    success: true,
    data: {worldState: updatedWorldState, energyRefunded},
    message: energyRefunded > 0 
      ? `Activity cancelled. ${energyRefunded} energy refunded.`
      : "Activity cancelled",
  };
}
```

#### 3.2 Activity Statistics Tracking

**File**: [`src/types/GameState.ts`](src/types/GameState.ts)

**Add New Interface**:
```typescript
interface ActivityStats {
  totalActivitiesCompleted: number;
  activitiesByType: Record<ActivityType, number>;
  totalTimeSpent: number; // in ticks
  totalRewardsEarned: {
    gold: number;
    experience: number;
    items: Record<string, number>;
  };
}

// Add to GameState interface
interface GameState {
  // ... existing fields
  activityStats: ActivityStats;
}
```

## Implementation Timeline

### Phase 1 (Critical - 1-2 days)
- Fix negative energy cost activities (3 activities)
- Fix activity type definitions
- Fix offline activity reward processing
- Improve activity reward error handling
- Add energy cost validation

### Phase 2 (High Priority - 2-3 days)
- Complete activity requirements validation
- Update UI to handle corrected activities
- Test all reward distribution thoroughly

### Phase 3 (Medium Priority - 1-2 weeks)
- Enhanced activity cancellation with refunds
- Activity statistics tracking
- Activity progress persistence

### Phase 4 (Low Priority - 2-3 weeks)
- Activity balancing based on statistics
- Advanced activity features
- Performance optimizations

## Testing Requirements

### Critical Tests Needed
1. **Energy Cost Validation**: Ensure all activities have positive energy costs
2. **Offline Activity Completion**: Start activity, save, advance system time, reload
3. **Reward Distribution**: Verify all reward types properly add to inventory
4. **Activity Type Validation**: Ensure only valid activity types are accepted
5. **Activity Cancellation**: Test energy refunds and state cleanup

### Test Cases to Add
```typescript
describe("Activity Energy Costs", () => {
  test("all activities have positive energy costs", () => {
    for (const location of LOCATIONS) {
      for (const activity of location.activities) {
        expect(activity.energyCost).toBeGreaterThan(0);
      }
    }
  });
  
  test("energy cost validation prevents negative costs", () => {
    // Test that WorldSystem rejects negative energy activities
  });
});

describe("Activity Types", () => {
  test("only valid activity types are used", () => {
    const validTypes = ["foraging", "fishing", "mining", "training"];
    for (const location of LOCATIONS) {
      for (const activity of location.activities) {
        expect(validTypes).toContain(activity.type);
      }
    }
  });
});

describe("Activity Rewards", () => {
  test("offline activity completion distributes rewards", async () => {
    // Test offline reward processing
  });
  
  test("failed item additions convert to gold", async () => {
    // Test error handling
  });
  
  test("missing item definitions provide compensation", async () => {
    // Test missing item handling
  });
});
```

## Conclusion

The activities system has critical issues that prevent proper functionality, particularly:

1. **Invalid negative energy activities** that break core game mechanics
2. **Broken offline reward processing** that causes players to lose rewards
3. **Incorrect type definitions** that allow invalid activities

The primary focus must be on fixing these fundamental issues before any enhancements. Once corrected, the activities system will provide a consistent and engaging gameplay experience where all activities properly consume energy and reliably distribute rewards both online and offline.

These fixes are essential for maintaining game balance and ensuring players receive proper rewards for their time investment in activities.