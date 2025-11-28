/**
 * Tick processor for batch processing multiple ticks.
 */

import {
  applyExplorationCompletion,
  processExplorationTick,
} from "@/game/core/exploration/forage";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { updateQuestProgress } from "@/game/core/quests/quests";
import { resetDailySleep } from "@/game/core/sleep";
import { processPetTick } from "@/game/core/tick";
import { getMidnightTimestamp, shouldDailyReset } from "@/game/core/time";
import { completeTraining } from "@/game/core/training";
import { getFacility } from "@/game/data/facilities";
import { getLocation } from "@/game/data/locations";
import { applyExplorationResults } from "@/game/state/actions/exploration";
import type { Tick } from "@/game/types/common";
import { now, TICK_DURATION_MS } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import type { GameState } from "@/game/types/gameState";
import type {
  CareStatsSnapshot,
  MaxStatsSnapshot,
  OfflineExplorationResult,
  OfflineReport,
  OfflineTrainingResult,
} from "@/game/types/offline";
import { ObjectiveType } from "@/game/types/quest";
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

  // Track if training was active before tick (to detect completion)
  const wasTraining =
    workingState.pet.activityState === ActivityState.Training &&
    workingState.pet.activeTraining !== undefined;

  // Capture training result BEFORE processing tick (since processPetTick clears the training state)
  // Training completes when ticksRemaining === 1 (will be decremented to 0)
  const trainingWillComplete =
    wasTraining && workingState.pet.activeTraining?.ticksRemaining === 1;
  const trainingResultBeforeCompletion = trainingWillComplete
    ? completeTraining(workingState.pet)
    : null;
  const facilityId = trainingWillComplete
    ? workingState.pet.activeTraining?.facilityId
    : null;

  // Process pet tick (handles training, care, growth, etc.)
  const updatedPet = processPetTick(workingState.pet);

  // Detect training completion (was training, now not training)
  const trainingCompleted =
    wasTraining &&
    (updatedPet.activityState !== ActivityState.Training ||
      updatedPet.activeTraining === undefined);

  let updatedState: GameState = {
    ...workingState,
    pet: updatedPet,
    totalTicks: workingState.totalTicks + 1,
    lastSaveTime: currentTime,
    // Clear any previous exploration result
    lastExplorationResult: undefined,
    // Clear any previous training result
    lastTrainingResult: undefined,
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

      // Update quest progress for Explore objectives (foraging)
      if (result.success) {
        updatedState = updateQuestProgress(
          updatedState,
          ObjectiveType.Explore,
          "forage",
        );

        // Update quest progress for Collect objectives for each item found
        for (const drop of result.itemsFound) {
          updatedState = updateQuestProgress(
            updatedState,
            ObjectiveType.Collect,
            drop.itemId,
            drop.quantity,
          );
        }
      }

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

  // Update quest progress for Train objectives when training completes
  if (trainingCompleted) {
    updatedState = updateQuestProgress(
      updatedState,
      ObjectiveType.Train,
      "any",
    );

    // Store the training result for UI notification
    if (trainingResultBeforeCompletion && facilityId) {
      const facility = getFacility(facilityId);
      updatedState.lastTrainingResult = {
        ...trainingResultBeforeCompletion,
        facilityName: facility?.name ?? "Unknown Facility",
      };
    }
  }

  return updatedState;
}

/**
 * Callback invoked after each tick during batch processing.
 * @param state The game state after the tick was processed
 * @param tickIndex The zero-based index of the tick that was just processed
 */
export type TickCallback = (state: GameState, tickIndex: number) => void;

/**
 * Process multiple ticks at once (for offline catch-up).
 * Processes ticks sequentially to maintain correct state transitions.
 * @param state The initial game state
 * @param tickCount Number of ticks to process
 * @param startTime Optional start timestamp for simulation (defaults to now - tickCount * TICK_DURATION_MS)
 * @param onTick Optional callback invoked after each tick is processed
 */
export function processMultipleTicks(
  state: GameState,
  tickCount: Tick,
  startTime?: number,
  onTick?: TickCallback,
): GameState {
  let currentState = state;
  const simulatedStartTime = startTime ?? now() - tickCount * TICK_DURATION_MS;

  for (let i = 0; i < tickCount; i++) {
    const simulatedTime = simulatedStartTime + (i + 1) * TICK_DURATION_MS;
    currentState = processGameTick(currentState, simulatedTime);
    onTick?.(currentState, i);
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
    care: {
      satiety: maxStats.care.satiety,
      hydration: maxStats.care.hydration,
      happiness: maxStats.care.happiness,
    },
    energy: maxStats.energy,
    careLife: maxStats.careLife,
  };
}

/**
 * Process offline catch-up ticks.
 * Collects exploration and training results that complete during offline time.
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

  // Process ticks and collect exploration/training results using the shared tick processor
  const explorationResults: OfflineExplorationResult[] = [];
  const trainingResults: OfflineTrainingResult[] = [];
  const currentState = processMultipleTicks(
    state,
    cappedTicks,
    state.lastSaveTime,
    (tickState) => {
      // Collect exploration result if one was generated this tick
      if (tickState.lastExplorationResult) {
        explorationResults.push({
          locationName: tickState.lastExplorationResult.locationName,
          itemsFound: tickState.lastExplorationResult.itemsFound,
          message: tickState.lastExplorationResult.message,
        });
      }
      // Collect training result if one was generated this tick
      if (tickState.lastTrainingResult) {
        trainingResults.push({
          facilityName: tickState.lastTrainingResult.facilityName,
          result: {
            success: tickState.lastTrainingResult.success,
            message: tickState.lastTrainingResult.message,
            statsGained: tickState.lastTrainingResult.statsGained,
          },
        });
      }
    },
  );

  const afterStats = createCareStatsSnapshot(currentState);
  const poopAfter = currentState.pet?.poop.count ?? 0;

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
    explorationResults,
    trainingResults,
  };

  return {
    state: currentState,
    ticksProcessed: cappedTicks,
    wasCapped,
    report,
  };
}
