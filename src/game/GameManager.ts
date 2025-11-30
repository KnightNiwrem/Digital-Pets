/**
 * Game manager for tick scheduling and game loop.
 *
 * Uses a delta-time accumulator pattern to ensure correct game speed
 * regardless of frame rate or browser throttling in background tabs.
 * When the game wakes up after being throttled, it processes all
 * accumulated ticks to catch up to real-time.
 *
 * Battle tick processing is unified into the main loop to prevent
 * synchronization issues between the game tick and battle processors.
 */

import type { BattleAction } from "@/game/core/battle/battleActions";
import { processBattleTick } from "@/game/core/battle/battleProcessor";
import { battleReducer } from "@/game/core/battle/battleReducer";
import {
  processGameTick,
  processOfflineCatchup,
} from "@/game/core/tickProcessor";
import { calculateElapsedTicks, MAX_OFFLINE_TICKS } from "@/game/core/time";
import { TICK_DURATION_MS } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";

/**
 * Interval for checking elapsed time (1 second).
 * This is much shorter than TICK_DURATION_MS (30000ms) to catch up quickly
 * when returning from a background tab.
 */
const CHECK_INTERVAL_MS = 1000;

/**
 * Maximum ticks to process in a single update cycle.
 * Prevents the game from freezing if too much time has passed.
 */
const MAX_CATCHUP_TICKS = 10;

/**
 * Battle tick interval within the main loop (1 second).
 * Battle processing runs more frequently than game ticks for responsive combat.
 */
const BATTLE_TICK_INTERVAL_MS = 1000;

/**
 * Callback for state updates.
 */
export type StateUpdateCallback = (
  updater: (state: GameState) => GameState,
) => void;

/**
 * Game manager handles the game loop and tick processing.
 *
 * Uses delta-time accumulator pattern:
 * - Tracks the timestamp of the last processed tick
 * - On each check interval, calculates how many ticks should have occurred
 * - Processes multiple ticks if needed to catch up (capped to prevent freezing)
 */
export class GameManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private updateState: StateUpdateCallback;
  private isRunning = false;
  private lastTickTime: number = 0;
  private accumulator: number = 0;
  private battleAccumulator: number = 0;

  constructor(updateState: StateUpdateCallback) {
    this.updateState = updateState;
  }

  /**
   * Start the game loop.
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastTickTime = Date.now();
    this.accumulator = 0;
    this.battleAccumulator = 0;

    // Check for elapsed time frequently to catch up after background throttling
    this.intervalId = setInterval(() => {
      this.update();
    }, CHECK_INTERVAL_MS);
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
   * Update the game state using delta-time accumulator pattern.
   * Calculates elapsed time since last update and processes
   * as many ticks as needed to catch up (capped to prevent freezing).
   *
   * Battle tick processing is unified into this loop using its own accumulator
   * to prevent synchronization issues between game ticks and battle processing.
   */
  private update(): void {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTickTime;
    this.accumulator += deltaTime;
    this.battleAccumulator += deltaTime;
    this.lastTickTime = currentTime;

    // Process as many ticks as have accumulated (with cap)
    let ticksProcessed = 0;
    while (
      this.accumulator >= TICK_DURATION_MS &&
      ticksProcessed < MAX_CATCHUP_TICKS
    ) {
      this.tick();
      this.accumulator -= TICK_DURATION_MS;
      ticksProcessed++;
    }

    // If we hit the cap, reset accumulator to prevent runaway catch-up
    if (ticksProcessed >= MAX_CATCHUP_TICKS && this.accumulator > 0) {
      this.accumulator = 0;
    }

    // Process battle tick at BATTLE_TICK_INTERVAL_MS for responsive combat
    // Unified into main loop to prevent synchronization issues
    // Using while loop for consistent catch-up behavior after background throttling
    let battleTicksProcessed = 0;
    while (
      this.battleAccumulator >= BATTLE_TICK_INTERVAL_MS &&
      battleTicksProcessed < MAX_CATCHUP_TICKS
    ) {
      // Using Date.now() to get a new timestamp for each tick to help avoid
      // event timestamp collisions, which would cause UI animations to be skipped.
      this.updateState((state) => processBattleTick(state, Date.now()));
      this.battleAccumulator -= BATTLE_TICK_INTERVAL_MS;
      battleTicksProcessed++;
    }

    // If we hit the cap, reset accumulator to prevent runaway catch-up
    if (
      battleTicksProcessed >= MAX_CATCHUP_TICKS &&
      this.battleAccumulator > 0
    ) {
      this.battleAccumulator = 0;
    }
  }

  /**
   * Process a single tick.
   */
  tick(): void {
    this.updateState(processGameTick);
  }

  /**
   * Dispatch a battle action through the reducer.
   * This is the primary way the UI interacts with battle logic.
   */
  dispatchBattleAction(action: BattleAction): void {
    const currentTime = Date.now();
    this.updateState((state) => battleReducer(state, action, currentTime));
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
