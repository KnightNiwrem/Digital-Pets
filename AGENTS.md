# AGENTS.md — Coding Agent Instructions

Instructions for AI coding agents working on this project.

## Project Overview

**Digital Pets** is a virtual pet game featuring care mechanics, exploration, turn-based battles, quests, and progression systems. Built with Bun + React 19 + TypeScript.

## Setup Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server (http://localhost:3000)
bun run build        # Build for production
bun check            # Lint, format, and import checks (Biome)
bun check:fix        # Auto-fix linting/formatting issues
bun typecheck        # TypeScript type checking
bun test             # Run tests with Bun's test runner
```

## Validation Requirements

**Always run before completing any task:**

```bash
bun check && bun typecheck && bun test
```

Fix any failures before proceeding.

## Project Structure

```
src/
├── index.ts              # Bun server entry point
├── index.html            # HTML entry point
├── index.css             # Global styles and Tailwind imports
├── frontend.tsx          # React app entry point
├── App.tsx               # Main React component
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── pet/              # Pet display components
│   ├── care/             # Care action components
│   ├── battle/           # Battle UI components
│   ├── screens/          # Screen components
│   └── ...               # Other component groups
├── game/
│   ├── types/            # TypeScript interfaces and types
│   ├── data/             # Game data (items, species, locations, etc.)
│   ├── core/             # Game logic (battle, care, exploration, etc.)
│   ├── state/            # State management and actions
│   ├── context/          # React context providers
│   └── hooks/            # Custom React hooks
├── lib/utils.ts          # Utility functions (cn helper)
└── utils/                # Additional utilities with tests
```

## Do

- Use `@/*` path alias for imports from `src/`
- Use functional components with explicit TypeScript types
- Use `cn()` helper from `@/lib/utils` for conditional classnames
- Use Tailwind CSS utility classes for styling
- Use double quotes for strings
- Indent with spaces
- Place tests alongside source files with `.test.ts` or `.test.tsx` suffix
- Use `Response.json()` for API JSON responses
- Follow existing patterns in the codebase

## Don't

- Don't use `any` type — prefer explicit types
- Don't hardcode magic numbers or strings — use constants from `src/game/types/constants.ts`
- Don't add new dependencies without explicit approval
- Don't modify `src/components/ui/` shadcn components unless necessary
- Don't skip validation checks before completing tasks
- Don't create files outside `src/` unless for configuration

## Testing

```typescript
import { expect, test } from "bun:test";
import { myFunction } from "./myModule";

test("description of what is being tested", () => {
  expect(myFunction(input)).toBe(expectedOutput);
});
```

- Tests use Bun's built-in test runner
- Run single file: `bun test path/to/file.test.ts`
- Add tests for new logic in `src/game/core/` and `src/utils/`

## Game Architecture

### State Management
- Game state managed via React Context (`src/game/context/GameContext.tsx`)
- State actions in `src/game/state/actions/`
- Pure tick processing in `src/game/core/tick.ts`

### Game Loop
- `GameManager` schedules ticks every 30 seconds
- Tick processor updates care stats, energy, poop, growth, training, exploration
- Offline progression calculates elapsed ticks on load (max 7 days)

### Key Systems
- **Care**: Satiety, hydration, happiness decay; cleaning poop; sleep/wake
- **Battle**: Turn-based 1v1 with moves, damage types, status effects
- **Exploration**: Foraging for items, random encounters
- **Progression**: Pet growth stages, skill leveling, quests

## Adding shadcn/ui Components

1. Check shadcn/ui documentation for the component
2. Create component file in `src/components/ui/`
3. Use Radix UI primitives and class-variance-authority
4. Follow existing component patterns

## Common Gotchas

- TypeScript strict mode with `noUncheckedIndexedAccess` is enabled
- `bun-plugin-tailwind` handles Tailwind CSS processing
- Use `NODE_ENV=production` for production builds
- The `/*` catch-all route serves the React SPA

## Boundaries

Never edit without explicit approval:
- `.env` files or secrets
- `node_modules/`
- Build outputs (`dist/`, `build/`)
- Lock files (`bun.lock`) unless updating dependencies
