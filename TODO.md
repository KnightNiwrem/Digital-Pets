# Magic String Removal Checklist

## 1. Game Data Constants Refactor

### Species Data (`src/game/data/species.ts`)
- [x] Replace literal string growth stages ('baby', 'child', etc.) with `GrowthStage` enum/const from `src/game/types/constants.ts`.
- [x] Replace literal string damage types in resistances ('slashing', 'piercing', etc.) with `DamageType` enum/const.
- [x] Create `SpeciesArchetype` constant in `src/game/types/constants.ts` and replace literals ('balanced', 'glassCannon', etc.).
- [x] Create `UnlockMethod` constant in `src/game/types/constants.ts` and replace literals ('starting', 'quest', etc.).

### Item Data (`src/game/data/items/*.ts`)
- [x] Replace literal string item categories ('food', 'medicine', etc.) with `ItemCategory` enum/const.
- [x] Replace literal string rarities ('common', 'rare', etc.) with `Rarity` enum/const.

### Move Data (`src/game/data/moves.ts`)
- [x] Create `PetStat` constant in `src/game/types/constants.ts` for stats ('strength', 'endurance', 'agility', 'precision', 'fortitude', 'cunning') and replace occurrences in effects array.

## 2. Core Logic Refactor

### User-Facing Messages
- [x] Centralize hardcoded error/status messages in `src/game/core/sleep.ts` (e.g., "Pet is already sleeping.").
- [x] Centralize hardcoded error/status messages in `src/game/core/activityGating.ts`.
- [x] Create a message registry or translation file (e.g., `src/game/data/messages.ts`) to hold these strings.

## 3. Components Refactor
- [ ] Audit components for hardcoded display strings that should be derived from constants (e.g., checking `stage === 'baby'` instead of `stage === GrowthStage.Baby`).
