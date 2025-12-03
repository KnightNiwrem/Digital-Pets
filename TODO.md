# Refactoring Checklist

## Magic Numbers & Strings

- [x] **Battle Rewards (`src/game/core/battle/battle.ts`)**
  - Create `src/game/core/battle/constants.ts` to centralize battle constants.
  - Replace magic numbers in `calculateBattleRewards`:
    - `5` (Base coin reward)
    - `0.5` (Coin power scaling)
    - `10` (Base experience)
    - `0.3` (Experience power scaling)
  - Move to `BATTLE_REWARD_CONSTANTS`.

- [x] **Battle Status (`src/game/core/battle/status.ts`)**
  - Replace magic number `100` in `resistChance` calculation.
  - Replace magic number `100` in `modifier` calculation.
  - Use existing `DAMAGE_CONSTANTS.PERCENTAGE_SCALE`.

- [x] **Battle Stats (`src/game/core/battle/stats.ts`)**
  - Already uses `BATTLE_CONSTANTS` with named constants - no changes needed.

- [x] **Battle Damage (`src/game/core/battle/damage.ts`)**
  - Already uses `DAMAGE_CONSTANTS` with named constants - no changes needed.

- [x] **Encounter Defaults (`src/game/core/exploration/encounter.ts`)**
  - Replace `10` with `DEFAULT_ENCOUNTER_MAX_LEVEL` constant in `src/game/core/exploration/constants.ts`.

- [x] **Skill Progress (`src/game/core/skills.ts`)**
  - Replace `100` with `PERCENTAGE_MAX` from `@/game/types/common`.

- [x] **Training Progress (`src/game/core/training.ts`)**
  - Replace `100` in `getTrainingProgress` with `PERCENTAGE_MAX` from `@/game/types/common`.

- [x] **Exploration Progress (`src/game/core/exploration/exploration.ts`)**
  - Replace `100` in progress calculation with `PERCENTAGE_MAX` from `@/game/types/common`.

- [x] **Care Life Calculation (`src/game/core/care/careLife.ts`)**
  - Replace `100` in percentage calculations with `PERCENTAGE_MAX` from `@/game/types/common`.

## Misleading Constants

- [x] Review usage of `100` across the codebase to ensure it refers to "Percentage" and not some other unit (like "Max Stat Value" if stats cap at 100).
  - All usages verified to be percentage-related calculations.
  - All percentage calculations now use named constants (`PERCENTAGE_MAX` where shared, or existing battle-specific constants like `DAMAGE_CONSTANTS.PERCENTAGE_SCALE`).
