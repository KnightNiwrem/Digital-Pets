/**
 * Derived stat calculations for the battle system.
 */

import type { BattleStats, DerivedBattleStats } from "@/game/types/stats";

/**
 * Battle formula constants.
 *
 * These values are tuned so that battles between pets with equal stats
 * complete within 8-10 turns (4-5 turns per combatant).
 */
export const BATTLE_CONSTANTS = {
  /** Base health value */
  BASE_HEALTH: 30,
  /** Health per point of Endurance */
  HEALTH_PER_ENDURANCE: 2,
  /** Base stamina value */
  BASE_STAMINA: 30,
  /** Stamina per point of Fortitude */
  STAMINA_PER_FORTITUDE: 3,
  /** Percentage of Cunning that contributes to initiative */
  CUNNING_INITIATIVE_FACTOR: 0.3,
  /** Dodge chance per point of Agility */
  DODGE_PER_AGILITY: 0.5,
  /** Maximum dodge chance (%) */
  MAX_DODGE_CHANCE: 50,
  /** Base critical chance (%) */
  BASE_CRIT_CHANCE: 5,
  /** Critical chance per point of Precision */
  CRIT_PER_PRECISION: 0.3,
  /** Maximum critical chance (%) */
  MAX_CRIT_CHANCE: 50,
  /** Base critical damage multiplier */
  BASE_CRIT_MULTIPLIER: 1.5,
  /** Critical damage bonus per point of Cunning */
  CRIT_DAMAGE_PER_CUNNING: 0.01,
  /** Counter chance per point of Cunning */
  COUNTER_PER_CUNNING: 0.4,
  /** Maximum counter chance (%) */
  MAX_COUNTER_CHANCE: 30,
  /** Stamina regeneration per turn (percentage of max) */
  STAMINA_REGEN_PERCENT: 10,
} as const;

/**
 * Calculate derived battle stats from base battle stats.
 */
export function calculateDerivedStats(
  baseStats: BattleStats,
): DerivedBattleStats {
  const {
    strength: _strength,
    endurance,
    agility,
    precision,
    fortitude,
    cunning,
  } = baseStats;

  // Health: base + endurance scaling
  const maxHealth =
    BATTLE_CONSTANTS.BASE_HEALTH +
    endurance * BATTLE_CONSTANTS.HEALTH_PER_ENDURANCE;

  // Stamina: base + fortitude scaling
  const maxStamina =
    BATTLE_CONSTANTS.BASE_STAMINA +
    fortitude * BATTLE_CONSTANTS.STAMINA_PER_FORTITUDE;

  // Initiative: agility + partial cunning
  const initiative =
    agility + Math.floor(cunning * BATTLE_CONSTANTS.CUNNING_INITIATIVE_FACTOR);

  // Dodge chance: agility based, capped
  const dodgeChance = Math.min(
    BATTLE_CONSTANTS.MAX_DODGE_CHANCE,
    agility * BATTLE_CONSTANTS.DODGE_PER_AGILITY,
  );

  // Critical chance: base + precision, capped
  const criticalChance = Math.min(
    BATTLE_CONSTANTS.MAX_CRIT_CHANCE,
    BATTLE_CONSTANTS.BASE_CRIT_CHANCE +
      precision * BATTLE_CONSTANTS.CRIT_PER_PRECISION,
  );

  // Critical damage: base multiplier + cunning scaling
  const criticalDamage =
    BATTLE_CONSTANTS.BASE_CRIT_MULTIPLIER +
    cunning * BATTLE_CONSTANTS.CRIT_DAMAGE_PER_CUNNING;

  // Counter chance: cunning based, capped
  const counterChance = Math.min(
    BATTLE_CONSTANTS.MAX_COUNTER_CHANCE,
    cunning * BATTLE_CONSTANTS.COUNTER_PER_CUNNING,
  );

  return {
    maxHealth,
    currentHealth: maxHealth,
    maxStamina,
    currentStamina: maxStamina,
    initiative,
    dodgeChance,
    criticalChance,
    criticalDamage,
    counterChance,
  };
}

/**
 * Calculate stamina regeneration amount for a turn.
 */
export function calculateStaminaRegen(maxStamina: number): number {
  return Math.floor(
    (maxStamina * BATTLE_CONSTANTS.STAMINA_REGEN_PERCENT) / 100,
  );
}

/**
 * Apply stat modifier from buff/debuff.
 * Returns the modified stat value.
 */
export function applyStatModifier(
  baseStat: number,
  modifierPercent: number,
  isDebuff: boolean,
): number {
  const multiplier = isDebuff
    ? 1 - modifierPercent / 100
    : 1 + modifierPercent / 100;
  return Math.max(1, Math.floor(baseStat * multiplier));
}
