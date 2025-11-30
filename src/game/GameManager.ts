/**
 * Game manager for tick scheduling and game loop.
 */

import {
  processGameTick,
  processOfflineCatchup,
} from "@/game/core/tickProcessor";
import { calculateElapsedTicks, MAX_OFFLINE_TICKS } from "@/game/core/time";
import { now, TICK_DURATION_MS } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";

/**
 * Callback for state updates.
 */
export type StateUpdateCallback = (
  updater: (state: GameState) => GameState,
) => void;

/**
 * Maximum ticks to process in a single loop iteration.
 * Prevents spiral of death when catching up after long inactivity.
 * 100 ticks ≈ 50 minutes at 30s/tick.
 */
const MAX_TICKS_PER_LOOP = 100;

/**
 * Game manager handles the game loop and tick processing.
 */
export class GameManager {
  private loopId: number | null = null;
  private updateState: StateUpdateCallback;
  private isRunning = false;
  private lastTickTime: number = 0;
  private accumulator: number = 0;

  constructor(updateState: StateUpdateCallback) {
    this.updateState = updateState;
  }

  /**
   * Start the game loop.
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTickTime = now();
    this.accumulator = 0;

    // Use a tighter loop (1s) to check for tick processing
    // This allows catching up if the tab was backgrounded
    this.loopId = window.setInterval(() => {
      this.gameLoop();
    }, 1000);
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    if (this.loopId !== null) {
      window.clearInterval(this.loopId);
      this.loopId = null;
    }
    this.isRunning = false;
  }

  /**
   * Main game loop using delta time accumulator pattern.
   */
  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = now();
    const delta = currentTime - this.lastTickTime;
    this.lastTickTime = currentTime;

    this.accumulator += delta;

    // Process as many ticks as fit in the accumulator
    // Limit to a reasonable max to prevent spiral of death (e.g. 100 ticks)
    let ticksProcessed = 0;

    while (
      this.accumulator >= TICK_DURATION_MS &&
      ticksProcessed < MAX_TICKS_PER_LOOP
    ) {
      this.tick();
      this.accumulator -= TICK_DURATION_MS;
      ticksProcessed++;
    }

    // If we hit the limit, just discard the rest of the accumulator to prevent spiral
    if (ticksProcessed >= MAX_TICKS_PER_LOOP) {
      this.accumulator = 0;
    }
  }

  /**
   * Process a single tick.
   */
  tick(): void {
    this.updateState(processGameTick);
  }

  /**
   * Process offline catch-up based on elapsed time since last save.
   */
  processOffline(lastSaveTime: number): void {
    const ticksElapsed = calculateElapsedTicks(lastSaveTime);

    if (ticksElapsed <= 0) return;

    this.updateState((state) => {
      const { state: newState } = processOfflineCatchup(
        state,
        ticksElapsed,
        MAX_OFFLINE_TICKS,
      );
      return newState;
    });
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
