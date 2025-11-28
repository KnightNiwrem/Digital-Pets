/**
 * Utilities for calculating pet stats based on growth stage and species.
 */

import { getSpeciesStageStats } from "@/game/data/growthStages";
import type { MicroValue } from "@/game/types/common";
import type { GrowthStage } from "@/game/types/constants";
import type { BonusMaxStats, Pet } from "@/game/types/pet";
import type { BattleStats } from "@/game/types/stats";

/**
 * Maximum stat values for a pet based on growth stage and species.
 */
export interface PetMaxStats {
  /** Maximum care stat values (each stat can have different max) */
  care: {
    satiety: MicroValue;
    hydration: MicroValue;
    happiness: MicroValue;
  };
  /** Maximum energy value */
  energy: MicroValue;
  /** Maximum care life value */
  careLife: MicroValue;
  /** Maximum battle stat values */
  battle: BattleStats;
}

/**
 * Create default (zero) bonus max stats.
 */
export function createDefaultBonusMaxStats(): BonusMaxStats {
  return {
    satiety: 0,
    hydration: 0,
    happiness: 0,
    energy: 0,
    careLife: 0,
    battle: {
      strength: 0,
      endurance: 0,
      agility: 0,
      precision: 0,
      fortitude: 0,
      cunning: 0,
    },
  };
}

/**
 * Calculate the maximum stats for a given species at a specific age.
 * Returns null if the species is invalid or no growth stage found.
 */
export function calculateMaxStatsForAge(
  speciesId: string,
  ageTicks: number,
  bonusMaxStats?: BonusMaxStats,
): PetMaxStats | null {
  const stageStats = getSpeciesStageStats(speciesId, ageTicks);
  if (!stageStats) return null;

  const bonus = bonusMaxStats ?? createDefaultBonusMaxStats();

  return {
    care: {
      satiety: stageStats.baseStats.care.satiety + bonus.satiety,
      hydration: stageStats.baseStats.care.hydration + bonus.hydration,
      happiness: stageStats.baseStats.care.happiness + bonus.happiness,
    },
    energy: stageStats.baseStats.energy + bonus.energy,
    careLife: stageStats.baseStats.careLife + bonus.careLife,
    battle: {
      strength: stageStats.baseStats.battle.strength + bonus.battle.strength,
      endurance: stageStats.baseStats.battle.endurance + bonus.battle.endurance,
      agility: stageStats.baseStats.battle.agility + bonus.battle.agility,
      precision: stageStats.baseStats.battle.precision + bonus.battle.precision,
      fortitude: stageStats.baseStats.battle.fortitude + bonus.battle.fortitude,
      cunning: stageStats.baseStats.battle.cunning + bonus.battle.cunning,
    },
  };
}

/**
 * Calculate the maximum stats for a pet based on their growth stage and species.
 * Returns null if the pet's species or growth stage is invalid.
 */
export function calculatePetMaxStats(pet: Pet): PetMaxStats | null {
  return calculateMaxStatsForAge(
    pet.identity.speciesId,
    pet.growth.ageTicks,
    pet.bonusMaxStats,
  );
}

/**
 * Legacy compatibility: Calculate max stats returning a simple object.
 * Used for backwards compatibility with code expecting the old interface.
 * @deprecated Use calculatePetMaxStats instead for full max stats.
 */
export function calculateMaxStats(
  speciesId: string,
  stage: GrowthStage,
): { careStatMax: MicroValue; energyMax: MicroValue } | null {
  // For legacy compatibility, we need to find a stage that matches
  // We'll use the minimum age of that stage
  const stageMinAges: Record<GrowthStage, number> = {
    baby: 0,
    child: 172_800,
    teen: 432_000,
    youngAdult: 691_200,
    adult: 1_036_800,
  };

  const ageTicks = stageMinAges[stage];
  const maxStats = calculateMaxStatsForAge(speciesId, ageTicks);
  if (!maxStats) return null;

  // Return the minimum of care stats for backwards compatibility
  const minCareMax = Math.min(
    maxStats.care.satiety,
    maxStats.care.hydration,
    maxStats.care.happiness,
  );

  return {
    careStatMax: minCareMax,
    energyMax: maxStats.energy,
  };
}
