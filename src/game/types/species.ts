/**
 * Species interface defining pet species attributes.
 */

import type { BattleStats, DamageResistances } from "./stats";

/**
 * Stat growth rates per growth stage transition.
 * Each stat has a growth rate: "low" (+1-2), "medium" (+3-4), "high" (+5-6).
 */
export type StatGrowthRate = "low" | "medium" | "high";

export interface StatGrowth {
  strength: StatGrowthRate;
  endurance: StatGrowthRate;
  agility: StatGrowthRate;
  precision: StatGrowthRate;
  fortitude: StatGrowthRate;
  cunning: StatGrowthRate;
}

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
  /** Base battle stats */
  baseStats: BattleStats;
  /** Stat growth rates per stage transition */
  statGrowth: StatGrowth;
  /** Care cap multiplier (0.7-1.3), affects max care stats */
  careCapMultiplier: number;
  /** Natural damage resistances */
  resistances: DamageResistances;
  /** How this species is unlocked */
  unlockMethod: UnlockMethod;
}
