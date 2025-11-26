/**
 * Move and status effect types for the battle system.
 */

import type { DamageType } from "./constants";
import type { BattleStats } from "./stats";

/**
 * Status effect types that can be applied in battle.
 */
export const StatusEffectType = {
  StatBuff: "statBuff",
  StatDebuff: "statDebuff",
  DamageOverTime: "damageOverTime",
  Stun: "stun",
} as const;

export type StatusEffectType =
  (typeof StatusEffectType)[keyof typeof StatusEffectType];

/**
 * A status effect applied during battle.
 */
export interface StatusEffect {
  /** Unique identifier for this effect instance */
  id: string;
  /** Type of effect */
  type: StatusEffectType;
  /** Display name */
  name: string;
  /** Affected stat (for buff/debuff) */
  stat?: keyof BattleStats;
  /** Modifier value (percentage for buffs/debuffs, flat damage for DoT) */
  value: number;
  /** Turns remaining */
  duration: number;
  /** Damage type for DoT effects */
  damageType?: DamageType;
}

/**
 * Effect definition within a move (before application).
 */
export interface MoveEffect {
  /** Type of effect */
  type: StatusEffectType;
  /** Display name */
  name: string;
  /** Affected stat (for buff/debuff) */
  stat?: keyof BattleStats;
  /** Modifier value */
  value: number;
  /** Duration in turns */
  duration: number;
  /** Chance to apply (0-1) */
  applyChance: number;
  /** Whether this effect targets self (true) or enemy (false) */
  targetsSelf: boolean;
  /** Damage type for DoT effects */
  damageType?: DamageType;
}

/**
 * Move target type.
 */
export const MoveTarget = {
  Enemy: "enemy",
  Self: "self",
} as const;

export type MoveTarget = (typeof MoveTarget)[keyof typeof MoveTarget];

/**
 * A battle move that can be used by a pet.
 */
export interface Move {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Move description */
  description: string;
  /** Damage multiplier based on Strength */
  power: number;
  /** Flat damage added to base damage */
  flatDamage: number;
  /** Type of damage dealt */
  damageType: DamageType;
  /** Stamina cost to use */
  staminaCost: number;
  /** Cooldown in turns before reuse */
  cooldown: number;
  /** Accuracy modifier (added to hit chance) */
  accuracyModifier: number;
  /** Status effects this move can apply */
  effects: MoveEffect[];
  /** Target of the move */
  target: MoveTarget;
}

/**
 * Move slot state during battle (tracks cooldowns).
 */
export interface MoveSlot {
  /** The move in this slot */
  move: Move;
  /** Remaining cooldown (0 = ready to use) */
  currentCooldown: number;
}

/**
 * Default number of move slots a pet has.
 */
export const DEFAULT_MOVE_SLOTS = 4;

/**
 * Generate a unique status effect ID.
 */
export function createStatusEffectId(): string {
  return `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
