# Magic Numbers and Strings Refactoring Checklist

This document tracks magic numbers and strings that should be refactored into named constants for better maintainability and clarity.

## Legend
- [ ] Not started
- [x] Completed

---

## ✅ Already Well-Handled Areas

The codebase already has good constant extraction in several areas:
- `src/game/core/care/constants.ts` - Care decay, poop, energy regeneration rates
- `src/game/types/common.ts` - TICK_DURATION_MS, TICKS_PER_HOUR, TICKS_PER_DAY, MICRO_RATIO
- `src/game/types/constants.ts` - GrowthStage, DamageType, ItemCategory, Rarity, etc.
- `src/game/types/skill.ts` - MAX_SKILL_LEVEL, SKILL_TIER_THRESHOLDS, BASE_SKILL_XP, SKILL_EFFECT_BONUS_PER_LEVEL
- `src/game/core/battle/damage.ts` - DAMAGE_CONSTANTS object
- `src/game/core/battle/stats.ts` - BATTLE_CONSTANTS object
- `src/game/core/exploration/constants.ts` - BASE_EXPLORATION_XP
- `src/game/data/messages.ts` - TrainingMessages, ShopMessages, TravelMessages, QuestMessages, ExplorationMessages, ItemMessages

---

## 🔢 Magic Numbers to Refactor

### Sleep System (`src/game/core/sleep.ts`)

- [x] **Lines 31-37**: `DEFAULT_MIN_SLEEP_TICKS` values are defined inline but the numbers themselves (1920, 1680, 1440, 1200, 960) represent hours of sleep. Refactored to use `DEFAULT_MIN_SLEEP_HOURS × TICKS_PER_HOUR` for clarity.

### Exploration System (`src/game/core/exploration/exploration.ts`)

- [x] **Line 31**: `BASE_EXPLORATION_XP = 15` - Moved to `src/game/core/exploration/constants.ts`

### Skills System (`src/game/core/skills.ts`)

- [x] **Line 18**: `BASE_XP = 50` - Moved to skill types file as `BASE_SKILL_XP`

- [x] **Line 167**: `0.05` skill effect multiplier bonus per level - Extracted as `SKILL_EFFECT_BONUS_PER_LEVEL`

### Hit Chance Calculations (`src/game/core/battle/damage.ts`)

- [x] **Line 72**: Clamp values `5` and `100` for hit chance - Extracted as `MIN_HIT_CHANCE` and `MAX_HIT_CHANCE`

- [x] **Line 100**: `100` used in endurance mitigation formula - Extracted as `ENDURANCE_MITIGATION_BASE`

### Time Utilities (`src/game/core/time.ts`)

- [x] **Line 24**: `30` (days) in MAX_OFFLINE_TICKS calculation - Extracted as `MAX_OFFLINE_DAYS`

### Growth Stage Progress (`src/game/data/growthStages.ts`)

- [x] **Lines 117, 121**: `100` as percentage max - Extracted as `PERCENTAGE_MAX` in common.ts
  ```typescript
  return Math.min(PERCENTAGE_MAX, Math.floor((timeInStage / stageDuration) * PERCENTAGE_MAX));
  ```

### Training Facilities (`src/game/data/facilities.ts`)

- [x] **Lines 22, 26, 34, 35, 44, 45, 50**: Training session values (energy costs, stat gains, duration multipliers)
  ```typescript
  // basicSession
  durationTicks: TICKS_PER_HOUR, // 1 hour
  energyCost: 10,
  primaryStatGain: 1,
  
  // intensiveSession  
  durationTicks: TICKS_PER_HOUR * 2, // 2 hours
  energyCost: 25,
  primaryStatGain: 3,
  secondaryStatGain: 1,
  
  // advancedSession
  durationTicks: TICKS_PER_HOUR * 4, // 4 hours
  energyCost: 50,
  primaryStatGain: 6,
  secondaryStatGain: 2,
  ```
  Extracted to `TRAINING_SESSION_CONFIG` in `src/game/data/facilities/constants.ts`.

### Starting Data (`src/game/data/starting.ts`)

- [x] **Lines 123-133**: Starting inventory quantities - Extracted as `STARTING_INVENTORY_COUNTS` constant object
  ```typescript
  { itemId: FOOD_ITEMS.KIBBLE.id, quantity: STARTING_INVENTORY_COUNTS.KIBBLE, ... },
  { itemId: FOOD_ITEMS.APPLE.id, quantity: STARTING_INVENTORY_COUNTS.APPLE, ... },
  // etc.
  ```

- [x] **Line 138**: `STARTING_COINS = 100` - Already a named constant ✓

### Food Items (`src/game/data/items/food.ts`)

- [x] **Lines 31, 44, 57, etc.**: Poop acceleration values (60, 120, 180, 40, 90, 200, 240, 360) - Extracted as `POOP_ACCELERATION` constants
  ```typescript
  // POOP_ACCELERATION object with named tiers:
  // VERY_LIGHT = 40, LIGHT = 60, LIGHT_MEDIUM = 90, STANDARD = 120,
  // HEAVY = 180, VERY_HEAVY = 200, INDULGENT = 240, MASSIVE = 360
  ```

- [x] **Lines 30, 43, etc.**: Max stack sizes - Food items use `MAX_STACK_BY_RARITY` constants since their stacks align with rarity tiers
  ```typescript
  // MAX_STACK_BY_RARITY object:
  // common: 99, uncommon: 50, rare: 20, epic: 5, legendary: 1
  ```
  
  **Note:** Other item categories (battle, medicine, cleaning, drinks, materials) have intentional per-item stack variations that don't strictly follow rarity tiers, so they retain explicit numeric values to preserve game balance decisions.

### Persistence (`src/game/state/persistence.ts`)

- [x] **Line 11**: `STORAGE_KEY = "digital_pets_save"` - Already a named constant ✓

---

## 📝 Magic Strings to Refactor

### Activity Messages

- [x] **`src/game/core/training.ts` Lines 48, 51, 75, 95, etc.**: Training messages - Refactored to use `TrainingMessages` from messages.ts

- [x] **`src/game/core/items.ts`**: Item usage messages - Refactored to use `ItemMessages` from messages.ts

### Shop Messages (`src/game/core/shop.ts`)

- [x] **Lines 64-99, 145-180**: Shop transaction messages - Refactored to use `ShopMessages` from messages.ts

### Travel Messages (`src/game/core/travel.ts`)

- [x] **Lines 109, 126, etc.**: Travel validation messages - Refactored to use `TravelMessages` from messages.ts

### Quest Messages (`src/game/core/quests/quests.ts`)

- [x] **Lines 41, 145-196, 204-278**: Quest action messages - `QuestMessages` defined in messages.ts and applied to quests.ts

### Exploration Messages (`src/game/core/exploration/exploration.ts`)

- [x] **Lines 159, 169, 265, 438-440, 477**: Exploration messages - `ExplorationMessages` defined in messages.ts and applied to exploration.ts

### Location IDs

- [x] **`src/game/types/gameState.ts` Line 129**: Default starting location - Extracted as `DEFAULT_LOCATION_ID` in common.ts
  ```typescript
  currentLocationId: DEFAULT_LOCATION_ID
  ```

### Tier Display Names (`src/game/core/skills.ts`)

- [x] **Lines 62-68**: Skill tier display names - Moved to `SKILL_TIER_DISPLAY_NAMES` in types/skill.ts
  ```typescript
  export const SKILL_TIER_DISPLAY_NAMES: Record<SkillTier, string> = {
    [SkillTier.Novice]: "Novice",
    [SkillTier.Apprentice]: "Apprentice",
    // etc.
  };
  ```

---

## 🎯 Priority Recommendations

### High Priority
1. [x] Create `src/game/core/exploration/constants.ts` for BASE_EXPLORATION_XP and exploration-related values
2. [x] Create message constant objects for training, shop, travel, quest, and exploration systems
3. [x] Extract training session configuration values to a dedicated constants file
4. [x] Define MIN_HIT_CHANCE and MAX_HIT_CHANCE in battle constants

### Medium Priority
1. [x] Extract stack size constants for food items (other item categories retain explicit values for balance)
2. [x] Create POOP_ACCELERATION tier constants for food items
3. [x] Refactor DEFAULT_MIN_SLEEP_TICKS to use TICKS_PER_HOUR for clarity
4. [x] Move BASE_XP to skill types file with other skill constants
5. [x] Extract MAX_OFFLINE_DAYS = 30 constant

### Low Priority
1. [x] Extract starting inventory quantity constants - `STARTING_INVENTORY_COUNTS` in starting.ts
2. [x] Consider extracting formula constants (100 in endurance mitigation)
3. [x] Move skill effect multiplier (0.05) to constants
4. [x] Consolidate percentage threshold (100) into shared constant - `PERCENTAGE_MAX` in common.ts

---

## 📋 Implementation Notes

When refactoring:
1. Create constants files adjacent to the logic files using them
2. Use descriptive names that explain the purpose (e.g., `POOP_ACCEL_LIGHT_MEAL` not just `60`)
3. Add JSDoc comments explaining the value's significance
4. Group related constants in objects when appropriate
5. Export constants that may be needed by tests or UI components
6. Update tests to use the new constants where applicable
