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
  processMultipleTicks,
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
 * Threshold for switching to offline catchup mode (30 ticks = 15 minutes).
 * If more ticks than this have accumulated, we use the offline catchup
 * processor instead of processing ticks individually.
 */
export const OFFLINE_CATCHUP_THRESHOLD_TICKS = 30;

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
 * - Processes multiple ticks if needed to catch up
 * - If too many ticks accumulated (>15 min), uses offline catchup instead
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
   * as many ticks as needed to catch up.
   *
   * If too many ticks have accumulated (e.g., browser tab was inactive for
   * more than 15 minutes), we switch to offline catchup mode which processes
   * all ticks efficiently as if the user had closed and reopened the tab.
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

    // Calculate how many ticks need to be processed
    const ticksToProcess = Math.floor(this.accumulator / TICK_DURATION_MS);

    if (ticksToProcess >= OFFLINE_CATCHUP_THRESHOLD_TICKS) {
      // Too many ticks accumulated - use offline catchup for efficiency
      // This handles cases like browser tab being inactive for a long time
      this.updateState((state) => {
        const result = processOfflineCatchup(
          state,
          ticksToProcess,
          MAX_OFFLINE_TICKS,
        );
        return result.state;
      });
      // We assume all ticks are handled (processed or capped/discarded)
      // so we remove them from the accumulator immediately.
      // Do NOT rely on a variable updated in the async updateState callback.
      this.accumulator -= ticksToProcess * TICK_DURATION_MS;
      // Reset battle accumulator since battles shouldn't continue during offline time
      this.battleAccumulator = 0;
    } else if (ticksToProcess > 0) {
      // Use batch processing to ensure all notifications are accumulated
      // in a single state update, preventing React batching from losing events
      const startTime = currentTime - ticksToProcess * TICK_DURATION_MS;
      this.updateState((state) =>
        processMultipleTicks(state, ticksToProcess, startTime),
      );
      this.accumulator -= ticksToProcess * TICK_DURATION_MS;
    }

    // Process battle ticks at BATTLE_TICK_INTERVAL_MS for responsive combat
    // Unified into main loop to prevent synchronization issues
    // Battle accumulator is reset when offline catchup is used (above)
    while (this.battleAccumulator >= BATTLE_TICK_INTERVAL_MS) {
      // Using Date.now() to get a new timestamp for each tick to help avoid
      // event timestamp collisions, which would cause UI animations to be skipped.
      this.updateState((state) => processBattleTick(state, Date.now()));
      this.battleAccumulator -= BATTLE_TICK_INTERVAL_MS;
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

  /**
   * Expose update method for testing.
   * @internal Only for use in tests
   */
  _testUpdate(): void {
    this.update();
  }

  /**
   * Manually set the accumulator for testing.
   * @internal Only for use in tests
   */
  _testSetAccumulator(value: number): void {
    this.accumulator = value;
  }

  /**
   * Get current accumulator value for testing.
   * @internal Only for use in tests
   */
  _testGetAccumulator(): number {
    return this.accumulator;
  }

  /**
   * Manually set the battle accumulator for testing.
   * @internal Only for use in tests
   */
  _testSetBattleAccumulator(value: number): void {
    this.battleAccumulator = value;
  }

  /**
   * Get current battle accumulator value for testing.
   * @internal Only for use in tests
   */
  _testGetBattleAccumulator(): number {
    return this.battleAccumulator;
  }

  /**
   * Set the last tick time for testing.
   * @internal Only for use in tests
   */
  _testSetLastTickTime(value: number): void {
    this.lastTickTime = value;
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
