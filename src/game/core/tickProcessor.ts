/**
 * Tick processor for batch processing multiple ticks.
 */

import { emitEvents } from "@/game/core/events";
import {
  applySkillXpGains,
  completeExplorationActivity,
  processExplorationTick,
} from "@/game/core/exploration/exploration";
import { addItem } from "@/game/core/inventory";
import { calculatePetMaxStats } from "@/game/core/petStats";
import {
  processTimedQuestExpiration,
  refreshDailyQuests,
  refreshWeeklyQuests,
  updateQuestProgress,
} from "@/game/core/quests/quests";
import { resetDailySleep } from "@/game/core/sleep";
import { processPetTick } from "@/game/core/tick";
import {
  getMidnightTimestamp,
  getWeekStartTimestamp,
  shouldDailyReset,
  shouldWeeklyReset,
} from "@/game/core/time";
import { completeTraining } from "@/game/core/training";
import { getFacility } from "@/game/data/facilities";
import { getLocation } from "@/game/data/locations";
import type { TrainingResult } from "@/game/types/activity";
import type { Tick } from "@/game/types/common";
import { now, TICK_DURATION_MS } from "@/game/types/common";
import { ActivityState, type GrowthStage } from "@/game/types/constants";
import {
  createEvent,
  type ExplorationCompleteEvent,
  type GameEvent,
  type StageTransitionEvent,
  type TrainingCompleteEvent,
} from "@/game/types/event";
import type { GameState } from "@/game/types/gameState";
import type {
  CareStatsSnapshot,
  MaxStatsSnapshot,
  OfflineExplorationResult,
  OfflineReport,
  OfflineTrainingResult,
} from "@/game/types/offline";
import { ObjectiveType, QuestState } from "@/game/types/quest";

/**
 * Apply daily reset if needed.
 * Resets daily counters like sleepTicksToday at midnight local time.
 * Also refreshes daily quests.
 */
function applyDailyResetIfNeeded(
  state: GameState,
  currentTime: number = now(),
): GameState {
  if (!shouldDailyReset(state.lastDailyReset, currentTime)) {
    return state;
  }

  const todayMidnight = getMidnightTimestamp(currentTime);
  let updatedState: GameState = {
    ...state,
    lastDailyReset: todayMidnight,
    pet: state.pet
      ? {
          ...state.pet,
          sleep: resetDailySleep(state.pet.sleep),
        }
      : null,
  };

  // Refresh daily quests on daily reset
  updatedState = refreshDailyQuests(updatedState, currentTime);

  return updatedState;
}

/**
 * Apply weekly reset if needed.
 * Refreshes weekly quests at Monday midnight local time.
 */
function applyWeeklyResetIfNeeded(
  state: GameState,
  currentTime: number = now(),
): GameState {
  if (!shouldWeeklyReset(state.lastWeeklyReset, currentTime)) {
    return state;
  }

  const thisWeekStart = getWeekStartTimestamp(currentTime);
  let updatedState: GameState = {
    ...state,
    lastWeeklyReset: thisWeekStart,
  };

  // Refresh weekly quests on weekly reset
  updatedState = refreshWeeklyQuests(updatedState, currentTime);

  return updatedState;
}

/**
 * Process a single game tick, updating the entire game state.
 * Emits events for significant occurrences (training/exploration completion, stage transitions).
 * @param state The current game state
 * @param currentTime Optional timestamp for the tick (defaults to now(), pass explicit time for offline catch-up)
 */
export function processGameTick(
  state: GameState,
  currentTime: number = now(),
): GameState {
  // Check for daily reset first
  let workingState = applyDailyResetIfNeeded(state, currentTime);

  // Check for weekly reset
  workingState = applyWeeklyResetIfNeeded(workingState, currentTime);

  // Process timed quest expiration
  workingState = processTimedQuestExpiration(workingState, currentTime);

  // Clear pending events at the start of this tick (new events are added at the end)
  let updatedState: GameState = {
    ...workingState,
    pendingEvents: [],
  };

  // If no pet, just update time
  if (!updatedState.pet) {
    return {
      ...updatedState,
      totalTicks: updatedState.totalTicks + 1,
      lastSaveTime: currentTime,
    };
  }

  // Track previous stage for transition detection
  const previousStage: GrowthStage = updatedState.pet.growth.stage;

  // Track if training was active before tick (to detect completion)
  const wasTraining =
    updatedState.pet.activityState === ActivityState.Training &&
    updatedState.pet.activeTraining !== undefined;

  // Capture training result BEFORE processing tick (since processPetTick clears the training state)
  // Training completes when ticksRemaining === 1 (will be decremented to 0)
  let trainingResultBeforeCompletion: TrainingResult | null = null;
  let facilityId: string | null = null;
  if (wasTraining && updatedState.pet.activeTraining?.ticksRemaining === 1) {
    trainingResultBeforeCompletion = completeTraining(updatedState.pet);
    facilityId = updatedState.pet.activeTraining.facilityId;
  }

  // Process pet tick (handles training, care, growth, etc.)
  const updatedPet = processPetTick(updatedState.pet);
  const petName = updatedPet.identity.name;

  // Detect training completion (was training, now not training)
  const trainingCompleted =
    wasTraining &&
    (updatedPet.activityState !== ActivityState.Training ||
      updatedPet.activeTraining === undefined);

  // Events to emit this tick (use currentTime for consistent timestamps)
  const tickEvents: GameEvent[] = [];

  // Detect stage transition
  if (updatedPet.growth.stage !== previousStage) {
    tickEvents.push(
      createEvent<StageTransitionEvent>(
        {
          type: "stageTransition",
          previousStage,
          newStage: updatedPet.growth.stage,
          petName,
        },
        currentTime,
      ),
    );
  }

  updatedState = {
    ...updatedState,
    pet: updatedPet,
    totalTicks: updatedState.totalTicks + 1,
    lastSaveTime: currentTime,
  };

  // Process exploration at game state level (needs access to inventory and skills)
  if (
    updatedPet.activityState === ActivityState.Exploring &&
    updatedPet.activeExploration
  ) {
    const newExploration = processExplorationTick(updatedPet.activeExploration);

    if (newExploration === null) {
      // Exploration completed - use new exploration system
      const locationId = updatedPet.activeExploration.locationId;
      const activityId = updatedPet.activeExploration.activityId;
      const location = getLocation(locationId);
      const locationName = location?.name ?? "Unknown Location";

      // Get completed quest IDs for requirement checking
      const completedQuestIds = updatedState.quests
        .filter((q) => q.state === QuestState.Completed)
        .map((q) => q.questId);

      // Complete exploration with the new system
      const completionResult = completeExplorationActivity(
        updatedPet,
        updatedState.player.skills,
        completedQuestIds,
        updatedState.totalTicks,
      );

      // Update pet state
      let updatedStateWithPet: GameState = {
        ...updatedState,
        pet: completionResult.pet,
      };

      if (completionResult.success) {
        // Apply skill XP gains
        const { skills: updatedSkills } = applySkillXpGains(
          updatedStateWithPet.player.skills,
          completionResult.skillXpGains,
        );

        updatedStateWithPet = {
          ...updatedStateWithPet,
          player: {
            ...updatedStateWithPet.player,
            skills: updatedSkills,
          },
        };

        // Add found items to inventory
        let currentInventory = updatedStateWithPet.player.inventory;
        for (const drop of completionResult.itemsFound) {
          currentInventory = addItem(
            currentInventory,
            drop.itemId,
            drop.quantity,
          );
        }

        updatedStateWithPet = {
          ...updatedStateWithPet,
          player: {
            ...updatedStateWithPet.player,
            inventory: currentInventory,
          },
        };

        // Update quest progress for Explore objectives
        updatedStateWithPet = updateQuestProgress(
          updatedStateWithPet,
          ObjectiveType.Explore,
          activityId,
        );

        // Update quest progress for Collect objectives for each item found
        for (const drop of completionResult.itemsFound) {
          updatedStateWithPet = updateQuestProgress(
            updatedStateWithPet,
            ObjectiveType.Collect,
            drop.itemId,
            drop.quantity,
          );
        }
      }

      updatedState = updatedStateWithPet;

      // Emit exploration complete event
      tickEvents.push(
        createEvent<ExplorationCompleteEvent>(
          {
            type: "explorationComplete",
            locationName,
            itemsFound: completionResult.itemsFound,
            message: completionResult.message,
            petName,
          },
          currentTime,
        ),
      );
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

    // Emit training complete event
    if (trainingResultBeforeCompletion && facilityId) {
      const facility = getFacility(facilityId);
      const facilityName = facility?.name ?? "Unknown Facility";

      // Emit training complete event using statsGained from the result
      tickEvents.push(
        createEvent<TrainingCompleteEvent>(
          {
            type: "trainingComplete",
            facilityName,
            statsGained: trainingResultBeforeCompletion.statsGained ?? {},
            message: trainingResultBeforeCompletion.message,
            petName,
          },
          currentTime,
        ),
      );
    }
  }

  // Add all tick events to state
  if (tickEvents.length > 0) {
    updatedState = emitEvents(updatedState, ...tickEvents);
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
      // Collect exploration and training results from pendingEvents
      for (const event of tickState.pendingEvents) {
        if (event.type === "explorationComplete") {
          explorationResults.push({
            locationName: event.locationName,
            itemsFound: event.itemsFound,
            message: event.message,
          });
        } else if (event.type === "trainingComplete") {
          trainingResults.push({
            facilityName: event.facilityName,
            result: {
              success: true,
              message: event.message,
              statsGained: event.statsGained,
            },
          });
        }
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
