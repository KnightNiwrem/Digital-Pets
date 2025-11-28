/**
 * Growth logic for pet age accumulation, stage transitions, and stat updates.
 */

import { getSpeciesStageStats, toGrowthStage } from "@/game/data/growthStages";
import type { Tick } from "@/game/types/common";
import { TICKS_PER_MONTH } from "@/game/types/common";
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
 * Process growth for a single tick.
 * Increments age and checks for stage/substage transitions.
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

  // Get new battle stats from the growth stage definition
  // Battle stats now come from the species growth stage directly
  let newBattleStats = pet.battleStats;
  let previousStage: GrowthStage | null = null;
  let previousSubstage: number | null = null;

  if (stageTransitioned || substageTransitioned) {
    previousStage = stageTransitioned ? pet.growth.stage : null;
    previousSubstage = pet.growth.substage;

    // Update battle stats to the new growth stage's base stats
    // The pet's current battle stats should update to match the new stage
    newBattleStats = { ...newStageStats.baseStats.battle };
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

/**
 * Calculate ticks until next substage.
 * Now uses species-specific growth stage data.
 * @deprecated Use getTicksUntilNextStageTransition with speciesId instead.
 */
export function getTicksUntilNextSubstage(
  _stage: GrowthStage,
  _substage: number,
  _ageTicks: Tick,
): Tick | null {
  // This is a simplified version - for proper substage calculation,
  // we'd need the speciesId. For now, return the ticks until next transition.
  // In practice, callers should use getTicksUntilNextStageTransition directly.
  return null;
}

/**
 * Calculate ticks until next main stage.
 * Now uses species-specific data via getTicksUntilNextStageTransition.
 * Note: This is kept for backwards compatibility but callers should prefer
 * using getTicksUntilNextStageTransition with speciesId.
 */
export function getTicksUntilNextStage(
  stage: GrowthStage,
  ageTicks: Tick,
): Tick | null {
  // Without speciesId, we can't calculate species-specific thresholds.
  // This function is kept for backwards compatibility.
  // Callers should use getTicksUntilNextStageTransition from growthStages.ts.
  const nextStage = getNextStage(stage);
  if (!nextStage) return null;

  // Use generic thresholds as fallback
  const stageMinAges: Record<GrowthStage, number> = {
    baby: 0,
    child: 172_800,
    teen: 432_000,
    youngAdult: 691_200,
    adult: 1_036_800,
  };

  return Math.max(0, stageMinAges[nextStage] - ageTicks);
}

/**
 * Calculate progress percentage toward next stage (0-100).
 * For species-specific progress, use getStageProgress from growthStages.ts.
 */
export function getStageProgressPercent(
  stage: GrowthStage,
  ageTicks: Tick,
): number {
  const nextStage = getNextStage(stage);

  // Use generic thresholds as fallback
  const stageMinAges: Record<GrowthStage, number> = {
    baby: 0,
    child: 172_800,
    teen: 432_000,
    youngAdult: 691_200,
    adult: 1_036_800,
  };

  if (!nextStage) {
    // Adult stage: calculate based on fixed substages
    const timeInStage = ageTicks - stageMinAges[stage];
    const totalDuration = 3 * TICKS_PER_MONTH;
    return Math.min(100, Math.floor((timeInStage / totalDuration) * 100));
  }

  const stageDuration = stageMinAges[nextStage] - stageMinAges[stage];
  const timeInStage = ageTicks - stageMinAges[stage];

  return Math.min(100, Math.floor((timeInStage / stageDuration) * 100));
}
