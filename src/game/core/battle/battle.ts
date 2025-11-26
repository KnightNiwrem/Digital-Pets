/**
 * Battle state machine for managing combat flow.
 */

import { getDefaultMoves } from "@/game/data/moves";
import { getSpeciesById } from "@/game/data/species";
import type { Move, MoveSlot } from "@/game/types/move";
import type { Pet } from "@/game/types/pet";
import type { BattleStats } from "@/game/types/stats";
import { calculateDerivedStats } from "./stats";
import {
  type Combatant,
  checkBattleEnd,
  determineTurnOrder,
  executeAction,
  processEndOfTurn,
  selectAIMove,
  type TurnAction,
} from "./turn";

export type { Combatant } from "./turn";

/**
 * Level scaling factor per level for wild combatants (10% per level).
 */
const LEVEL_SCALING_FACTOR = 0.1;

/**
 * Battle phase states.
 */
export const BattlePhase = {
  NotStarted: "notStarted",
  PlayerTurn: "playerTurn",
  EnemyTurn: "enemyTurn",
  TurnResolution: "turnResolution",
  Victory: "victory",
  Defeat: "defeat",
} as const;

export type BattlePhase = (typeof BattlePhase)[keyof typeof BattlePhase];

/**
 * A log entry for the battle.
 */
export interface BattleLogEntry {
  /** Turn number */
  turn: number;
  /** Message to display */
  message: string;
  /** Type of log entry for styling */
  type: "action" | "damage" | "effect" | "system";
}

/**
 * Complete battle state.
 */
export interface BattleState {
  /** Current battle phase */
  phase: BattlePhase;
  /** Current turn number */
  turn: number;
  /** Player combatant state */
  player: Combatant;
  /** Enemy combatant state */
  enemy: Combatant;
  /** Battle log entries */
  log: BattleLogEntry[];
  /** Turn order for current turn */
  turnOrder: ["player" | "enemy", "player" | "enemy"];
  /** Index in turn order */
  turnOrderIndex: number;
  /** Whether player has acted this turn */
  playerActed: boolean;
  /** Whether enemy has acted this turn */
  enemyActed: boolean;
}

/**
 * Battle rewards on completion.
 */
export interface BattleRewards {
  /** Currency earned */
  coins: number;
  /** Experience points (for future use) */
  experience: number;
  /** Items dropped (item ID to quantity) */
  items: { itemId: string; quantity: number }[];
}

/**
 * Create move slots from moves.
 */
function createMoveSlots(moves: Move[]): MoveSlot[] {
  return moves.map((move) => ({
    move,
    currentCooldown: 0,
  }));
}

/**
 * Create a combatant from a pet.
 */
export function createCombatantFromPet(pet: Pet, isPlayer: boolean): Combatant {
  const species = getSpeciesById(pet.identity.speciesId);
  const derivedStats = calculateDerivedStats(pet.battleStats);

  return {
    name: pet.identity.name,
    speciesId: pet.identity.speciesId,
    battleStats: pet.battleStats,
    derivedStats,
    resistances: species?.resistances ?? pet.resistances,
    statusEffects: [],
    moveSlots: createMoveSlots(getDefaultMoves()),
    isPlayer,
  };
}

/**
 * Create a wild pet combatant.
 */
export function createWildCombatant(
  speciesId: string,
  level: number,
): Combatant {
  const species = getSpeciesById(speciesId);
  if (!species) {
    throw new Error(`Unknown species: ${speciesId}`);
  }

  // Scale stats by level
  const levelMultiplier = 1 + (level - 1) * LEVEL_SCALING_FACTOR;
  const battleStats: BattleStats = {
    strength: Math.floor(species.baseStats.strength * levelMultiplier),
    endurance: Math.floor(species.baseStats.endurance * levelMultiplier),
    agility: Math.floor(species.baseStats.agility * levelMultiplier),
    precision: Math.floor(species.baseStats.precision * levelMultiplier),
    fortitude: Math.floor(species.baseStats.fortitude * levelMultiplier),
    cunning: Math.floor(species.baseStats.cunning * levelMultiplier),
  };

  const derivedStats = calculateDerivedStats(battleStats);

  return {
    name: `Wild ${species.name}`,
    speciesId,
    battleStats,
    derivedStats,
    resistances: species.resistances,
    statusEffects: [],
    moveSlots: createMoveSlots(getDefaultMoves()),
    isPlayer: false,
  };
}

/**
 * Initialize a new battle.
 */
export function initializeBattle(
  player: Combatant,
  enemy: Combatant,
): BattleState {
  const turnOrder = determineTurnOrder(player, enemy);
  const firstActor = turnOrder[0];

  return {
    phase:
      firstActor === "player" ? BattlePhase.PlayerTurn : BattlePhase.EnemyTurn,
    turn: 1,
    player,
    enemy,
    log: [
      {
        turn: 0,
        message: `Battle started! ${player.name} vs ${enemy.name}!`,
        type: "system",
      },
    ],
    turnOrder,
    turnOrderIndex: 0,
    playerActed: false,
    enemyActed: false,
  };
}

/**
 * Add log entries for an action.
 */
function addActionLogs(
  log: BattleLogEntry[],
  turn: number,
  action: TurnAction,
  actorName: string,
  targetName: string,
): BattleLogEntry[] {
  const newLogs = [...log];

  if (action.wasStunned) {
    newLogs.push({
      turn,
      message: `${actorName} is stunned and cannot act!`,
      type: "effect",
    });
    return newLogs;
  }

  // Move used
  newLogs.push({
    turn,
    message: `${actorName} used ${action.move.name}!`,
    type: "action",
  });

  // Damage result
  if (action.damageResult) {
    if (action.damageResult.isDodged) {
      newLogs.push({
        turn,
        message: `${targetName} dodged the attack!`,
        type: "damage",
      });
    } else if (action.damageResult.isHit) {
      const critText = action.damageResult.isCritical ? " Critical hit!" : "";
      newLogs.push({
        turn,
        message: `${targetName} took ${action.damageResult.damage} damage!${critText}`,
        type: "damage",
      });
    }
  }

  // Effects applied
  for (const effect of action.effectsApplied) {
    const target = action.move.effects.find((e) => e.name === effect.name)
      ?.targetsSelf
      ? actorName
      : targetName;
    newLogs.push({
      turn,
      message: `${target} is now ${effect.name}!`,
      type: "effect",
    });
  }

  // Effects resisted
  for (const effectName of action.effectsResisted) {
    newLogs.push({
      turn,
      message: `${targetName} resisted ${effectName}!`,
      type: "effect",
    });
  }

  return newLogs;
}

/**
 * Execute the player's turn.
 */
export function executePlayerTurn(state: BattleState, move: Move): BattleState {
  if (state.phase !== BattlePhase.PlayerTurn) {
    return state;
  }

  const { actor, target, action } = executeAction(
    state.player,
    state.enemy,
    move,
    "player",
  );

  const newLog = addActionLogs(
    state.log,
    state.turn,
    action,
    state.player.name,
    state.enemy.name,
  );

  // Check for battle end
  const endCheck = checkBattleEnd(actor, target);
  if (endCheck.isOver) {
    return {
      ...state,
      player: actor,
      enemy: target,
      log: [
        ...newLog,
        {
          turn: state.turn,
          message:
            endCheck.winner === "player"
              ? `${state.enemy.name} is defeated! Victory!`
              : `${state.player.name} is defeated...`,
          type: "system",
        },
      ],
      phase:
        endCheck.winner === "player" ? BattlePhase.Victory : BattlePhase.Defeat,
      playerActed: true,
    };
  }

  // Move to enemy turn
  return {
    ...state,
    player: actor,
    enemy: target,
    log: newLog,
    phase: BattlePhase.EnemyTurn,
    playerActed: true,
  };
}

/**
 * Execute the enemy's turn.
 */
export function executeEnemyTurn(state: BattleState): BattleState {
  if (state.phase !== BattlePhase.EnemyTurn) {
    return state;
  }

  const move = selectAIMove(state.enemy);
  const { actor, target, action } = executeAction(
    state.enemy,
    state.player,
    move,
    "enemy",
  );

  const newLog = addActionLogs(
    state.log,
    state.turn,
    action,
    state.enemy.name,
    state.player.name,
  );

  // Check for battle end
  const endCheck = checkBattleEnd(target, actor);
  if (endCheck.isOver) {
    return {
      ...state,
      player: target,
      enemy: actor,
      log: [
        ...newLog,
        {
          turn: state.turn,
          message:
            endCheck.winner === "player"
              ? `${state.enemy.name} is defeated! Victory!`
              : `${state.player.name} is defeated...`,
          type: "system",
        },
      ],
      phase:
        endCheck.winner === "player" ? BattlePhase.Victory : BattlePhase.Defeat,
      enemyActed: true,
    };
  }

  // Move to turn resolution
  return {
    ...state,
    player: target,
    enemy: actor,
    log: newLog,
    phase: BattlePhase.TurnResolution,
    enemyActed: true,
  };
}

/**
 * Resolve end of turn effects and start new turn.
 */
export function resolveTurnEnd(state: BattleState): BattleState {
  if (state.phase !== BattlePhase.TurnResolution) {
    return state;
  }

  // Process end of turn for both combatants
  const { combatant: playerAfter, dotDamage: playerDot } = processEndOfTurn(
    state.player,
  );
  const { combatant: enemyAfter, dotDamage: enemyDot } = processEndOfTurn(
    state.enemy,
  );

  const newLog = [...state.log];

  // Log DoT damage (generic message as multiple DoT types may be active)
  if (playerDot > 0) {
    newLog.push({
      turn: state.turn,
      message: `${state.player.name} took ${playerDot} damage over time!`,
      type: "damage",
    });
  }
  if (enemyDot > 0) {
    newLog.push({
      turn: state.turn,
      message: `${state.enemy.name} took ${enemyDot} damage over time!`,
      type: "damage",
    });
  }

  // Check for battle end after DoT
  const endCheck = checkBattleEnd(playerAfter, enemyAfter);
  if (endCheck.isOver) {
    return {
      ...state,
      player: playerAfter,
      enemy: enemyAfter,
      log: [
        ...newLog,
        {
          turn: state.turn,
          message:
            endCheck.winner === "player"
              ? `${state.enemy.name} is defeated! Victory!`
              : `${state.player.name} is defeated...`,
          type: "system",
        },
      ],
      phase:
        endCheck.winner === "player" ? BattlePhase.Victory : BattlePhase.Defeat,
    };
  }

  // Start new turn
  const newTurnOrder = determineTurnOrder(playerAfter, enemyAfter);
  const firstActor = newTurnOrder[0];

  return {
    ...state,
    player: playerAfter,
    enemy: enemyAfter,
    log: newLog,
    turn: state.turn + 1,
    phase:
      firstActor === "player" ? BattlePhase.PlayerTurn : BattlePhase.EnemyTurn,
    turnOrder: newTurnOrder,
    turnOrderIndex: 0,
    playerActed: false,
    enemyActed: false,
  };
}

/**
 * Calculate rewards for battle completion.
 */
export function calculateBattleRewards(
  state: BattleState,
  isVictory: boolean,
): BattleRewards {
  if (!isVictory) {
    return {
      coins: 0,
      experience: 0,
      items: [],
    };
  }

  // Base rewards scaled by enemy stats
  const enemyPower =
    state.enemy.battleStats.strength + state.enemy.battleStats.endurance;
  const baseCoins = Math.floor(5 + enemyPower * 0.5);

  return {
    coins: baseCoins,
    experience: Math.floor(10 + enemyPower * 0.3),
    items: [], // Items could be added based on encounter tables
  };
}

/**
 * Check if battle is complete.
 */
export function isBattleComplete(state: BattleState): boolean {
  return (
    state.phase === BattlePhase.Victory || state.phase === BattlePhase.Defeat
  );
}
