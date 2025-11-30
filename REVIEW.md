# Architecture Review

## 1. Architecture Score: 6/10

The codebase demonstrates a solid attempt at separating concerns by isolating core game logic in `src/game/core`, using pure functions for state transitions, and employing a central `GameState`. However, significant coupling exists between the "Runner" (execution model) and the "View" (React components), particularly in the Battle System and the main Game Loop. The "Virtual Backend" is currently driven by the UI's clock rather than an independent internal clock.

## 2. Critical Refactoring Targets

### A. Logic-View Coupling in Battle System (`src/components/screens/BattleScreen.tsx`)
The Battle Screen orchestrates the flow of combat using `setTimeout` and `useEffect`. The UI explicitly waits for animations to complete *before* calculating the result of a turn.
-   **Problem:** The View drives the Logic. If the UI thread hangs or the component unmounts, the battle state can become inconsistent.
-   **Violation:** "Battle State integrity: Is the turn logic scattered across UI timeout functions?" - Yes.

### B. Idle Timer Precision (`src/game/GameManager.ts`)
The `GameManager` relies on a simple `setInterval` to trigger `processGameTick`.
-   **Problem:** Browsers throttle `setInterval` in background tabs (often to 1 per second or slower). This causes the game simulation to slow down when not in focus, drifting significantly from real-time.
-   **Violation:** "Idle Timer Precision: Is resource accumulation tied to the frame rate/timer instead of delta-time?" - Yes.

### C. State Mutation Delayed by Animation
In `BattleScreen.tsx`, the player's action calculation (`executePlayerTurn`) is wrapped in a callback that only fires after an animation timeout:
```typescript
triggerAttackAnimation(true, () => {
  onBattleStateChange(executePlayerTurn(battleState, move));
});
```
This prevents the game state from updating immediately upon user input, tightly coupling the simulation speed to the visual presentation speed.

## 3. Refactoring Plan

To move towards a "Headless" engine, we must invert the control flow: **Logic updates first, View reacts second.**

### Strategy
1.  **Implement a Delta-Time Loop:**
    Refactor `GameManager` to use a "accumulator" pattern. It should track `lastTickTime` and `now`, calculate `delta`, and process as many logic ticks as fit in that delta.
    -   *Benefit:* Game runs at correct speed regardless of frame rate or background throttling (when it wakes up, it catches up).

2.  **Event-Driven Battle System:**
    Move the battle orchestration out of React and into the `tickProcessor` or a dedicated `BattleManager`.
    -   When `BattlePhase.EnemyTurn` is reached, the game logic should process the enemy move *immediately* (in the next tick).
    -   The logic emits a `BattleEvent` (e.g., `{ type: 'ATTACK', actor: 'enemy', ... }`).
    -   The React component observes these events. When it sees an 'ATTACK' event, it plays the animation. The state is *already* updated to the post-attack state, but the UI visualizes the transition.

3.  **Decouple Inputs from Animations:**
    When a player clicks "Attack", the handler should dispatch the action to the game engine immediately. The engine returns the new state + events. The UI then queues the necessary animations based on those events.

## 4. Code Example: Battle Turn Execution

### Before (Current Anti-Pattern)
The UI waits, then triggers logic.

**`src/components/screens/BattleScreen.tsx`**
```typescript
// UI determines when the Enemy acts
useEffect(() => {
  if (battleState.phase === BattlePhase.EnemyTurn) {
    // UI waiting logic mixed with game rules
    const timeout = setTimeout(() => {
      // Animation trigger
      triggerAttackAnimation(false, () => {
        // Logic execution dependent on animation completion
        const newState = executeEnemyTurn(battleState);
        onBattleStateChange(newState);
      });
    }, 800); // Arbitrary UI delay
    return () => clearTimeout(timeout);
  }
}, [battleState.phase]);
```

### After (Recommended "Headless" Approach)
The Logic runs independently. The UI just renders what happened.

**`src/game/core/battle/battleSystem.ts` (Virtual Backend)**
```typescript
// This runs every tick in the Game Loop
export function processBattleTick(state: GameState): GameState {
  if (!state.activeBattle) return state;
  
  let battle = state.activeBattle;
  
  // Logic decides when to act (could be immediate or based on internal "action gauge")
  if (battle.phase === BattlePhase.EnemyTurn) {
    // 1. Execute logic immediately
    const newState = executeEnemyTurn(battle);
    
    // 2. Queue event for the UI to consume later
    const events = [...state.pendingEvents, {
      type: 'BATTLE_ACTION',
      action: 'ENEMY_ATTACK',
      timestamp: Date.now()
    }];
    
    return {
      ...state,
      activeBattle: newState,
      pendingEvents: events
    };
  }
  
  return state;
}
```

**`src/components/screens/BattleScreen.tsx` (Dumb View)**
```typescript
// UI reacts to state changes and events
useEffect(() => {
  // Check for new events we haven't shown yet
  const newEvents = getNewEvents(gameState.pendingEvents);
  
  for (const event of newEvents) {
    if (event.type === 'BATTLE_ACTION' && event.action === 'ENEMY_ATTACK') {
      // Play animation. The State is ALREADY updated, but we visualy show the action.
      playEnemyAttackAnimation().then(() => {
        // Optional: Wait to show damage numbers until impact
      });
    }
  }
}, [gameState.pendingEvents]);
```
