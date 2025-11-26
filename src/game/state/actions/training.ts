/**
 * Training state actions.
 */

import {
  cancelTraining as cancelTrainingCore,
  completeTraining,
  startTraining as startTrainingCore,
} from "@/game/core/training";
import type { TrainingSessionType } from "@/game/types/activity";
import { ActivityState } from "@/game/types/constants";
import type { GameState } from "@/game/types/gameState";

/**
 * Result of a training action.
 */
export interface TrainingActionResult {
  success: boolean;
  state: GameState;
  message: string;
}

/**
 * Start a training session.
 */
export function startTraining(
  state: GameState,
  facilityId: string,
  sessionType: TrainingSessionType,
): TrainingActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet to train.",
    };
  }

  const result = startTrainingCore(
    state.pet,
    facilityId,
    sessionType,
    state.totalTicks,
  );

  return {
    success: result.success,
    state: {
      ...state,
      pet: result.pet,
    },
    message: result.message,
  };
}

/**
 * Cancel the current training session.
 */
export function cancelTraining(state: GameState): TrainingActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet.",
    };
  }

  const result = cancelTrainingCore(state.pet);

  return {
    success: result.success,
    state: {
      ...state,
      pet: result.pet,
    },
    message: result.message,
  };
}

/**
 * Check training completion and get result message.
 */
export function checkTrainingCompletion(state: GameState): {
  isComplete: boolean;
  message: string;
} {
  if (!state.pet) {
    return { isComplete: false, message: "" };
  }

  // If pet was training but is now idle, training completed
  if (
    state.pet.activityState === ActivityState.Idle &&
    !state.pet.activeTraining
  ) {
    return { isComplete: false, message: "" };
  }

  // If still training
  if (state.pet.activityState === ActivityState.Training) {
    return { isComplete: false, message: "" };
  }

  return { isComplete: false, message: "" };
}

/**
 * Get training completion result without modifying state.
 * Used to display completion messages.
 */
export function getTrainingCompletionResult(state: GameState): {
  statsGained: Record<string, number>;
  message: string;
} | null {
  if (!state.pet?.activeTraining) {
    return null;
  }

  const result = completeTraining(state.pet);
  if (!result.success || !result.statsGained) {
    return null;
  }

  const statsGained: Record<string, number> = {};
  for (const [stat, gain] of Object.entries(result.statsGained)) {
    if (typeof gain === "number" && gain > 0) {
      statsGained[stat] = gain;
    }
  }

  return {
    statsGained,
    message: result.message,
  };
}
