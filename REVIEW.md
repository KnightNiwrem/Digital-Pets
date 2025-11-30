# Architecture Review: Frontend & Game Logic Separation

## Executive Summary

The "Digital Pets" codebase demonstrates a **robust and well-structured separation of concerns**, effectively decoupling the presentation layer (`src/components`) from the business logic (`src/game`). The architecture adheres to modern React best practices, treating the game engine as a pure state management system while the UI acts largely as a deterministic reflection of that state.

While the separation is generally excellent, there is a minor architectural "leak" within the `GameContext` provider regarding event/notification handling, which could be improved for better scalability.

## Strengths

### 1. Strict Directory Separation
The codebase enforces a clear physical boundary:
- **`src/game/`**: Contains all domain logic, data definitions, and state transformations. It has zero dependencies on UI code (JSX, CSS).
- **`src/components/`**: Contains only visual components. It never imports directly from `src/game/core` logic but interacts through defined interfaces.

### 2. The "Action" Pattern
Components do not implement game rules. For example, `FeedButton.tsx` does not calculate how much hunger is reduced. Instead, it calls a pure action function (`feedPet` from `src/game/state/actions/care.ts`). This makes the game logic testable in isolation without rendering React components.

### 3. Pure Functional Core
The game logic relies heavily on pure functions (e.g., `processGameTick`, `feedPet`) that take a state and return a new state. This "Redux-like" approach ensures predictability and easier debugging.

### 4. Abstraction Layer
`GameContext` and `useGameState` provide a clear API for the UI. Components consume `state` and dispatch `actions`, oblivious to the underlying "tick" mechanism or storage persistence details.

## Areas for Improvement

### 1. Notification Logic in `GameContext` (The "Leak")
In `src/game/context/GameContext.tsx`, there are several `useEffect` hooks that monitor state changes to trigger notifications:

```typescript
// src/game/context/GameContext.tsx
useEffect(() => {
  const currentStage = state?.pet?.growth.stage ?? null;
  const previousStage = previousStageRef.current;
  // ... logic to compare and setNotification
}, [state?.pet]);
```

**Issue:** This places "interpretation" logic (deciding *when* a user should be notified) inside the data provider. While currently manageable, this pattern scales poorly. As the game grows (e.g., adding achievements, quest completions, rare drops), `GameContext` will become cluttered with dozens of `useEffect` hooks comparing previous vs. current state.

### 2. Lack of Explicit Event System
The system currently relies on state diffing to detect events (like "Training Complete"). A more robust approach would be for the game engine to emit transient "events" or "side effects" alongside state updates, which the UI could consume directly.

## Refactoring Suggestions

### Recommendation 1: Extract Notification Logic (High Priority)
Move the state-diffing logic out of `GameContext.tsx` and into a dedicated hook.

**Action:** Create `src/game/hooks/useGameNotifications.ts`.
This hook should listen to the state and manage the side effects (notifications), keeping `GameContext` purely focused on state provision.

```typescript
// Example structure
export function useGameNotifications(state: GameState | null, notify: (n: Notification) => void) {
  useStageTransitionListener(state, notify);
  useTrainingCompletionListener(state, notify);
  // ... other listeners
}
```

### Recommendation 2: Standardize Selectors (Medium Priority)
While `selectors.ts` exists, ensure all components use it. Instead of `state.pet.stats.energy`, components should use `selectPetEnergy(state)`. This decouples the UI structure from the state shape, making future state refactors easier.

### Recommendation 3: Event Bus (Long-term)
If the complexity of "one-off events" grows, consider adding an event queue to the `GameState` or a simple event emitter to `GameManager`.
- **Idea:** Actions return `{ state: NewState, events: GameEvent[] }`.
- **Benefit:** Removes the need for "previous state refs" and diffing entirely. The UI simply consumes the `events` array produced by the last tick/action.
