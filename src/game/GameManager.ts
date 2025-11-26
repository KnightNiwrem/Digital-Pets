/**
 * Game manager for tick scheduling and game loop.
 */

import {
  processGameTick,
  processOfflineCatchup,
} from "@/game/core/tickProcessor";
import { calculateElapsedTicks, MAX_OFFLINE_TICKS } from "@/game/core/time";
import { TICK_DURATION_MS } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";

/**
 * Callback for state updates.
 */
export type StateUpdateCallback = (
  updater: (state: GameState) => GameState,
) => void;

/**
 * Game manager handles the game loop and tick processing.
 */
export class GameManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private updateState: StateUpdateCallback;
  private isRunning = false;

  constructor(updateState: StateUpdateCallback) {
    this.updateState = updateState;
  }

  /**
   * Start the game loop.
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // Process ticks every 30 seconds
    this.intervalId = setInterval(() => {
      this.tick();
    }, TICK_DURATION_MS);
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Process a single tick.
   */
  tick(): void {
    this.updateState(processGameTick);
  }

  /**
   * Process offline catch-up based on elapsed time since last save.
   * Returns the number of ticks processed.
   */
  processOffline(lastSaveTime: number): number {
    const ticksElapsed = calculateElapsedTicks(lastSaveTime);

    if (ticksElapsed <= 0) return 0;

    let ticksProcessed = 0;

    this.updateState((state) => {
      const result = processOfflineCatchup(
        state,
        ticksElapsed,
        MAX_OFFLINE_TICKS,
      );
      ticksProcessed = result.ticksProcessed;
      return result.state;
    });

    return ticksProcessed;
  }

  /**
   * Check if the game loop is running.
   */
  get running(): boolean {
    return this.isRunning;
  }
}

/**
 * Create a new game manager instance.
 */
export function createGameManager(
  updateState: StateUpdateCallback,
): GameManager {
  return new GameManager(updateState);
}
