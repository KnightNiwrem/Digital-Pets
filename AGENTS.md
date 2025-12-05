# Instructions for Agents

## Project Status

This project is **not live yet**. Breaking changes to reach the ideal code state are expected and acceptable. There is no need to worry about backwards compatibility at this point.

## Tech Stack

- **Runtime/Bundler**: Bun (v1.3+)
- **Frontend**: React 19, TypeScript 5.9+
- **Styling**: Tailwind CSS 4, tw-animate-css
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Linting/Formatting**: Biome 2.3+
- **Testing**: Bun's built-in test runner

## Project Structure

```
├── src/
│   ├── index.ts              # Bun server entry point with API routes
│   ├── index.html            # HTML entry point
│   ├── index.css             # Global styles and Tailwind imports
│   ├── frontend.tsx          # React app entry point
│   ├── App.tsx               # Main React component
│   ├── APITester.tsx         # API testing component
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (button, card, dialog, etc.)
│   │   ├── battle/           # Battle system components
│   │   ├── care/             # Pet care components (feed, clean, play, etc.)
│   │   ├── exploration/      # Exploration activity components
│   │   ├── game/             # Core game UI (header, navigation, notifications)
│   │   ├── inventory/        # Item management components
│   │   ├── map/              # Location and map components
│   │   ├── npc/              # NPC dialogue components
│   │   ├── pet/              # Pet display and status components
│   │   ├── quests/           # Quest system components
│   │   ├── screens/          # Main screen components (Care, Battle, Shop, etc.)
│   │   ├── shop/             # Shop and trading components
│   │   ├── skills/           # Skill display components
│   │   └── training/         # Training facility components
│   ├── game/
│   │   ├── GameManager.ts    # Central game state manager
│   │   ├── GameManager.test.ts
│   │   ├── context/          # React context providers
│   │   ├── core/             # Core game logic
│   │   ├── data/             # Game data definitions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── state/            # State management
│   │   ├── testing/          # Test utilities
│   │   └── types/            # TypeScript type definitions
│   └── lib/utils.ts          # Utility functions (cn helper for classnames)
├── specs/                    # Game design specification documents
├── styles/globals.css        # Additional global styles
├── build.ts                  # Custom build script
├── biome.json                # Biome linting/formatting config
└── tsconfig.json             # TypeScript configuration
```

## Dev Environment Setup

1. Always run `bun install` first to ensure dependencies are installed
2. Use `bun dev` to start the development server with hot reloading
3. The server runs at `http://localhost:3000` by default

## Available Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install dependencies |
| `bun dev` | Start dev server with hot reloading |
| `bun start` | Run production server |
| `bun run build` | Build for production |
| `bun check` | Run Biome linting, formatting, and import checks |
| `bun check:fix` | Auto-fix linting, formatting, and import issues |
| `bun typecheck` | Run TypeScript type checking |
| `bun test` | Run tests with Bun's test runner |

## Validation Requirements

Pre-commit hooks automatically run `bun check`, `bun typecheck`, and `bun test` when you commit. You do not need to run these manually before committing. Just commit your changes and the hooks will validate them.

**Important:** Never use `--no-verify` with `git commit`. Pre-commit checks must always run to ensure code quality.

If you need to verify changes without committing (e.g., during debugging), you can run:

```bash
bun check && bun typecheck && AGENT=1 bun test
```

## Code Style Guidelines

### TypeScript
- Strict mode is enabled with `noUncheckedIndexedAccess`
- Use path alias `@/*` for imports from `src/` directory
- Prefer explicit types over `any`

### Formatting (Biome)
- Indent with spaces
- Use double quotes for strings

### React Components
- Use functional components with TypeScript
- shadcn/ui components are in `src/components/ui/`
- Use the `cn()` helper from `@/lib/utils` for conditional classnames
- Prefer composition with Radix UI Slot pattern for component variants

### Styling
- Use Tailwind CSS utility classes
- Custom animations available via tw-animate-css
- Tailwind directives are enabled in CSS files

## Testing Guidelines

- Test files use `.test.ts` or `.test.tsx` suffix
- Tests use Bun's built-in test runner (`import { expect, test } from "bun:test"`)
- Place tests alongside source files in `src/utils/`
- Add or update tests for any code changes

Example test pattern:
```typescript
import { expect, test } from "bun:test";
import { myFunction } from "./myModule";

test("description of what is being tested", () => {
  expect(myFunction(input)).toBe(expectedOutput);
});
```

## API Development

- API routes are defined in the `routes` object
- Use `Response.json()` for JSON responses
- Route parameters use `:param` syntax (e.g., `/api/hello/:name`)
- The catch-all `/*` route serves the React SPA

## Adding shadcn/ui Components

Components are manually added to `src/components/ui/`. When adding new shadcn/ui components:
1. Check the shadcn/ui documentation for the component
2. Create the component file in `src/components/ui/`
3. Ensure proper imports from Radix UI and class-variance-authority

## Common Gotchas

- Always import React types properly for TSX files
- The `bun-plugin-tailwind` handles Tailwind CSS processing during build
- CSS files support `@tailwind` directives
- Use `NODE_ENV=production` for production builds

## Implementing New Features

Follow this workflow when implementing new features:

1. **Create a feature branch** if on main: `git checkout -b feature/<name>`
2. **Implement the feature**, making commits as you go (pre-commit hooks will validate each commit) so there is no need to manually validate
3. **Push and open a PR** for the branch using the `gh` cli
4. **Wait ~10 minutes** for PR feedback comments by using `sleep`
5. **Fetch and review PR feedback** comments left after your latest commit using the `github` MCP server
6. **Evaluate each review comment** and determine if it's valid
7. **Address valid issues** with code changes. Do not add comments to the PR.
8. **Commit and push** to the current branch
9. **Wait ~10 minutes** again for PR feedback comments by using `sleep`
10. **Repeat from step 5** until the PR is approved
