/**
 * Status effect processing for the battle system.
 */

import {
  createStatusEffectId,
  type MoveEffect,
  type StatusEffect,
  StatusEffectType,
} from "@/game/types/move";
import type { BattleStats } from "@/game/types/stats";

/**
 * Status resistance bonus per point of Fortitude (%).
 */
const FORTITUDE_RESIST_BONUS = 1.5;

/**
 * Apply a status effect from a move effect definition.
 * Returns the created StatusEffect or null if resisted.
 */
export function applyMoveEffect(
  effect: MoveEffect,
  targetFortitude: number,
): StatusEffect | null {
  // Roll for application
  if (Math.random() > effect.applyChance) {
    return null;
  }

  // Roll for resistance (only for debuffs and DoT)
  if (
    effect.type === StatusEffectType.StatDebuff ||
    effect.type === StatusEffectType.DamageOverTime ||
    effect.type === StatusEffectType.Stun
  ) {
    const resistChance = (targetFortitude * FORTITUDE_RESIST_BONUS) / 100;
    if (Math.random() < resistChance) {
      return null; // Resisted
    }
  }

  return {
    id: createStatusEffectId(),
    type: effect.type,
    name: effect.name,
    stat: effect.stat,
    value: effect.value,
    duration: effect.duration,
    damageType: effect.damageType,
  };
}

/**
 * Process status effects at end of turn.
 * Returns updated effects array and damage taken from DoT.
 */
export function processStatusEffects(effects: StatusEffect[]): {
  effects: StatusEffect[];
  dotDamage: number;
} {
  let dotDamage = 0;

  const remainingEffects = effects
    .map((effect) => {
      // Process DoT damage
      if (effect.type === StatusEffectType.DamageOverTime) {
        dotDamage += effect.value;
      }

      // Reduce duration
      return {
        ...effect,
        duration: effect.duration - 1,
      };
    })
    .filter((effect) => effect.duration > 0);

  return { effects: remainingEffects, dotDamage };
}

/**
 * Check if a combatant is stunned.
 */
export function isStunned(effects: StatusEffect[]): boolean {
  return effects.some((effect) => effect.type === StatusEffectType.Stun);
}

/**
 * Calculate effective battle stats with buff/debuff modifiers.
 */
export function calculateEffectiveStats(
  baseStats: BattleStats,
  effects: StatusEffect[],
): BattleStats {
  const effectiveStats = { ...baseStats };

  for (const effect of effects) {
    if (
      (effect.type === StatusEffectType.StatBuff ||
        effect.type === StatusEffectType.StatDebuff) &&
      effect.stat
    ) {
      const currentValue = effectiveStats[effect.stat];
      const modifier = effect.value / 100;
      const multiplier =
        effect.type === StatusEffectType.StatBuff ? 1 + modifier : 1 - modifier;
      effectiveStats[effect.stat] = Math.max(
        1,
        Math.floor(currentValue * multiplier),
      );
    }
  }

  return effectiveStats;
}

/**
 * Get buff/debuff summary for display.
 */
export function getEffectSummary(effects: StatusEffect[]): {
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  other: StatusEffect[];
} {
  const buffs: StatusEffect[] = [];
  const debuffs: StatusEffect[] = [];
  const other: StatusEffect[] = [];

  for (const effect of effects) {
    if (effect.type === StatusEffectType.StatBuff) {
      buffs.push(effect);
    } else if (
      effect.type === StatusEffectType.StatDebuff ||
      effect.type === StatusEffectType.DamageOverTime
    ) {
      debuffs.push(effect);
    } else {
      other.push(effect);
    }
  }

  return { buffs, debuffs, other };
}
