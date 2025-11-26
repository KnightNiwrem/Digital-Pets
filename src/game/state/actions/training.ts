/**
 * Training state actions.
 */

import {
  cancelTraining as cancelTrainingCore,
  startTraining as startTrainingCore,
} from "@/game/core/training";
import type { TrainingSessionType } from "@/game/types/activity";
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
