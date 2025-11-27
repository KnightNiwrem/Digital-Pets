/**
 * Sleep state transitions and logic.
 */

import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import type { Tick } from "@/game/types/common";
import { now } from "@/game/types/common";
import type { GrowthStage } from "@/game/types/constants";
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
 * Get the minimum sleep ticks required for a growth stage.
 */
export function getMinSleepTicks(stage: GrowthStage): Tick {
  return GROWTH_STAGE_DEFINITIONS[stage].minSleepTicks;
}

/**
 * Calculate remaining sleep needed for today.
 */
export function getRemainingMinSleep(pet: Pet): Tick {
  const minRequired = getMinSleepTicks(pet.growth.stage);
  return Math.max(0, minRequired - pet.sleep.sleepTicksToday);
}

/**
 * Check if pet has met their minimum sleep requirement for today.
 */
export function hasMetSleepRequirement(pet: Pet): boolean {
  return pet.sleep.sleepTicksToday >= getMinSleepTicks(pet.growth.stage);
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
 * Reset daily sleep tracking.
 * Should be called at midnight local time (daily reset).
 */
export function resetDailySleep(sleep: PetSleep): PetSleep {
  return {
    ...sleep,
    sleepTicksToday: 0,
  };
}

/**
 * Check if the pet can perform care actions (not sleeping).
 */
export function canPerformCareActions(pet: Pet): boolean {
  return !pet.sleep.isSleeping;
}
