# Digital Pets - Technology Stack

## Core Technologies

### Runtime & Build System
- **Bun**: Primary runtime for development and production
  - Version: Latest
  - Used for: Hot reload development, building, package management
  - Configuration: [`bunfig.toml`](bunfig.toml)
  - Custom build script: [`build.ts`](build.ts) with CLI argument parsing

### Frontend Framework
- **React 19**: UI library
  - Entry point: [`src/frontend.tsx`](src/frontend.tsx)
  - Hot module reloading enabled for development
  - StrictMode enabled for development

### Language & Type Safety
- **TypeScript**: Primary language
  - Configuration: [`tsconfig.json`](tsconfig.json)
  - Strict type checking enabled
  - Path aliases: `@/*` maps to `src/*`
  - Bundler mode with module preservation
  - No `any` or `unknown` types allowed (project requirement)

## UI & Styling

### CSS Framework
- **TailwindCSS 4.0.6**: Utility-first CSS framework
  - Plugin: `bun-plugin-tailwind` for build integration
  - Global styles: [`styles/globals.css`](styles/globals.css)
  - Component styles: [`src/index.css`](src/index.css)

### Component Library
- **shadcn/ui**: Pre-built accessible components
  - Configuration: [`components.json`](components.json)
  - Components: Button, Card, Form, Input, Label, Select
  - Built on Radix UI primitives
  - Styled with TailwindCSS and class-variance-authority

### Icons & Assets
- **Lucide React**: Icon library
- **Static Assets**: SVG logos for branding

## Form & Data Handling

### Forms
- **React Hook Form 7.54.2**: Form state management
- **@hookform/resolvers**: Form validation integration
- **Zod 3.24.2**: Schema validation and type inference

### Utilities
- **clsx**: Conditional className utility
- **tailwind-merge**: TailwindCSS class merging
- **class-variance-authority**: Component variant management

## Storage & Persistence

### Data Storage
- **Web Storage API**: Client-side persistence (requirement)
  - localStorage for game state
  - sessionStorage for temporary data
  - No server dependencies

### State Management
- **React Context**: Global state management
- **Custom Hooks**: System-specific state logic
- **Local Component State**: UI-specific state

## Development Tooling

### Package Management
- **Bun**: Package manager and task runner
- **Lock File**: [`bun.lock`](bun.lock) for dependency versioning

### Development Scripts
```json
{
  "dev": "bun --hot src/index.tsx",
  "start": "NODE_ENV=production bun src/index.tsx", 
  "build": "bun run build.ts"
}
```

### Build Configuration
- **Custom Build Script**: [`build.ts`](build.ts)
  - HTML file scanning and processing
  - TailwindCSS integration via plugin
  - Minification enabled for production
  - Source maps with linked mode
  - Browser target compilation
  - CLI argument parsing for build options

### File Structure
```
/
├── src/                 # Source code
│   ├── components/      # React components
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # Utility functions
│   ├── *.tsx           # React components/pages
│   ├── *.css           # Styles
│   └── index.html      # HTML entry point
├── styles/             # Global styles
├── build.ts            # Custom build script
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── components.json     # shadcn/ui configuration
└── bunfig.toml        # Bun configuration
```

## Browser Compatibility
- **Target**: Modern browsers with ES2020+ support
- **Storage**: Requires Web Storage API support
- **Features**: Uses modern JavaScript features (modules, async/await)

## Performance Considerations
- **Bundle Size**: Optimized with tree-shaking and minification
- **Hot Reload**: Fast development iteration with Bun's HMR
- **Build Speed**: Bun's fast build system
- **Runtime Performance**: 15-second tick system for game mechanics

## Development Environment
- **Local Development**: `bun run dev` with hot reload
- **Production Build**: `bun run build` creates optimized dist
- **File Watching**: Automatic reload on file changes
- **Type Checking**: Real-time TypeScript validation

## Technical Constraints
1. **No Server Dependencies**: Pure client-side operation
2. **Web Storage Only**: No external databases or APIs
3. **Offline First**: Must work without internet connection
4. **Type Safety**: Strict TypeScript without any/unknown
5. **Browser Standards**: Web Storage API, ES modules, modern JavaScript

## Testing & Quality Assurance
- **Testing Framework**: Comprehensive test suite with 478+ passing tests
  - Unit tests for all systems (`tests/systems/`)
  - Component tests (`tests/components/`)
  - Integration tests for game mechanics
  - Data validation tests for content
- **Linting**: ESLint configuration with clean builds
  - Configuration: [`eslint.config.js`](eslint.config.js)
  - All code passes linting without warnings
- **Code Formatting**: Prettier integration implemented
  - Configuration: [`.prettierrc`](.prettierrc)
  - Consistent code formatting across project
- **Type Checking**: Strict TypeScript validation
  - No `any` or `unknown` types allowed
  - Full type safety across entire codebase

## Future Technology Considerations
- **CI/CD**: Build validation pipeline could be added
- **Performance Monitoring**: Runtime performance tracking
- **Bundle Analysis**: Bundle size optimization tools