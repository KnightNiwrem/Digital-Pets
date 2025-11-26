# Digital Pets

A virtual pet game built with Bun, React 19, and TypeScript.

## Tech Stack

- **Runtime/Bundler**: Bun (v1.3+)
- **Frontend**: React 19, TypeScript 5.9+
- **Styling**: Tailwind CSS 4, tw-animate-css
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Linting/Formatting**: Biome 2.3+
- **Testing**: Bun's built-in test runner

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

The server runs at `http://localhost:3000` by default.

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

## Validation

Before completing any task, ensure all checks pass:

```bash
bun check && bun typecheck && bun test
```
