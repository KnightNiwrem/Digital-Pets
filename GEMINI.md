# Digital Pets - Project Context

## Project Overview
**Digital Pets** is a browser-based virtual pet simulation game built with a focus on offline progression and deterministic state management. It features pet care, turn-based battles, exploration, and quests.

The architecture is fully client-side, utilizing a "tick" based system (30-second intervals) to manage time, stats, and progression. This allows the game to calculate "catch-up" logic when the user returns after being offline.

## Tech Stack
*   **Runtime & Bundler:** [Bun](https://bun.sh) (v1.3+)
*   **Frontend Framework:** React 19
*   **Language:** TypeScript 5.9+
*   **Styling:** Tailwind CSS 4, `tw-animate-css`
*   **UI Library:** shadcn/ui (Radix UI primitives)
*   **Linting & Formatting:** Biome (v2.3+)
*   **Testing:** Bun's built-in test runner

## Directory Structure
*   `src/components/` - React UI components, organized by feature (battle, care, exploration, etc.).
*   `src/game/` - Core game logic, decoupled from UI.
    *   `core/` - Game mechanics (tick processing, stats, items, etc.).
    *   `data/` - Static game data (species, items, moves).
    *   `state/` - State management and persistence logic.
    *   `GameManager.ts` - Main game loop and tick scheduler.
*   `specs/` - Detailed documentation of game mechanics (highly recommended to read before modifying logic).
*   `styles/` - Global CSS and Tailwind configuration.

## Key Development Commands

All commands are run using **Bun**.

| Command | Description |
| :--- | :--- |
| `bun install` | Install dependencies. |
| `bun dev` | Start the development server with hot reloading (localhost:3000). |
| `bun run build` | Build the application for production. |
| `bun test` | Run unit tests using Bun's test runner. |
| `bun check` | Run Biome to check for linting and formatting issues. |
| `bun check:fix` | Automatically fix linting and formatting issues with Biome. |
| `bun typecheck` | Run TypeScript compiler to check for type errors (no emit). |

## Development Standards & Conventions

### Code Style
*   **Formatting:** Strictly adhere to **Biome** rules. Run `bun check:fix` before committing.
*   **Imports:** Organize imports automatically using Biome.
*   **Naming:** Use PascalCase for React components and camelCase for functions/variables.
*   **State Management:** Game state is managed via `GameManager` and strictly typed. Mutations should happen through defined actions/processors.

### Game Logic (Important)
*   **Integer Arithmetic:** To ensure deterministic behavior across devices and offline catch-up, **avoid floating-point math** for game state. Use "micro-units" (e.g., 1 Display Unit = 1000 Internal Units).
*   **Ticks:** All time-based logic must be tied to the 30-second tick system (`processGameTick`).
*   **Specs:** Consult the `specs/` directory before implementing or modifying game mechanics (e.g., `specs/battle-system.md`, `specs/care-system.md`).

### Testing
*   **Unit Tests:** Logic files in `src/game/` should have corresponding `.test.ts` files.
*   **Runner:** Use `bun test`.

## Common Tasks
*   **Adding a new Item:** Update `src/game/data/items.ts` and ensure definitions match the `Item` type.
*   **Modifying Stats:** Check `src/game/core/petStats.ts` and respect the micro-unit scaling.
*   **New UI Feature:** Create components in `src/components/<feature>/` and integrate with `useGameState` hook.
