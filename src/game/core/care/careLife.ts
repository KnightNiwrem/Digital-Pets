/**
 * Care life drain/recovery logic.
 */

import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import type { MicroValue } from "@/game/types/common";
import { toDisplay } from "@/game/types/common";
import type { Pet } from "@/game/types/pet";

/**
 * Care life drain rates per tick when care stats are at 0.
 */
export const CARE_LIFE_DRAIN_1_STAT: MicroValue = 8;
export const CARE_LIFE_DRAIN_2_STATS: MicroValue = 25;
export const CARE_LIFE_DRAIN_3_STATS: MicroValue = 50;

/**
 * Additional drain when poop count is 7+.
 */
export const CARE_LIFE_DRAIN_POOP: MicroValue = 8;

/**
 * Care life recovery rates when care stats are healthy.
 */
export const CARE_LIFE_RECOVERY_ABOVE_50: MicroValue = 8;
export const CARE_LIFE_RECOVERY_ABOVE_75: MicroValue = 16;
export const CARE_LIFE_RECOVERY_AT_100: MicroValue = 25;

/**
 * Count how many care stats have a display value of 0.
 */
function countCriticalStats(pet: Pet): number {
  let count = 0;
  if (toDisplay(pet.careStats.satiety) <= 0) count++;
  if (toDisplay(pet.careStats.hydration) <= 0) count++;
  if (toDisplay(pet.careStats.happiness) <= 0) count++;
  return count;
}

/**
 * Get care stat percentages for recovery calculation.
 */
function getCareStatPercentages(pet: Pet, maxCareStat: MicroValue): number[] {
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

  // If any stats are critical, calculate drain
  if (criticalCount > 0) {
    let drain = 0;

    switch (criticalCount) {
      case 1:
        drain = CARE_LIFE_DRAIN_1_STAT;
        break;
      case 2:
        drain = CARE_LIFE_DRAIN_2_STATS;
        break;
      case 3:
        drain = CARE_LIFE_DRAIN_3_STATS;
        break;
    }

    // Additional drain from high poop
    if (pet.poop.count >= 7) {
      drain += CARE_LIFE_DRAIN_POOP;
    }

    return -drain;
  }

  // If poop is 7+, drain even if stats are okay
  if (pet.poop.count >= 7) {
    return -CARE_LIFE_DRAIN_POOP;
  }

  // Check for recovery conditions
  const percentages = getCareStatPercentages(pet, maxCareStat);
  const minPercent = Math.min(...percentages);

  if (minPercent >= 100) {
    return CARE_LIFE_RECOVERY_AT_100;
  }
  if (minPercent >= 75) {
    return CARE_LIFE_RECOVERY_ABOVE_75;
  }
  if (minPercent >= 50) {
    return CARE_LIFE_RECOVERY_ABOVE_50;
  }

  // No change if between 0% and 50%
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
