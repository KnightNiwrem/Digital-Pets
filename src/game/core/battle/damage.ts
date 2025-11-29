/**
 * Damage calculation for the battle system.
 */

import type { DamageType } from "@/game/types/constants";
import type { Move } from "@/game/types/move";
import type { BattleStats, DamageResistances } from "@/game/types/stats";

/**
 * Damage formula constants.
 *
 * These values are tuned so that battles between pets with equal stats
 * complete within 8-10 turns (4-5 turns per combatant).
 */
export const DAMAGE_CONSTANTS = {
  /** Divisor for power scaling (lower = more damage) */
  POWER_DIVISOR: 5,
  /** Base hit chance (%) */
  BASE_HIT_CHANCE: 85,
  /** Hit chance bonus per point of Precision */
  PRECISION_HIT_BONUS: 0.5,
  /** Minimum damage variance multiplier */
  MIN_VARIANCE: 0.85,
  /** Maximum damage variance multiplier */
  MAX_VARIANCE: 1.15,
  /** Maximum resistance percentage */
  MAX_RESISTANCE: 75,
} as const;

/**
 * Result of a damage calculation.
 */
export interface DamageResult {
  /** Final damage amount */
  damage: number;
  /** Whether the attack hit */
  isHit: boolean;
  /** Whether the attack was a critical hit */
  isCritical: boolean;
  /** Whether the attack was dodged */
  isDodged: boolean;
  /** Raw damage before mitigation (for display) */
  rawDamage: number;
}

/**
 * Calculate base damage for a move.
 */
export function calculateBaseDamage(
  attackerStrength: number,
  move: Move,
): number {
  return (
    (attackerStrength * move.power) / DAMAGE_CONSTANTS.POWER_DIVISOR +
    move.flatDamage
  );
}

/**
 * Calculate hit chance for an attack.
 */
export function calculateHitChance(
  attackerPrecision: number,
  targetDodgeChance: number,
  moveAccuracyModifier: number,
): number {
  const baseChance = DAMAGE_CONSTANTS.BASE_HIT_CHANCE;
  const precisionBonus =
    attackerPrecision * DAMAGE_CONSTANTS.PRECISION_HIT_BONUS;
  const hitChance =
    baseChance + precisionBonus + moveAccuracyModifier - targetDodgeChance;
  return Math.max(5, Math.min(100, hitChance)); // Clamp between 5% and 100%
}

/**
 * Roll for whether an attack hits.
 */
export function rollHit(hitChance: number): boolean {
  return Math.random() * 100 < hitChance;
}

/**
 * Roll for whether an attack is a critical hit.
 */
export function rollCritical(criticalChance: number): boolean {
  return Math.random() * 100 < criticalChance;
}

/**
 * Calculate resistance multiplier for a damage type.
 */
export function calculateResistanceMultiplier(
  resistances: DamageResistances,
  damageType: DamageType,
): number {
  const resistance = Math.min(
    DAMAGE_CONSTANTS.MAX_RESISTANCE,
    resistances[damageType],
  );
  return 1 - resistance / 100;
}

/**
 * Calculate endurance mitigation.
 */
export function calculateEnduranceMitigation(targetEndurance: number): number {
  return 100 / (100 + targetEndurance);
}

/**
 * Apply damage variance.
 */
export function applyVariance(damage: number): number {
  const variance =
    DAMAGE_CONSTANTS.MIN_VARIANCE +
    Math.random() *
      (DAMAGE_CONSTANTS.MAX_VARIANCE - DAMAGE_CONSTANTS.MIN_VARIANCE);
  return Math.round(damage * variance);
}

/**
 * Full damage calculation pipeline.
 */
export function calculateDamage(
  attacker: {
    battleStats: BattleStats;
    criticalChance: number;
    criticalDamage: number;
  },
  defender: {
    battleStats: BattleStats;
    resistances: DamageResistances;
    dodgeChance: number;
  },
  move: Move,
): DamageResult {
  // Self-targeting moves (buffs) deal no damage
  if (move.target === "self" || move.power === 0) {
    return {
      damage: 0,
      isHit: true,
      isCritical: false,
      isDodged: false,
      rawDamage: 0,
    };
  }

  // 1. Calculate base damage
  const baseDamage = calculateBaseDamage(attacker.battleStats.strength, move);

  // 2. Roll for hit
  const hitChance = calculateHitChance(
    attacker.battleStats.precision,
    defender.dodgeChance,
    move.accuracyModifier,
  );
  const isHit = rollHit(hitChance);

  if (!isHit) {
    return {
      damage: 0,
      isHit: false,
      isCritical: false,
      isDodged: true,
      rawDamage: 0,
    };
  }

  // 3. Roll for critical
  const isCritical = rollCritical(attacker.criticalChance);
  let damage = baseDamage;

  // 4. Apply critical multiplier
  if (isCritical) {
    damage *= attacker.criticalDamage;
  }

  const rawDamage = Math.round(damage);

  // 5. Apply resistance
  damage *= calculateResistanceMultiplier(
    defender.resistances,
    move.damageType,
  );

  // 6. Apply endurance mitigation
  damage *= calculateEnduranceMitigation(defender.battleStats.endurance);

  // 7. Apply variance
  damage = applyVariance(damage);

  // Ensure minimum 1 damage on hit
  damage = Math.max(1, damage);

  return {
    damage: Math.round(damage),
    isHit: true,
    isCritical,
    isDodged: false,
    rawDamage,
  };
}
