/**
 * Stats interfaces for care and battle systems.
 */

import type { MicroValue } from "./common";
import type { DamageType } from "./constants";

/**
 * Care stats representing immediate pet needs.
 * All values are in micro-units.
 */
export interface CareStats {
  /** Hunger level (micro-units) */
  satiety: MicroValue;
  /** Thirst level (micro-units) */
  hydration: MicroValue;
  /** Mood/contentment (micro-units) */
  happiness: MicroValue;
}

/**
 * Energy stat for activities.
 * Stored in micro-units.
 */
export interface EnergyStats {
  /** Current energy (micro-units) */
  energy: MicroValue;
}

/**
 * Hidden care life stat representing overall pet health.
 * When Care Life reaches 0, the pet dies permanently.
 * Uses same micro-magnitude but is never displayed to player.
 */
export interface CareLifeStats {
  /** Current care life (micro-units) - hidden from player */
  careLife: MicroValue;
}

/**
 * Six core battle attributes for combat.
 * These are base integer values (not micro-units).
 */
export interface BattleStats {
  /** Physical damage output */
  strength: number;
  /** Health pool and damage mitigation */
  endurance: number;
  /** Turn order, dodge chance */
  agility: number;
  /** Hit accuracy, critical hit chance */
  precision: number;
  /** Status resistance, stamina pool */
  fortitude: number;
  /** Debuff potency, counter-attack chance */
  cunning: number;
}

/**
 * Stats derived from base battle stats during combat.
 * Calculated at battle start and when stats change.
 */
export interface DerivedBattleStats {
  /** Health pool based on Endurance */
  maxHealth: number;
  /** Current health during battle */
  currentHealth: number;
  /** Stamina pool based on Fortitude */
  maxStamina: number;
  /** Current stamina during battle */
  currentStamina: number;
  /** Turn order priority based on Agility + Cunning */
  initiative: number;
  /** Chance to avoid attacks (percentage, 0-100) */
  dodgeChance: number;
  /** Chance for critical hits (percentage, 0-100) */
  criticalChance: number;
  /** Critical hit damage multiplier */
  criticalDamage: number;
  /** Chance to counter-attack (percentage, 0-100) */
  counterChance: number;
}

/**
 * Damage type resistances.
 * Each value is a percentage (0-100) of damage reduction.
 */
export type DamageResistances = Record<DamageType, number>;

/**
 * Create default (zero) damage resistances.
 */
export function createDefaultResistances(): DamageResistances {
  return {
    slashing: 0,
    piercing: 0,
    crushing: 0,
    chemical: 0,
    thermal: 0,
    electric: 0,
  };
}

/**
 * Create default (zero) battle stats.
 */
export function createDefaultBattleStats(): BattleStats {
  return {
    strength: 0,
    endurance: 0,
    agility: 0,
    precision: 0,
    fortitude: 0,
    cunning: 0,
  };
}
