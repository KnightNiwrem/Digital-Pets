/**
 * Tick processor for batch processing multiple ticks.
 */

import { processPetTick } from "@/game/core/tick";
import type { Tick } from "@/game/types/common";
import { now } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";
import type { CareStatsSnapshot, OfflineReport } from "@/game/types/offline";

/**
 * Process a single game tick, updating the entire game state.
 */
export function processGameTick(state: GameState): GameState {
  // If no pet, just update time
  if (!state.pet) {
    return {
      ...state,
      totalTicks: state.totalTicks + 1,
      lastSaveTime: now(),
    };
  }

  // Process pet tick
  const updatedPet = processPetTick(state.pet);

  return {
    ...state,
    pet: updatedPet,
    totalTicks: state.totalTicks + 1,
    lastSaveTime: now(),
  };
}

/**
 * Process multiple ticks at once (for offline catch-up).
 * Processes ticks sequentially to maintain correct state transitions.
 */
export function processMultipleTicks(
  state: GameState,
  tickCount: Tick,
): GameState {
  let currentState = state;

  for (let i = 0; i < tickCount; i++) {
    currentState = processGameTick(currentState);
  }

  return currentState;
}

/**
 * Result of catching up offline ticks.
 */
export interface OfflineCatchupResult {
  /** Updated game state after processing */
  state: GameState;
  /** Number of ticks processed */
  ticksProcessed: Tick;
  /** Whether the maximum offline cap was reached */
  wasCapped: boolean;
  /** Offline report for UI display */
  report: OfflineReport;
}

/**
 * Extract care stats snapshot from game state.
 */
function extractCareStatsSnapshot(state: GameState): CareStatsSnapshot | null {
  if (!state.pet) return null;
  return {
    satiety: state.pet.careStats.satiety,
    hydration: state.pet.careStats.hydration,
    happiness: state.pet.careStats.happiness,
    energy: state.pet.energyStats.energy,
  };
}

/**
 * Process offline catch-up ticks.
 */
export function processOfflineCatchup(
  state: GameState,
  ticksElapsed: Tick,
  maxOfflineTicks: Tick,
  elapsedMs = 0,
): OfflineCatchupResult {
  const cappedTicks = Math.min(ticksElapsed, maxOfflineTicks);
  const wasCapped = ticksElapsed > maxOfflineTicks;

  const beforeStats = extractCareStatsSnapshot(state);
  const poopBefore = state.pet?.poop.count ?? 0;
  const petName = state.pet?.identity.name ?? null;

  const newState = processMultipleTicks(state, cappedTicks);

  const afterStats = extractCareStatsSnapshot(newState);
  const poopAfter = newState.pet?.poop.count ?? 0;

  const report: OfflineReport = {
    elapsedMs,
    ticksProcessed: cappedTicks,
    wasCapped,
    petName,
    beforeStats,
    afterStats,
    poopBefore,
    poopAfter,
  };

  return {
    state: newState,
    ticksProcessed: cappedTicks,
    wasCapped,
    report,
  };
}
