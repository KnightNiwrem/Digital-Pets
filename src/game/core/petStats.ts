/**
 * Utilities for calculating pet stats based on growth stage and species.
 */

import { getSpeciesStageStats } from "@/game/data/growthStages";
import type { MicroValue } from "@/game/types/common";
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
 * Zero-value battle stats for initialization.
 */
const ZERO_BATTLE_STATS: BattleStats = {
  strength: 0,
  endurance: 0,
  agility: 0,
  precision: 0,
  fortitude: 0,
  cunning: 0,
};

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
    battle: { ...ZERO_BATTLE_STATS },
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
 * Calculate total battle stats by combining base (from growth stage), trained, and bonus stats.
 * Use this whenever you need to compute effective battle stats from their components.
 */
export function calculateTotalBattleStats(
  baseStats: BattleStats,
  trainedStats: BattleStats,
  bonusStats: BattleStats,
): BattleStats {
  return {
    strength: baseStats.strength + trainedStats.strength + bonusStats.strength,
    endurance:
      baseStats.endurance + trainedStats.endurance + bonusStats.endurance,
    agility: baseStats.agility + trainedStats.agility + bonusStats.agility,
    precision:
      baseStats.precision + trainedStats.precision + bonusStats.precision,
    fortitude:
      baseStats.fortitude + trainedStats.fortitude + bonusStats.fortitude,
    cunning: baseStats.cunning + trainedStats.cunning + bonusStats.cunning,
  };
}
