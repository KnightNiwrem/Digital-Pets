/**
 * Care life drain/recovery logic.
 */

import type { MicroValue } from "@/game/types/common";
import { PERCENTAGE_MAX, toDisplayCare } from "@/game/types/common";
import type { Pet } from "@/game/types/pet";
import {
  CARE_LIFE_DRAIN_1_STAT,
  CARE_LIFE_DRAIN_2_STATS,
  CARE_LIFE_DRAIN_3_STATS,
  CARE_LIFE_DRAIN_POOP,
  CARE_LIFE_RECOVERY_ABOVE_50,
  CARE_LIFE_RECOVERY_ABOVE_75,
  CARE_LIFE_RECOVERY_AT_100,
  CARE_LIFE_RECOVERY_THRESHOLD_50,
  CARE_LIFE_RECOVERY_THRESHOLD_75,
  CARE_LIFE_RECOVERY_THRESHOLD_100,
  POOP_CARE_LIFE_DRAIN_THRESHOLD,
} from "./constants";

/**
 * Maximum care stats for percentage calculations.
 */
export interface MaxCareStats {
  satiety: MicroValue;
  hydration: MicroValue;
  happiness: MicroValue;
}

/**
 * Count how many care stats have a display value of 0.
 */
function countCriticalStats(pet: Pet): number {
  let count = 0;
  if (toDisplayCare(pet.careStats.satiety) <= 0) count++;
  if (toDisplayCare(pet.careStats.hydration) <= 0) count++;
  if (toDisplayCare(pet.careStats.happiness) <= 0) count++;
  return count;
}

/**
 * Get care stat percentages for recovery calculation.
 * Uses the correct max value for each individual stat.
 */
function getCareStatPercentages(
  pet: Pet,
  maxCareStats: MaxCareStats,
): number[] {
  const satietyPercent =
    maxCareStats.satiety === 0
      ? 0
      : (pet.careStats.satiety / maxCareStats.satiety) * PERCENTAGE_MAX;
  const hydrationPercent =
    maxCareStats.hydration === 0
      ? 0
      : (pet.careStats.hydration / maxCareStats.hydration) * PERCENTAGE_MAX;
  const happinessPercent =
    maxCareStats.happiness === 0
      ? 0
      : (pet.careStats.happiness / maxCareStats.happiness) * PERCENTAGE_MAX;
  return [satietyPercent, hydrationPercent, happinessPercent];
}

/**
 * Calculate the care life change for a single tick.
 * Returns the delta to apply (positive for recovery, negative for drain).
 */
export function calculateCareLifeChange(
  pet: Pet,
  maxCareStats: MaxCareStats,
): MicroValue {
  const criticalCount = countCriticalStats(pet);
  let totalDrain = 0;

  // Calculate drain from critical stats
  if (criticalCount > 0) {
    switch (criticalCount) {
      case 1:
        totalDrain += CARE_LIFE_DRAIN_1_STAT;
        break;
      case 2:
        totalDrain += CARE_LIFE_DRAIN_2_STATS;
        break;
      case 3:
        totalDrain += CARE_LIFE_DRAIN_3_STATS;
        break;
    }
  }

  // Add drain from high poop count
  if (pet.poop.count >= POOP_CARE_LIFE_DRAIN_THRESHOLD) {
    totalDrain += CARE_LIFE_DRAIN_POOP;
  }

  // If there's any drain, apply it and exit
  if (totalDrain > 0) {
    return -totalDrain;
  }

  // If no drain, check for recovery conditions
  const percentages = getCareStatPercentages(pet, maxCareStats);
  const minPercent = Math.min(...percentages);

  if (minPercent >= CARE_LIFE_RECOVERY_THRESHOLD_100) {
    return CARE_LIFE_RECOVERY_AT_100;
  }
  if (minPercent >= CARE_LIFE_RECOVERY_THRESHOLD_75) {
    return CARE_LIFE_RECOVERY_ABOVE_75;
  }
  if (minPercent >= CARE_LIFE_RECOVERY_THRESHOLD_50) {
    return CARE_LIFE_RECOVERY_ABOVE_50;
  }

  // No change if stats are between 0% and 50% and no other drain conditions met
  return 0;
}

/**
 * Apply care life change for a single tick.
 * Returns the new care life value.
 *
 * @param pet - The pet to process
 * @param maxCareStats - Max care stats for percentage calculations
 * @param maxCareLife - Max care life value (pass from pre-computed max stats to avoid recalculation)
 */
export function applyCareLifeChange(
  pet: Pet,
  maxCareStats: MaxCareStats,
  maxCareLife: MicroValue,
): MicroValue {
  const delta = calculateCareLifeChange(pet, maxCareStats);
  const newCareLife = pet.careLifeStats.careLife + delta;

  return Math.max(0, Math.min(newCareLife, maxCareLife));
}
