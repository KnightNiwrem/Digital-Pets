/**
 * Sleep state transitions and logic.
 */

import { getSpeciesGrowthStage } from "@/game/data/species";
import type { Tick } from "@/game/types/common";
import { now } from "@/game/types/common";
import {
  ActivityState,
  type GrowthStage,
  getActivityConflictMessage,
} from "@/game/types/constants";
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
 * Default minimum sleep ticks by growth stage (fallback if species data unavailable).
 * Based on 120 ticks per hour:
 * - baby: 16 hours = 1920 ticks
 * - child: 14 hours = 1680 ticks
 * - teen: 12 hours = 1440 ticks
 * - youngAdult: 10 hours = 1200 ticks
 * - adult: 8 hours = 960 ticks
 */
const DEFAULT_MIN_SLEEP_TICKS: Record<GrowthStage, Tick> = {
  baby: 1920,
  child: 1680,
  teen: 1440,
  youngAdult: 1200,
  adult: 960,
};

/**
 * Get the minimum sleep ticks required for a pet based on species and age.
 */
export function getMinSleepTicksForPet(pet: Pet): Tick {
  const growthStage = getSpeciesGrowthStage(
    pet.identity.speciesId,
    pet.growth.ageTicks,
  );
  return (
    growthStage?.minSleepTicks ?? DEFAULT_MIN_SLEEP_TICKS[pet.growth.stage]
  );
}

/**
 * Calculate remaining sleep needed for today.
 * Uses species-specific sleep requirements.
 */
export function getRemainingMinSleep(pet: Pet): Tick {
  const minRequired = getMinSleepTicksForPet(pet);
  return Math.max(0, minRequired - pet.sleep.sleepTicksToday);
}

/**
 * Check if pet has met their minimum sleep requirement for today.
 * Uses species-specific sleep requirements.
 */
export function hasMetSleepRequirement(pet: Pet): boolean {
  return pet.sleep.sleepTicksToday >= getMinSleepTicksForPet(pet);
}

/**
 * Put the pet to sleep.
 */
export function putToSleep(pet: Pet): SleepTransitionResult {
  // Check if pet is busy with another activity (training, exploring, battling)
  if (
    pet.activityState !== ActivityState.Idle &&
    pet.activityState !== ActivityState.Sleeping
  ) {
    return {
      success: false,
      sleep: pet.sleep,
      message: getActivityConflictMessage("put to sleep", pet.activityState),
    };
  }

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
