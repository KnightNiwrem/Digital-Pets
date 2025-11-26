/**
 * Sleep state transitions and logic.
 */

import { now } from "@/game/types/common";
import type { Pet, PetSleep } from "@/game/types/pet";

/**
 * Result of a sleep state transition.
 */
export interface SleepTransitionResult {
  success: boolean;
  sleep: PetSleep;
  message: string;
}

/**
 * Put the pet to sleep.
 */
export function putToSleep(pet: Pet): SleepTransitionResult {
  if (pet.sleep.isSleeping) {
    return {
      success: false,
      sleep: pet.sleep,
      message: "Pet is already sleeping.",
    };
  }

  return {
    success: true,
    sleep: {
      isSleeping: true,
      sleepStartTime: now(),
      sleepTicksToday: pet.sleep.sleepTicksToday,
    },
    message: "Pet is now sleeping.",
  };
}

/**
 * Wake the pet up.
 */
export function wakeUp(pet: Pet): SleepTransitionResult {
  if (!pet.sleep.isSleeping) {
    return {
      success: false,
      sleep: pet.sleep,
      message: "Pet is already awake.",
    };
  }

  return {
    success: true,
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: pet.sleep.sleepTicksToday,
    },
    message: "Pet is now awake.",
  };
}

/**
 * Process sleep timer for a single tick.
 * Accumulates sleep time if the pet is sleeping.
 */
export function processSleepTick(sleep: PetSleep): PetSleep {
  if (!sleep.isSleeping) {
    return sleep;
  }

  return {
    ...sleep,
    sleepTicksToday: sleep.sleepTicksToday + 1,
  };
}

/**
 * Check if the pet can perform care actions (not sleeping).
 */
export function canPerformCareActions(pet: Pet): boolean {
  return !pet.sleep.isSleeping;
}
