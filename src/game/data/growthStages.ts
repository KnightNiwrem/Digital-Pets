/**
 * Growth stage definitions with thresholds and properties.
 */

import type { MicroValue, Tick } from "@/game/types/common";
import { TICKS_PER_MONTH } from "@/game/types/common";
import { GROWTH_STAGE_ORDER, type GrowthStage } from "@/game/types/constants";

/**
 * Definition for a growth stage.
 */
export interface GrowthStageDefinition {
  /** Growth stage identifier */
  stage: GrowthStage;
  /** Display name */
  name: string;
  /** Number of substages within this stage */
  substageCount: number;
  /** Minimum age in ticks to reach this stage */
  minAgeTicks: Tick;
  /** Base maximum for care stats (micro-units) */
  baseCareStatMax: MicroValue;
  /** Base maximum for energy (micro-units) */
  baseEnergyMax: MicroValue;
  /** Maximum care life (micro-units) */
  careLifeMax: MicroValue;
  /**
   * Minimum sleep ticks required per day.
   * Per spec (training.md):
   * - Baby: 1920 ticks (16 hours)
   * - Child: 1680 ticks (14 hours)
   * - Teen: 1440 ticks (12 hours)
   * - Young Adult: 1200 ticks (10 hours)
   * - Adult: 960 ticks (8 hours)
   */
  minSleepTicks: Tick;
}

/**
 * Growth stage definitions.
 * Target: ~12 months real time to reach Adult.
 *
 * Tick reference:
 * - 1 day = 2880 ticks
 * - 1 week = 20,160 ticks
 * - 1 month ≈ 86,400 ticks (30 days)
 */
export const GROWTH_STAGE_DEFINITIONS: Record<
  GrowthStage,
  GrowthStageDefinition
> = {
  baby: {
    stage: "baby",
    name: "Baby",
    substageCount: 3,
    minAgeTicks: 0,
    baseCareStatMax: 50_000,
    baseEnergyMax: 50_000,
    careLifeMax: 72_000,
    minSleepTicks: 1920, // 16 hours
  },
  child: {
    stage: "child",
    name: "Child",
    substageCount: 3,
    minAgeTicks: 172_800, // ~2 months
    baseCareStatMax: 80_000,
    baseEnergyMax: 75_000,
    careLifeMax: 120_000,
    minSleepTicks: 1680, // 14 hours
  },
  teen: {
    stage: "teen",
    name: "Teen",
    substageCount: 3,
    minAgeTicks: 432_000, // ~5 months
    baseCareStatMax: 120_000,
    baseEnergyMax: 100_000,
    careLifeMax: 168_000,
    minSleepTicks: 1440, // 12 hours
  },
  youngAdult: {
    stage: "youngAdult",
    name: "Young Adult",
    substageCount: 3,
    minAgeTicks: 691_200, // ~8 months
    baseCareStatMax: 160_000,
    baseEnergyMax: 150_000,
    careLifeMax: 240_000,
    minSleepTicks: 1200, // 10 hours
  },
  adult: {
    stage: "adult",
    name: "Adult",
    substageCount: 3,
    minAgeTicks: 1_036_800, // ~12 months
    baseCareStatMax: 200_000,
    baseEnergyMax: 200_000,
    careLifeMax: 336_000,
    minSleepTicks: 960, // 8 hours
  },
};

/**
 * Get growth stage definition by stage.
 */
export function getGrowthStageDefinition(
  stage: GrowthStage,
): GrowthStageDefinition {
  return GROWTH_STAGE_DEFINITIONS[stage];
}

/**
 * Determine growth stage from age in ticks.
 */
export function getStageFromAge(ageTicks: Tick): GrowthStage {
  if (ageTicks >= GROWTH_STAGE_DEFINITIONS.adult.minAgeTicks) return "adult";
  if (ageTicks >= GROWTH_STAGE_DEFINITIONS.youngAdult.minAgeTicks)
    return "youngAdult";
  if (ageTicks >= GROWTH_STAGE_DEFINITIONS.teen.minAgeTicks) return "teen";
  if (ageTicks >= GROWTH_STAGE_DEFINITIONS.child.minAgeTicks) return "child";
  return "baby";
}

/**
 * Calculate substage within the current growth stage.
 */
export function getSubstage(stage: GrowthStage, ageTicks: Tick): number {
  const def = GROWTH_STAGE_DEFINITIONS[stage];
  const stageIndex = GROWTH_STAGE_ORDER.indexOf(stage);
  const nextStageIndex = stageIndex + 1;

  // If adult, calculate substage based on time in adult stage
  if (nextStageIndex >= GROWTH_STAGE_ORDER.length) {
    const timeInStage = ageTicks - def.minAgeTicks;
    return Math.min(
      def.substageCount,
      Math.floor(timeInStage / TICKS_PER_MONTH) + 1,
    );
  }

  // TypeScript doesn't know nextStageIndex is valid after the length check above
  const nextStage = GROWTH_STAGE_ORDER[nextStageIndex];
  if (!nextStage) return 1; // Safety fallback, should never happen

  const nextStageDef = GROWTH_STAGE_DEFINITIONS[nextStage];
  const stageDuration = nextStageDef.minAgeTicks - def.minAgeTicks;
  const timeInStage = ageTicks - def.minAgeTicks;
  const substageLength = stageDuration / def.substageCount;

  return Math.min(
    def.substageCount,
    Math.floor(timeInStage / substageLength) + 1,
  );
}
