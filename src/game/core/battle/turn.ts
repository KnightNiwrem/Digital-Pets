/**
 * Turn order and action resolution for the battle system.
 */

import type { Move, MoveSlot, StatusEffect } from "@/game/types/move";
import type {
  BattleStats,
  DamageResistances,
  DerivedBattleStats,
} from "@/game/types/stats";
import { calculateDamage, type DamageResult } from "./damage";
import { calculateStaminaRegen } from "./stats";
import {
  applyMoveEffect,
  calculateEffectiveStats,
  isStunned,
  processStatusEffects,
} from "./status";

/**
 * Combatant state during battle.
 */
export interface Combatant {
  /** Display name */
  name: string;
  /** Species ID for lookups */
  speciesId: string;
  /** Base battle stats */
  battleStats: BattleStats;
  /** Derived stats (health, stamina, etc.) */
  derivedStats: DerivedBattleStats;
  /** Damage resistances */
  resistances: DamageResistances;
  /** Active status effects */
  statusEffects: StatusEffect[];
  /** Available moves */
  moveSlots: MoveSlot[];
  /** Whether this is the player's pet */
  isPlayer: boolean;
}

/**
 * Action taken during a turn.
 */
export interface TurnAction {
  /** The combatant taking the action */
  actor: "player" | "enemy";
  /** The move used */
  move: Move;
  /** Damage result (if attacking) */
  damageResult?: DamageResult;
  /** Status effects applied */
  effectsApplied: StatusEffect[];
  /** Effects that were resisted */
  effectsResisted: string[];
  /** Whether the actor was stunned */
  wasStunned: boolean;
  /** DoT damage taken at end of turn */
  dotDamage: number;
}

/**
 * Determine turn order based on initiative.
 */
export function determineTurnOrder(
  player: Combatant,
  enemy: Combatant,
): ["player" | "enemy", "player" | "enemy"] {
  const playerInit = player.derivedStats.initiative;
  const enemyInit = enemy.derivedStats.initiative;

  if (playerInit >= enemyInit) {
    return ["player", "enemy"];
  }
  return ["enemy", "player"];
}

/**
 * Check if a move can be used.
 */
export function canUseMove(
  combatant: Combatant,
  moveSlot: MoveSlot,
): { canUse: boolean; reason?: string } {
  if (moveSlot.currentCooldown > 0) {
    return { canUse: false, reason: "On cooldown" };
  }

  const staminaCost = moveSlot.move.staminaCost;
  if (staminaCost > 0 && combatant.derivedStats.currentStamina < staminaCost) {
    return { canUse: false, reason: "Not enough stamina" };
  }

  return { canUse: true };
}

/**
 * Get available moves for a combatant.
 */
export function getAvailableMoves(combatant: Combatant): MoveSlot[] {
  return combatant.moveSlots.filter(
    (slot) => canUseMove(combatant, slot).canUse,
  );
}

/**
 * Execute a single combatant's action.
 */
export function executeAction(
  actor: Combatant,
  target: Combatant,
  move: Move,
  actorId: "player" | "enemy",
): { actor: Combatant; target: Combatant; action: TurnAction } {
  const action: TurnAction = {
    actor: actorId,
    move,
    effectsApplied: [],
    effectsResisted: [],
    wasStunned: false,
    dotDamage: 0,
  };

  // Check if stunned
  if (isStunned(actor.statusEffects)) {
    action.wasStunned = true;
    return { actor, target, action };
  }

  // Apply stamina cost
  const updatedActorStats = {
    ...actor.derivedStats,
    currentStamina: Math.max(
      0,
      Math.min(
        actor.derivedStats.maxStamina,
        actor.derivedStats.currentStamina - move.staminaCost,
      ),
    ),
  };

  // Calculate damage if attacking
  if (move.target === "enemy" && move.power > 0) {
    const effectiveActorStats = calculateEffectiveStats(
      actor.battleStats,
      actor.statusEffects,
    );
    const effectiveTargetStats = calculateEffectiveStats(
      target.battleStats,
      target.statusEffects,
    );

    const damageResult = calculateDamage(
      {
        battleStats: effectiveActorStats,
        criticalChance: actor.derivedStats.criticalChance,
        criticalDamage: actor.derivedStats.criticalDamage,
      },
      {
        battleStats: effectiveTargetStats,
        resistances: target.resistances,
        dodgeChance: target.derivedStats.dodgeChance,
      },
      move,
    );

    action.damageResult = damageResult;

    // Apply damage to target
    target = {
      ...target,
      derivedStats: {
        ...target.derivedStats,
        currentHealth: Math.max(
          0,
          target.derivedStats.currentHealth - damageResult.damage,
        ),
      },
    };
  }

  // Apply status effects
  for (const effect of move.effects) {
    const targetCombatant = effect.targetsSelf ? actor : target;
    const appliedEffect = applyMoveEffect(
      effect,
      targetCombatant.battleStats.fortitude,
    );

    if (appliedEffect) {
      action.effectsApplied.push(appliedEffect);
      if (effect.targetsSelf) {
        actor = {
          ...actor,
          statusEffects: [...actor.statusEffects, appliedEffect],
        };
      } else {
        target = {
          ...target,
          statusEffects: [...target.statusEffects, appliedEffect],
        };
      }
    } else if (!effect.targetsSelf) {
      action.effectsResisted.push(effect.name);
    }
  }

  // Update move cooldown
  const updatedMoveSlots = actor.moveSlots.map((slot) =>
    slot.move.id === move.id
      ? { ...slot, currentCooldown: move.cooldown }
      : slot,
  );

  actor = {
    ...actor,
    derivedStats: updatedActorStats,
    moveSlots: updatedMoveSlots,
  };

  return { actor, target, action };
}

/**
 * Process end of turn for a combatant.
 */
export function processEndOfTurn(combatant: Combatant): {
  combatant: Combatant;
  dotDamage: number;
} {
  // Process status effects
  const { effects, dotDamage } = processStatusEffects(combatant.statusEffects);

  // Apply DoT damage
  const newHealth = Math.max(
    0,
    combatant.derivedStats.currentHealth - dotDamage,
  );

  // Regenerate stamina
  const staminaRegen = calculateStaminaRegen(combatant.derivedStats.maxStamina);
  const newStamina = Math.min(
    combatant.derivedStats.maxStamina,
    combatant.derivedStats.currentStamina + staminaRegen,
  );

  // Reduce cooldowns
  const updatedMoveSlots = combatant.moveSlots.map((slot) => ({
    ...slot,
    currentCooldown: Math.max(0, slot.currentCooldown - 1),
  }));

  return {
    combatant: {
      ...combatant,
      statusEffects: effects,
      derivedStats: {
        ...combatant.derivedStats,
        currentHealth: newHealth,
        currentStamina: newStamina,
      },
      moveSlots: updatedMoveSlots,
    },
    dotDamage,
  };
}

/**
 * Check for battle end condition.
 */
export function checkBattleEnd(
  player: Combatant,
  enemy: Combatant,
): { isOver: boolean; winner?: "player" | "enemy" } {
  if (player.derivedStats.currentHealth <= 0) {
    return { isOver: true, winner: "enemy" };
  }
  if (enemy.derivedStats.currentHealth <= 0) {
    return { isOver: true, winner: "player" };
  }
  return { isOver: false };
}

/**
 * Select an AI move for the enemy.
 */
export function selectAIMove(enemy: Combatant): Move {
  const available = getAvailableMoves(enemy);

  if (available.length === 0) {
    // Fallback to basic attack (should always be available)
    const firstMove = enemy.moveSlots[0]?.move;
    if (firstMove) return firstMove;
    throw new Error("Enemy has no moves available");
  }

  // Simple AI: prioritize high damage moves, but use buffs/debuffs occasionally
  const damageableMoves = available.filter(
    (slot) => slot.move.power > 0 && slot.move.target === "enemy",
  );
  const supportMoves = available.filter((slot) => slot.move.effects.length > 0);

  // 30% chance to use a support move if available
  if (supportMoves.length > 0 && Math.random() < 0.3) {
    const index = Math.floor(Math.random() * supportMoves.length);
    const move = supportMoves[index]?.move;
    if (move) return move;
  }

  // Otherwise use highest power attack
  if (damageableMoves.length > 0) {
    damageableMoves.sort((a, b) => b.move.power - a.move.power);
    const move = damageableMoves[0]?.move;
    if (move) return move;
  }

  // Fallback to first available
  const firstAvailable = available[0]?.move;
  if (firstAvailable) return firstAvailable;
  throw new Error("No available moves for AI");
}
