/**
 * Sleep state transitions and logic.
 */

import { checkActivityIdle } from "@/game/core/activityGating";
import { SleepMessages } from "@/game/data/messages";
import { getSpeciesGrowthStage } from "@/game/data/species";
import type { Tick } from "@/game/types/common";
import { now, TICKS_PER_HOUR } from "@/game/types/common";
import { ActivityState, type GrowthStage } from "@/game/types/constants";
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
 * Activity reason string for sleep gating checks.
 */
const SLEEP_ACTIVITY_REASON = "put to sleep";

/**
 * Default minimum sleep hours by growth stage.
 */
const DEFAULT_MIN_SLEEP_HOURS: Record<GrowthStage, number> = {
  baby: 16,
  child: 14,
  teen: 12,
  youngAdult: 10,
  adult: 8,
};

/**
 * Default minimum sleep ticks by growth stage (fallback if species data unavailable).
 * Derived from DEFAULT_MIN_SLEEP_HOURS × TICKS_PER_HOUR.
 */
const DEFAULT_MIN_SLEEP_TICKS: Record<GrowthStage, Tick> = {
  baby: DEFAULT_MIN_SLEEP_HOURS.baby * TICKS_PER_HOUR,
  child: DEFAULT_MIN_SLEEP_HOURS.child * TICKS_PER_HOUR,
  teen: DEFAULT_MIN_SLEEP_HOURS.teen * TICKS_PER_HOUR,
  youngAdult: DEFAULT_MIN_SLEEP_HOURS.youngAdult * TICKS_PER_HOUR,
  adult: DEFAULT_MIN_SLEEP_HOURS.adult * TICKS_PER_HOUR,
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
  // Allow sleeping when already idle or already sleeping
  if (
    pet.activityState !== ActivityState.Idle &&
    pet.activityState !== ActivityState.Sleeping
  ) {
    const gatingCheck = checkActivityIdle(pet, SLEEP_ACTIVITY_REASON);
    return {
      success: false,
      sleep: pet.sleep,
      message: gatingCheck.message,
    };
  }

  if (pet.sleep.isSleeping) {
    return {
      success: false,
      sleep: pet.sleep,
      message: SleepMessages.alreadySleeping,
    };
  }

  return {
    success: true,
    sleep: {
      isSleeping: true,
      sleepStartTime: now(),
      sleepTicksToday: pet.sleep.sleepTicksToday,
    },
    message: SleepMessages.nowSleeping,
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
      message: SleepMessages.alreadyAwake,
    };
  }

  return {
    success: true,
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: pet.sleep.sleepTicksToday,
    },
    message: SleepMessages.nowAwake,
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
