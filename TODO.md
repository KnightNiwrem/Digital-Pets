# Refactoring Checklist

## Magic Numbers & Strings
- [x] **Care Thresholds**: In `src/game/types/constants.ts`, extract magic numbers (25, 50, 75) in `getCareThreshold` to named constants (e.g., `CARE_THRESHOLD_BOUNDARIES`).
- [x] **Encounter Scaling**: In `src/game/core/exploration/encounter.ts`, `LEVEL_SCALING_DIVISOR = 5` already exists as a named constant.
- [x] **Shop Multipliers**: In `src/game/data/shops.ts`, `sellMultiplier` values are per-shop configuration data, not magic numbers requiring extraction.
- [x] **Time Constants**: Time values in tests (e.g., 86400000) are test data, not production constants. No centralization needed.
- [x] **Activity IDs**: In `activityGating.ts`, `attemptedAction` is a human-readable string parameter for error messages - this is intentional design.
- [x] **Quest Objectives**: Already using `ObjectiveType` enum from `src/game/types/quest.ts` properly.

## Constant Management
- [x] **Battle Constants**: `DAMAGE_CONSTANTS` in `src/game/core/battle/damage.ts` and `BATTLE_REWARD_CONSTANTS` in `src/game/core/battle/constants.ts` are well-organized and appropriately separated.
- [x] **Test Constants**: Tests use hardcoded values for readability and independence. Importing production constants would couple tests too tightly.
- [x] **Growth Stages**: `GrowthStage` const object with derived type exists in `src/game/types/constants.ts`. Tests use string literals for readability which is acceptable.

## Logic Improvements
- [x] **Skill Formula**: In `src/game/core/skills.ts`, added `TRIANGULAR_DIVISOR` constant with documentation explaining the triangular number formula.
