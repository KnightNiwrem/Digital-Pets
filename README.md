# Digital Pets

A virtual pet game featuring care mechanics, exploration, turn-based battles, quests, and progression systems.

## Features

- 🐾 **Pet Care** — Feed, hydrate, play with, and clean up after your pet
- 😴 **Sleep System** — Put your pet to sleep to restore energy
- 🌱 **Growth Stages** — Watch your pet grow from baby to adult
- ⚔️ **Turn-Based Battles** — Fight wild pets with moves and status effects
- 🗺️ **Exploration** — Travel to locations, forage for items, encounter wild pets
- 📦 **Inventory** — Collect and manage items (food, drinks, toys, equipment)
- 🏋️ **Training** — Improve your pet's battle stats at training facilities
- 📜 **Quests** — Complete objectives for rewards
- 💬 **NPCs & Shops** — Talk to characters and buy items
- ⏰ **Offline Progression** — Game catches up when you return

## Tech Stack

- **Runtime/Bundler**: [Bun](https://bun.sh) (v1.3+)
- **Frontend**: React 19, TypeScript 5.9+
- **Styling**: Tailwind CSS 4, tw-animate-css
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Linting/Formatting**: Biome 2.3+
- **Testing**: Bun's built-in test runner

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

The server runs at [http://localhost:3000](http://localhost:3000).

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

## Development

Run all checks before committing:

```bash
bun check && bun typecheck && bun test
```

## License

MIT
