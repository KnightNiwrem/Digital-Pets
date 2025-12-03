# Refactoring Checklist

## Magic Strings / UI Text
Refactor hardcoded strings into a centralized localization or constants file (`src/game/data/uiText.ts`).

- [x] **src/components/care/FeedButton.tsx**
  - [x] Button label: "Feed"
  - [x] Icon: "🍖"
  - [x] Category: "food"
  - [x] ItemSelector title: "Select Food"
  - [x] ItemSelector description: "Choose a food item to feed your pet."

- [x] **src/components/care/PlayButton.tsx**
  - [x] Button label: "Play"
  - [x] Icon: "🎾"
  - [x] Category: "toy"
  - [x] ItemSelector title: "Select Toy"
  - [x] ItemSelector description: "Choose a toy to play with your pet."

- [x] **src/components/care/SleepToggle.tsx**
  - [x] Button labels: "Wake Up", "Sleep"
  - [x] Icons: "☀️", "🌙"

- [x] **src/components/battle/BattleArena.tsx**
  - [x] VS Indicator: "⚔️"

- [x] **src/components/map/LocationDetail.tsx**
  - [x] Facility names map (Rest Area, Food Station, etc.)
  - [x] Facility emojis map
  - [x] Location type names: "Home", "Town", "Wild Area", "Dungeon"
  - [x] Travel fallback: "Cannot Travel"

- [x] **src/game/core/tickProcessor.ts**
  - [x] Fallback location name: "Unknown Location"
  - [x] Fallback facility name: "Unknown Facility"

## Magic Numbers / Game Logic
Refactor literal values into named constants with semantic meaning.

- [x] **src/game/core/sleep.ts**
  - [x] `DEFAULT_MIN_SLEEP_HOURS` values (16, 14, 12, 10, 8).
  - [x] `checkActivityIdle` reason string: "put to sleep".

- [x] **src/game/GameManager.ts**
  - [x] `CHECK_INTERVAL_MS` (1000)
  - [x] `MAX_CATCHUP_TICKS` (10)
  - [x] `BATTLE_TICK_INTERVAL_MS` (1000)

## Code Organization
- [x] **src/game/core/petStats.ts**
  - [x] `createDefaultBonusMaxStats`: Defined `ZERO_BATTLE_STATS` constant.