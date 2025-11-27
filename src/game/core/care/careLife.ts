/**
 * Care life drain/recovery logic.
 */

import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import type { MicroValue } from "@/game/types/common";
import { toDisplayCare } from "@/game/types/common";
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

// Re-export constants for backwards compatibility with tests
export {
  CARE_LIFE_DRAIN_1_STAT,
  CARE_LIFE_DRAIN_2_STATS,
  CARE_LIFE_DRAIN_3_STATS,
  CARE_LIFE_DRAIN_POOP,
  CARE_LIFE_RECOVERY_ABOVE_50,
  CARE_LIFE_RECOVERY_ABOVE_75,
  CARE_LIFE_RECOVERY_AT_100,
  CARE_LIFE_RECOVERY_THRESHOLD_100,
  CARE_LIFE_RECOVERY_THRESHOLD_75,
  CARE_LIFE_RECOVERY_THRESHOLD_50,
};

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
 */
function getCareStatPercentages(pet: Pet, maxCareStat: MicroValue): number[] {
  if (maxCareStat === 0) return [0, 0, 0];
  const satietyPercent = (pet.careStats.satiety / maxCareStat) * 100;
  const hydrationPercent = (pet.careStats.hydration / maxCareStat) * 100;
  const happinessPercent = (pet.careStats.happiness / maxCareStat) * 100;
  return [satietyPercent, hydrationPercent, happinessPercent];
}

/**
 * Calculate the care life change for a single tick.
 * Returns the delta to apply (positive for recovery, negative for drain).
 */
export function calculateCareLifeChange(
  pet: Pet,
  maxCareStat: MicroValue,
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
  const percentages = getCareStatPercentages(pet, maxCareStat);
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
 */
export function applyCareLifeChange(
  pet: Pet,
  maxCareStat: MicroValue,
): MicroValue {
  const stageDef = GROWTH_STAGE_DEFINITIONS[pet.growth.stage];
  const maxCareLife = stageDef.careLifeMax;

  const delta = calculateCareLifeChange(pet, maxCareStat);
  const newCareLife = pet.careLifeStats.careLife + delta;

  return Math.max(0, Math.min(newCareLife, maxCareLife));
}
