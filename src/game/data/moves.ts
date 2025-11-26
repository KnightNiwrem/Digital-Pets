/**
 * Move definitions for the battle system.
 */

import { DamageType } from "@/game/types/constants";
import { type Move, MoveTarget, StatusEffectType } from "@/game/types/move";

/**
 * Basic Attack - available to all pets, no cost, no cooldown.
 */
export const basicAttack: Move = {
  id: "basic_attack",
  name: "Basic Attack",
  description: "A simple attack. Always available.",
  power: 1.0,
  flatDamage: 2,
  damageType: DamageType.Crushing,
  staminaCost: 0,
  cooldown: 0,
  accuracyModifier: 0,
  effects: [],
  target: MoveTarget.Enemy,
};

/**
 * Rest Action - skip turn to recover stamina.
 */
export const restAction: Move = {
  id: "rest",
  name: "Rest",
  description: "Skip your turn to recover stamina.",
  power: 0,
  flatDamage: 0,
  damageType: DamageType.Crushing,
  staminaCost: -20, // Negative cost = restore stamina
  cooldown: 0,
  accuracyModifier: 0,
  effects: [],
  target: MoveTarget.Self,
};

/**
 * Default moves all pets have access to.
 */
export const DEFAULT_MOVES: Move[] = [basicAttack, restAction];

/**
 * Quick Strike - fast attack with bonus accuracy.
 */
export const quickStrike: Move = {
  id: "quick_strike",
  name: "Quick Strike",
  description: "A swift attack that rarely misses.",
  power: 0.8,
  flatDamage: 1,
  damageType: DamageType.Slashing,
  staminaCost: 8,
  cooldown: 0,
  accuracyModifier: 15,
  effects: [],
  target: MoveTarget.Enemy,
};

/**
 * Power Slam - heavy attack with high damage.
 */
export const powerSlam: Move = {
  id: "power_slam",
  name: "Power Slam",
  description: "A powerful crushing blow that deals massive damage.",
  power: 1.8,
  flatDamage: 5,
  damageType: DamageType.Crushing,
  staminaCost: 15,
  cooldown: 2,
  accuracyModifier: -10,
  effects: [],
  target: MoveTarget.Enemy,
};

/**
 * Venom Bite - deals poison damage over time.
 */
export const venomBite: Move = {
  id: "venom_bite",
  name: "Venom Bite",
  description: "A bite that injects poison, dealing damage over time.",
  power: 0.7,
  flatDamage: 2,
  damageType: DamageType.Piercing,
  staminaCost: 12,
  cooldown: 3,
  accuracyModifier: 0,
  effects: [
    {
      type: StatusEffectType.DamageOverTime,
      name: "Poison",
      value: 5,
      duration: 3,
      applyChance: 0.6,
      targetsSelf: false,
      damageType: DamageType.Chemical,
    },
  ],
  target: MoveTarget.Enemy,
};

/**
 * Thunder Jolt - electric attack that can stun.
 */
export const thunderJolt: Move = {
  id: "thunder_jolt",
  name: "Thunder Jolt",
  description: "An electric shock that may stun the target.",
  power: 1.0,
  flatDamage: 3,
  damageType: DamageType.Electric,
  staminaCost: 14,
  cooldown: 2,
  accuracyModifier: 0,
  effects: [
    {
      type: StatusEffectType.Stun,
      name: "Stunned",
      value: 0,
      duration: 1,
      applyChance: 0.25,
      targetsSelf: false,
    },
  ],
  target: MoveTarget.Enemy,
};

/**
 * Harden - defensive buff that increases endurance.
 */
export const harden: Move = {
  id: "harden",
  name: "Harden",
  description: "Toughen your body to reduce incoming damage.",
  power: 0,
  flatDamage: 0,
  damageType: DamageType.Crushing,
  staminaCost: 10,
  cooldown: 3,
  accuracyModifier: 0,
  effects: [
    {
      type: StatusEffectType.StatBuff,
      name: "Hardened",
      stat: "endurance",
      value: 30, // 30% increase
      duration: 3,
      applyChance: 1.0,
      targetsSelf: true,
    },
  ],
  target: MoveTarget.Self,
};

/**
 * Intimidate - debuff that reduces enemy strength.
 */
export const intimidate: Move = {
  id: "intimidate",
  name: "Intimidate",
  description: "Strike fear into your opponent, reducing their attack power.",
  power: 0.5,
  flatDamage: 0,
  damageType: DamageType.Crushing,
  staminaCost: 12,
  cooldown: 4,
  accuracyModifier: 5,
  effects: [
    {
      type: StatusEffectType.StatDebuff,
      name: "Intimidated",
      stat: "strength",
      value: 25, // 25% decrease
      duration: 2,
      applyChance: 0.8,
      targetsSelf: false,
    },
  ],
  target: MoveTarget.Enemy,
};

/**
 * Heat Wave - thermal area damage.
 */
export const heatWave: Move = {
  id: "heat_wave",
  name: "Heat Wave",
  description: "Unleash a wave of scorching heat.",
  power: 1.2,
  flatDamage: 4,
  damageType: DamageType.Thermal,
  staminaCost: 18,
  cooldown: 3,
  accuracyModifier: -5,
  effects: [],
  target: MoveTarget.Enemy,
};

/**
 * All learnable moves (excluding default moves).
 */
export const LEARNABLE_MOVES: Move[] = [
  quickStrike,
  powerSlam,
  venomBite,
  thunderJolt,
  harden,
  intimidate,
  heatWave,
];

/**
 * All moves in the game.
 */
export const ALL_MOVES: Move[] = [...DEFAULT_MOVES, ...LEARNABLE_MOVES];

/**
 * Get a move by ID.
 */
export function getMoveById(id: string): Move | undefined {
  return ALL_MOVES.find((move) => move.id === id);
}

/**
 * Get default moves for new pets.
 */
export function getDefaultMoves(): Move[] {
  return [...DEFAULT_MOVES];
}
