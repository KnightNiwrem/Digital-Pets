/**
 * Sleep state actions for putting the pet to sleep and waking it up.
 */

import { putToSleep, wakeUp } from "@/game/core/sleep";
import type { GameState } from "@/game/types/gameState";

/**
 * Result of a sleep action.
 */
export interface SleepActionResult {
  success: boolean;
  state: GameState;
  message: string;
}

/**
 * Put the pet to sleep.
 */
export function sleepPet(state: GameState): SleepActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet to put to sleep.",
    };
  }

  const result = putToSleep(state.pet);

  return {
    success: result.success,
    state: {
      ...state,
      pet: {
        ...state.pet,
        sleep: result.sleep,
      },
    },
    message: result.message,
  };
}

/**
 * Wake the pet up.
 */
export function wakePet(state: GameState): SleepActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet to wake up.",
    };
  }

  const result = wakeUp(state.pet);

  return {
    success: result.success,
    state: {
      ...state,
      pet: {
        ...state.pet,
        sleep: result.sleep,
      },
    },
    message: result.message,
  };
}
