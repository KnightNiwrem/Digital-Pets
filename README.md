# Digital Pets 🐾

A purely client-side HTML5 pet raising game that captures the nostalgia of classic virtual pets while offering modern gameplay mechanics and progression systems. Experience ~2 years of natural progression through comprehensive pet care, world exploration, and turn-based battles.

## 🎮 Game Features

### Pet Care System
- **Real-time Care Mechanics**: Feed, hydrate, and play with your pet using intuitive controls
- **Health Management**: Treat illnesses and injuries with medicine, maintain cleanliness
- **Growth Progression**: Watch your pet evolve through 50+ stages over approximately 2 years
- **Energy System**: Manage your pet's energy for activities and ensure proper rest
- **Stat Tracking**: Monitor Satiety, Hydration, Happiness, and Energy with visual progress bars

### World Exploration
- **Multiple Locations**: Travel between Hometown, Forest Path, Riverside, and more
- **Activities**: Engage in foraging, fishing, and training to gather resources and improve stats
- **Travel System**: Journey between locations with energy costs and level requirements
- **Offline Progression**: Continue exploring even when away from the game

### Battle System
- **Turn-based Combat**: Strategic battles with move selection and timing
- **Move Variety**: 12 different battle moves across physical, special, and status categories
- **Status Effects**: Apply and manage various battle conditions and stat modifications
- **AI Opponents**: Face intelligent computer opponents with adaptive strategies

### Inventory Management
- **48-slot Grid System**: Organize items in an intuitive 8x6 inventory interface
- **Item Categories**: Food, Drinks, Medicine, Toys, and Equipment with filtering options
- **Rarity System**: Collect items across multiple rarity tiers with visual indicators
- **Usage & Trading**: Use items for pet care and sell them for resources

### Technical Features
- **Offline-First Design**: Complete functionality without internet connection
- **Auto-Save System**: Automatic game state preservation every 15 seconds
- **Offline Progression**: Up to 7 days of catch-up progression when returning to the game
- **Web Storage**: All progress saved locally in your browser
- **Responsive UI**: Works seamlessly across desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) runtime (v1.2.15 or later)
- Modern web browser with ES2020+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KnightNiwrem/Digital-Pets.git
   cd Digital-Pets
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` and start your pet care journey!

### Production Build

```bash
# Build for production
bun run build

# Run production server
bun start
```

## 🛠️ Development

### Available Scripts

- `bun dev` - Start development server with hot reload
- `bun start` - Run production server
- `bun run build` - Build for production
- `bun test` - Run comprehensive test suite (183 tests)
- `bun run lint` - Run ESLint for code quality
- `bun run lint:fix` - Auto-fix linting issues
- `bun run format` - Format code with Prettier
- `bun run typecheck` - Run TypeScript type checking

### Project Structure

```
src/
├── components/          # React UI components
│   ├── pet/            # Pet care interfaces
│   ├── world/          # World exploration UI
│   ├── inventory/      # Inventory management
│   ├── battle/         # Battle system UI
│   └── ui/             # Shared UI components (shadcn/ui)
├── systems/            # Core game logic systems
│   ├── PetSystem.ts    # Pet care and growth mechanics
│   ├── WorldSystem.ts  # Location and travel management
│   ├── BattleSystem.ts # Turn-based combat system
│   └── ItemSystem.ts   # Inventory and item usage
├── engine/             # Game engine core
│   ├── GameLoop.ts     # 15-second tick system
│   └── GameState.ts    # State management
├── storage/            # Data persistence
│   └── GameStorage.ts  # Web Storage API integration
├── data/               # Game content definitions
│   ├── pets.ts         # Pet species and rarity data
│   ├── items.ts        # Item definitions and effects
│   ├── locations.ts    # World locations and activities
│   └── moves.ts        # Battle moves and abilities
└── types/              # TypeScript interface definitions
```

### Testing

The project includes comprehensive test coverage with 183 tests:

- **Pet System Tests**: 54 tests covering care actions, tick processing, and edge cases
- **World System Tests**: 28 tests for travel, activities, and location management
- **Battle System Tests**: 30 tests for combat mechanics and AI behavior
- **Item System Tests**: 58 tests for inventory management and item usage
- **Game Loop Tests**: 13 tests for offline progression and state management

```bash
# Run all tests
bun test

# Watch mode for development
bun test --watch
```

## 🏗️ Technology Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Frontend**: [React 19](https://react.dev) - UI library
- **Language**: [TypeScript](https://typescriptlang.org) - Type-safe development
- **Styling**: [TailwindCSS](https://tailwindcss.com) - Utility-first CSS framework
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) - Accessible component library
- **Forms**: [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) - Form management and validation
- **Storage**: Web Storage API - Client-side persistence
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful icon library

## 🎯 Game Mechanics

### Core Loop
1. **Monitor Pet Stats**: Keep Satiety, Hydration, and Happiness levels healthy
2. **Engage in Activities**: Use energy for exploration, battles, and training
3. **Manage Resources**: Collect items through world activities and strategic inventory management
4. **Experience Growth**: Watch your pet evolve through 50+ stages over time
5. **Explore the World**: Discover new locations, complete activities, and face challenges

### Offline Progression
When you return after being away, the game calculates what happened during your absence:
- Pet stat changes and care needs
- Completed travel and activities
- Health state progression
- Growth and development milestones

### Pet Rarities
- **Common** (10 species): 3 available as starters
- **Uncommon** (8 species): Obtainable through gameplay
- **Rare** (6 species): Challenging to acquire
- **Epic** (4 species): Very rare discoveries
- **Legendary** (3 species): Ultimate pet companions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and ensure tests pass (`bun test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Maintain TypeScript strict mode (no `any` or `unknown` types)
- Ensure all tests pass before submitting
- Follow existing code formatting (Prettier + ESLint)
- Add tests for new functionality
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with modern web technologies and inspired by classic virtual pet games. Special thanks to the open-source community for the amazing tools and libraries that make this project possible.
