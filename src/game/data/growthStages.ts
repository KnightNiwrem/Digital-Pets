/**
 * Growth stage utilities and constants.
 * Growth stage definitions are now embedded in species data.
 */

import type { Tick } from "@/game/types/common";
import { GROWTH_STAGE_ORDER, type GrowthStage } from "@/game/types/constants";
import type { SpeciesGrowthStageStats } from "@/game/types/species";
import { getSpeciesById } from "./species";

/**
 * Convert a stage string to a GrowthStage constant.
 * Returns null if invalid.
 */
export function toGrowthStage(stage: string): GrowthStage | null {
  if (GROWTH_STAGE_ORDER.includes(stage as GrowthStage)) {
    return stage as GrowthStage;
  }
  return null;
}

/**
 * Get the current growth stage stats for a species based on age.
 *
 * Note: For more flexibility (accepting either a Species object or ID),
 * you can also use getSpeciesGrowthStage from species.ts.
 */
export function getSpeciesStageStats(
  speciesId: string,
  ageTicks: Tick,
): SpeciesGrowthStageStats | null {
  const species = getSpeciesById(speciesId);
  if (!species) return null;

  // Find the highest growth stage that the pet qualifies for based on age
  let currentStage: SpeciesGrowthStageStats | undefined;
  for (const stage of species.growthStages) {
    if (ageTicks >= stage.minAgeTicks) {
      currentStage = stage;
    } else {
      break;
    }
  }
  return currentStage ?? null;
}

/**
 * Get the next growth stage for a species based on current age.
 * Returns null if at the final stage.
 */
export function getNextSpeciesStage(
  speciesId: string,
  ageTicks: Tick,
): SpeciesGrowthStageStats | null {
  const species = getSpeciesById(speciesId);
  if (!species) return null;

  // Find the next stage after the current one
  for (let i = 0; i < species.growthStages.length; i++) {
    const stage = species.growthStages[i];
    if (stage && ageTicks < stage.minAgeTicks) {
      return stage;
    }
  }
  return null;
}

/**
 * Calculate ticks until next stage transition.
 * Returns null if at final stage.
 */
export function getTicksUntilNextStageTransition(
  speciesId: string,
  ageTicks: Tick,
): Tick | null {
  const nextStage = getNextSpeciesStage(speciesId, ageTicks);
  if (!nextStage) return null;
  return nextStage.minAgeTicks - ageTicks;
}

/**
 * Get the index of the current growth stage in the species' growth stages array.
 */
export function getCurrentStageIndex(
  speciesId: string,
  ageTicks: Tick,
): number {
  const species = getSpeciesById(speciesId);
  if (!species) return 0;

  let currentIndex = 0;
  for (let i = 0; i < species.growthStages.length; i++) {
    const stage = species.growthStages[i];
    if (stage && ageTicks >= stage.minAgeTicks) {
      currentIndex = i;
    } else {
      break;
    }
  }
  return currentIndex;
}

/**
 * Get progress percentage toward next stage.
 * Returns 100 if at final stage.
 */
export function getStageProgress(speciesId: string, ageTicks: Tick): number {
  const species = getSpeciesById(speciesId);
  if (!species) return 0;

  const currentIndex = getCurrentStageIndex(speciesId, ageTicks);
  const currentStage = species.growthStages[currentIndex];
  const nextStage = species.growthStages[currentIndex + 1];

  if (!currentStage) return 0;
  if (!nextStage) return 100;

  const stageDuration = nextStage.minAgeTicks - currentStage.minAgeTicks;
  const timeInStage = ageTicks - currentStage.minAgeTicks;

  return Math.min(100, Math.floor((timeInStage / stageDuration) * 100));
}
