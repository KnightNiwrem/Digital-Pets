/**
 * Species interface defining pet species attributes.
 */

import type { MicroValue } from "./common";
import type { BattleStats, DamageResistances } from "./stats";

/**
 * Species archetype for categorization.
 */
export type SpeciesArchetype =
  | "balanced"
  | "glassCannon"
  | "powerTank"
  | "evasion"
  | "defender"
  | "status";

/**
 * Method by which a species can be unlocked.
 */
export type UnlockMethod = "starting" | "quest" | "discovery" | "achievement";

/**
 * Max stats for care stats at a specific growth stage.
 * Allows different max values for each care stat.
 */
export interface GrowthStageCareMaxStats {
  /** Maximum satiety (micro-units) */
  satiety: MicroValue;
  /** Maximum hydration (micro-units) */
  hydration: MicroValue;
  /** Maximum happiness (micro-units) */
  happiness: MicroValue;
}

/**
 * Complete max stats definition for a specific growth stage of a species.
 * Each species can have different max stats per growth stage.
 */
export interface SpeciesGrowthStageStats {
  /** Stage identifier (e.g., "baby", "child") */
  stage: string;
  /** Substage identifier (e.g., "1", "2", "3") */
  subStage: string;
  /** Display name for this stage */
  name: string;
  /** Minimum age in ticks to reach this stage */
  minAgeTicks: number;
  /** Base max stats for this growth stage */
  baseStats: {
    /** Care stat maximums */
    care: GrowthStageCareMaxStats;
    /** Battle stat maximums */
    battle: BattleStats;
    /** Energy maximum (micro-units) */
    energy: MicroValue;
    /** Care life maximum (micro-units) */
    careLife: MicroValue;
  };
  /** Minimum sleep ticks required per day at this stage */
  minSleepTicks: number;
}

/**
 * Species definition.
 */
export interface Species {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Species archetype */
  archetype: SpeciesArchetype;
  /** Emoji or placeholder visual */
  emoji: string;
  /** Natural damage resistances */
  resistances: DamageResistances;
  /** How this species is unlocked */
  unlockMethod: UnlockMethod;
  /** Growth stages with max stats per stage */
  growthStages: SpeciesGrowthStageStats[];
}
