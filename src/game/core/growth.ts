/**
 * Growth logic for pet age accumulation, stage transitions, and stat updates.
 */

import {
  GROWTH_STAGE_DEFINITIONS,
  getStageFromAge,
  getSubstage,
} from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { Tick } from "@/game/types/common";
import { TICKS_PER_MONTH } from "@/game/types/common";
import { GROWTH_STAGE_ORDER, type GrowthStage } from "@/game/types/constants";
import type { Pet, PetGrowth } from "@/game/types/pet";
import type { StatGrowthRate } from "@/game/types/species";
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
 * Stat gains per growth rate level per stage transition.
 * Low: +1-2, Medium: +3-4, High: +5-6
 */
const GROWTH_RATE_GAINS: Record<StatGrowthRate, { min: number; max: number }> =
  {
    low: { min: 1, max: 2 },
    medium: { min: 3, max: 4 },
    high: { min: 5, max: 6 },
  };

/**
 * Get stat gain for a given growth rate.
 * Uses the midpoint (rounded down) for deterministic behavior.
 */
export function getStatGainForRate(rate: StatGrowthRate): number {
  const gains = GROWTH_RATE_GAINS[rate];
  // Use midpoint for deterministic behavior (can be randomized later if desired)
  return Math.floor((gains.min + gains.max) / 2);
}

/**
 * Calculate battle stat gains for a stage transition.
 */
export function calculateStageTransitionStatGains(
  speciesId: string,
): BattleStats | null {
  const species = getSpeciesById(speciesId);
  if (!species) return null;

  const { statGrowth } = species;

  return {
    strength: getStatGainForRate(statGrowth.strength),
    endurance: getStatGainForRate(statGrowth.endurance),
    agility: getStatGainForRate(statGrowth.agility),
    precision: getStatGainForRate(statGrowth.precision),
    fortitude: getStatGainForRate(statGrowth.fortitude),
    cunning: getStatGainForRate(statGrowth.cunning),
  };
}

/**
 * Apply stat gains to battle stats.
 */
export function applyStatGains(
  currentStats: BattleStats,
  gains: BattleStats,
): BattleStats {
  return {
    strength: currentStats.strength + gains.strength,
    endurance: currentStats.endurance + gains.endurance,
    agility: currentStats.agility + gains.agility,
    precision: currentStats.precision + gains.precision,
    fortitude: currentStats.fortitude + gains.fortitude,
    cunning: currentStats.cunning + gains.cunning,
  };
}

/**
 * Process growth for a single tick.
 * Increments age and checks for stage/substage transitions.
 */
export function processGrowthTick(pet: Pet): GrowthTickResult {
  const newAgeTicks = pet.growth.ageTicks + 1;

  // Determine new stage and substage based on age
  const newStage = getStageFromAge(newAgeTicks);
  const newSubstage = getSubstage(newStage, newAgeTicks);

  const stageTransitioned = newStage !== pet.growth.stage;
  const substageTransitioned =
    !stageTransitioned && newSubstage !== pet.growth.substage;

  let newBattleStats = pet.battleStats;
  let previousStage: GrowthStage | null = null;
  let previousSubstage: number | null = null;

  // Handle stage transition
  if (stageTransitioned) {
    previousStage = pet.growth.stage;
    previousSubstage = pet.growth.substage;

    // Apply stat gains for stage transition
    const statGains = calculateStageTransitionStatGains(pet.identity.speciesId);
    if (statGains) {
      newBattleStats = applyStatGains(pet.battleStats, statGains);
    }
  } else if (substageTransitioned) {
    previousSubstage = pet.growth.substage;
  }

  return {
    growth: {
      ...pet.growth,
      ageTicks: newAgeTicks,
      stage: newStage,
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
 */
export function getTicksUntilNextSubstage(
  stage: GrowthStage,
  substage: number,
  ageTicks: Tick,
): Tick | null {
  const def = GROWTH_STAGE_DEFINITIONS[stage];
  const stageIndex = GROWTH_STAGE_ORDER.indexOf(stage);
  const nextStageIndex = stageIndex + 1;

  // If at max substage, return null (need stage transition)
  if (substage >= def.substageCount) {
    return null;
  }

  // Calculate substage length
  if (nextStageIndex >= GROWTH_STAGE_ORDER.length) {
    // Adult stage: fixed substage length
    const timeInStage = ageTicks - def.minAgeTicks;
    const nextSubstageStartTick = substage * TICKS_PER_MONTH;
    return Math.max(0, nextSubstageStartTick - timeInStage);
  }

  const nextStage = GROWTH_STAGE_ORDER[nextStageIndex];
  if (!nextStage) return null;

  const nextStageDef = GROWTH_STAGE_DEFINITIONS[nextStage];
  const stageDuration = nextStageDef.minAgeTicks - def.minAgeTicks;
  const substageLength = stageDuration / def.substageCount;
  const timeInStage = ageTicks - def.minAgeTicks;
  const nextSubstageStartTick = substage * substageLength;

  return Math.max(0, Math.floor(nextSubstageStartTick - timeInStage));
}

/**
 * Calculate ticks until next main stage.
 */
export function getTicksUntilNextStage(
  stage: GrowthStage,
  ageTicks: Tick,
): Tick | null {
  const nextStage = getNextStage(stage);
  if (!nextStage) return null;

  const nextStageDef = GROWTH_STAGE_DEFINITIONS[nextStage];
  return Math.max(0, nextStageDef.minAgeTicks - ageTicks);
}

/**
 * Calculate progress percentage toward next stage (0-100).
 */
export function getStageProgressPercent(
  stage: GrowthStage,
  ageTicks: Tick,
): number {
  const def = GROWTH_STAGE_DEFINITIONS[stage];
  const nextStage = getNextStage(stage);

  if (!nextStage) {
    // Adult stage: calculate based on substages
    const timeInStage = ageTicks - def.minAgeTicks;
    const totalDuration = def.substageCount * TICKS_PER_MONTH;
    return Math.min(100, Math.floor((timeInStage / totalDuration) * 100));
  }

  const nextStageDef = GROWTH_STAGE_DEFINITIONS[nextStage];
  const stageDuration = nextStageDef.minAgeTicks - def.minAgeTicks;
  const timeInStage = ageTicks - def.minAgeTicks;

  return Math.min(100, Math.floor((timeInStage / stageDuration) * 100));
}
