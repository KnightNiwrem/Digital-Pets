/**
 * Growth logic for pet age accumulation, stage transitions, and stat updates.
 */

import { getSpeciesStageStats, toGrowthStage } from "@/game/data/growthStages";

import { GROWTH_STAGE_ORDER, type GrowthStage } from "@/game/types/constants";
import type { Pet, PetGrowth } from "@/game/types/pet";
import type { BattleStats } from "@/game/types/stats";

/**
 * Result of processing growth for a tick.
 */
export interface GrowthTickResult {
  /** Updated growth state */
  growth: PetGrowth;
  /** Updated battle stats (if stage changed) */
  battleStats: BattleStats;
  /** Whether a main stage transition occurred */
  stageTransitioned: boolean;
  /** Whether a substage transition occurred (but not main stage) */
  substageTransitioned: boolean;
  /** Previous stage if transitioned */
  previousStage: GrowthStage | null;
  /** Previous substage if transitioned */
  previousSubstage: number | null;
}

/**
 * Calculate total battle stats by combining base (from growth stage), trained, and bonus stats.
 */
function calculateTotalBattleStats(
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

/**
 * Process growth for a single tick.
 * Increments age and checks for stage/substage transitions.
 * Battle stats are recalculated on transitions as base + trained + bonus.
 */
export function processGrowthTick(pet: Pet): GrowthTickResult {
  const newAgeTicks = pet.growth.ageTicks + 1;
  const speciesId = pet.identity.speciesId;

  // Get current and new stage stats
  const oldStageStats = getSpeciesStageStats(speciesId, pet.growth.ageTicks);
  const newStageStats = getSpeciesStageStats(speciesId, newAgeTicks);

  if (!oldStageStats || !newStageStats) {
    // No valid stage stats, just increment age
    return {
      growth: {
        ...pet.growth,
        ageTicks: newAgeTicks,
      },
      battleStats: pet.battleStats,
      stageTransitioned: false,
      substageTransitioned: false,
      previousStage: null,
      previousSubstage: null,
    };
  }

  // Determine if we transitioned
  const stageChanged = oldStageStats.stage !== newStageStats.stage;
  const substageChanged = oldStageStats.subStage !== newStageStats.subStage;
  const stageTransitioned = stageChanged;
  const substageTransitioned = substageChanged && !stageChanged;

  // Convert to GrowthStage enum
  const newGrowthStage = toGrowthStage(newStageStats.stage) ?? pet.growth.stage;
  const newSubstage = Number.parseInt(newStageStats.subStage, 10) || 1;

  let newBattleStats = pet.battleStats;
  let previousStage: GrowthStage | null = null;
  let previousSubstage: number | null = null;

  if (stageTransitioned || substageTransitioned) {
    previousStage = stageTransitioned ? pet.growth.stage : null;
    previousSubstage = pet.growth.substage;

    // Recalculate total battle stats: new base + trained + bonus
    // This preserves training gains while updating base stats to match new stage
    newBattleStats = calculateTotalBattleStats(
      newStageStats.baseStats.battle,
      pet.trainedBattleStats,
      pet.bonusMaxStats.battle,
    );
  }

  return {
    growth: {
      ...pet.growth,
      ageTicks: newAgeTicks,
      stage: newGrowthStage,
      substage: newSubstage,
    },
    battleStats: newBattleStats,
    stageTransitioned,
    substageTransitioned,
    previousStage,
    previousSubstage,
  };
}

/**
 * Get the next growth stage (if any).
 */
export function getNextStage(stage: GrowthStage): GrowthStage | null {
  const currentIndex = GROWTH_STAGE_ORDER.indexOf(stage);
  if (currentIndex === -1 || currentIndex >= GROWTH_STAGE_ORDER.length - 1) {
    return null;
  }
  return GROWTH_STAGE_ORDER[currentIndex + 1] ?? null;
}
