/**
 * Tick processor for batch processing multiple ticks.
 */

import {
  applyExplorationCompletion,
  processExplorationTick,
} from "@/game/core/exploration/forage";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { resetDailySleep } from "@/game/core/sleep";
import { processPetTick } from "@/game/core/tick";
import { getMidnightTimestamp, shouldDailyReset } from "@/game/core/time";
import { getLocation } from "@/game/data/locations";
import { applyExplorationResults } from "@/game/state/actions/exploration";
import type { Tick } from "@/game/types/common";
import { now, TICK_DURATION_MS } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import type { GameState } from "@/game/types/gameState";
import type {
  CareStatsSnapshot,
  MaxStatsSnapshot,
  OfflineReport,
} from "@/game/types/offline";
import { SkillType } from "@/game/types/skill";

/**
 * Apply daily reset if needed.
 * Resets daily counters like sleepTicksToday at midnight local time.
 */
function applyDailyResetIfNeeded(
  state: GameState,
  currentTime: number = now(),
): GameState {
  if (!shouldDailyReset(state.lastDailyReset, currentTime)) {
    return state;
  }

  const todayMidnight = getMidnightTimestamp(currentTime);
  return {
    ...state,
    lastDailyReset: todayMidnight,
    pet: state.pet
      ? {
          ...state.pet,
          sleep: resetDailySleep(state.pet.sleep),
        }
      : null,
  };
}

/**
 * Process a single game tick, updating the entire game state.
 * @param state The current game state
 * @param currentTime Optional timestamp for the tick (defaults to now(), pass explicit time for offline catch-up)
 */
export function processGameTick(
  state: GameState,
  currentTime: number = now(),
): GameState {
  // Check for daily reset first
  const workingState = applyDailyResetIfNeeded(state, currentTime);

  // If no pet, just update time
  if (!workingState.pet) {
    return {
      ...workingState,
      totalTicks: workingState.totalTicks + 1,
      lastSaveTime: currentTime,
    };
  }

  // Process pet tick (handles training, care, growth, etc.)
  const updatedPet = processPetTick(workingState.pet);
  let updatedState: GameState = {
    ...workingState,
    pet: updatedPet,
    totalTicks: workingState.totalTicks + 1,
    lastSaveTime: currentTime,
    // Clear any previous exploration result
    lastExplorationResult: undefined,
  };

  // Process exploration at game state level (needs access to inventory)
  if (
    updatedPet.activityState === ActivityState.Exploring &&
    updatedPet.activeExploration
  ) {
    const newExploration = processExplorationTick(updatedPet.activeExploration);

    if (newExploration === null) {
      // Exploration completed - apply item drops to inventory
      const locationId = updatedPet.activeExploration.locationId;
      const location = getLocation(locationId);
      const foragingLevel =
        workingState.player.skills?.[SkillType.Foraging]?.level ?? 1;
      const { pet: completedPet, result } = applyExplorationCompletion(
        updatedPet,
        foragingLevel,
      );
      const explorationResult = applyExplorationResults(
        { ...updatedState, pet: completedPet },
        result,
      );
      updatedState = explorationResult.state;
      // Store the result for UI notification
      updatedState.lastExplorationResult = {
        ...result,
        locationName: location?.name ?? "Unknown Location",
      };
    } else {
      updatedState = {
        ...updatedState,
        pet: {
          ...updatedPet,
          activeExploration: newExploration,
        },
      };
    }
  }

  return updatedState;
}

/**
 * Process multiple ticks at once (for offline catch-up).
 * Processes ticks sequentially to maintain correct state transitions.
 * @param state The initial game state
 * @param tickCount Number of ticks to process
 * @param startTime Optional start timestamp for simulation (defaults to now - tickCount * TICK_DURATION_MS)
 */
export function processMultipleTicks(
  state: GameState,
  tickCount: Tick,
  startTime?: number,
): GameState {
  let currentState = state;
  const simulatedStartTime = startTime ?? now() - tickCount * TICK_DURATION_MS;

  for (let i = 0; i < tickCount; i++) {
    const simulatedTime = simulatedStartTime + (i + 1) * TICK_DURATION_MS;
    currentState = processGameTick(currentState, simulatedTime);
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
 * Create care stats snapshot from game state.
 */
function createCareStatsSnapshot(state: GameState): CareStatsSnapshot | null {
  if (!state.pet) return null;
  return {
    satiety: state.pet.careStats.satiety,
    hydration: state.pet.careStats.hydration,
    happiness: state.pet.careStats.happiness,
    energy: state.pet.energyStats.energy,
  };
}

/**
 * Create max stats snapshot from game state based on pet's growth stage and species.
 */
function createMaxStatsSnapshot(state: GameState): MaxStatsSnapshot | null {
  if (!state.pet) return null;
  const maxStats = calculatePetMaxStats(state.pet);
  if (!maxStats) return null;
  return {
    careStatMax: maxStats.careStatMax,
    energyMax: maxStats.energyMax,
  };
}

/**
 * Process offline catch-up ticks.
 */
export function processOfflineCatchup(
  state: GameState,
  ticksElapsed: Tick,
  maxOfflineTicks: Tick,
  elapsedMs?: number,
): OfflineCatchupResult {
  const cappedTicks = Math.min(ticksElapsed, maxOfflineTicks);
  const wasCapped = ticksElapsed > maxOfflineTicks;

  // Calculate elapsedMs from ticks if not provided
  const reportElapsedMs = elapsedMs ?? ticksElapsed * TICK_DURATION_MS;

  const beforeStats = createCareStatsSnapshot(state);
  const maxStats = createMaxStatsSnapshot(state);
  const poopBefore = state.pet?.poop.count ?? 0;
  const petName = state.pet?.identity.name ?? null;

  // Use lastSaveTime as the start time for simulating offline progression
  const newState = processMultipleTicks(state, cappedTicks, state.lastSaveTime);

  const afterStats = createCareStatsSnapshot(newState);
  const poopAfter = newState.pet?.poop.count ?? 0;

  const report: OfflineReport = {
    elapsedMs: reportElapsedMs,
    ticksProcessed: cappedTicks,
    wasCapped,
    petName,
    beforeStats,
    afterStats,
    maxStats,
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
