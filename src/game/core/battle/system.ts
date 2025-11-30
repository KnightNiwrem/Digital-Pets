/**
 * "Headless" Battle System implementation.
 * Encapsulates the full battle round logic, executing turns immediately
 * without waiting for UI animations.
 */

import { now } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";
import type { Move } from "@/game/types/move";
import {
  type BattleEvent,
  BattlePhase,
  type BattleState,
  executeEnemyTurn,
  executePlayerTurn,
  isBattleComplete,
  resolveTurnEnd,
} from "./battle";

/**
 * Process a full battle round starting with the player's move.
 * Executes Player Turn -> Enemy Turn -> Turn Resolution sequentially.
 *
 * @param state Current game state
 * @param playerMove The move selected by the player
 * @returns Updated game state with all round events recorded
 */
export function processBattleRound(
  state: GameState,
  playerMove: Move,
): GameState {
  if (!state.activeBattle) {
    return state;
  }

  // Monotonic counter for event ordering within this round
  let eventOrder = 0;
  const baseTime = now();
  const nextTimestamp = () => baseTime + eventOrder++;

  // 1. Player Turn
  // We start with a fresh list of round events
  let currentBattle: BattleState = {
    ...state.activeBattle.battleState,
    roundEvents: [] as BattleEvent[],
  };

  // Execute player action
  currentBattle = executePlayerTurn(currentBattle, playerMove);

  // Capture events from logs that happened during player turn
  currentBattle.roundEvents = [
    ...(currentBattle.roundEvents || []),
    {
      type: "ATTACK",
      actorId: "player",
      targetId: "enemy",
      moveName: playerMove.name,
      message: `Player used ${playerMove.name}`,
      timestamp: nextTimestamp(),
    },
  ];

  // Check if battle ended
  if (isBattleComplete(currentBattle)) {
    currentBattle.roundEvents.push({
      type: currentBattle.phase === BattlePhase.Victory ? "VICTORY" : "DEFEAT",
      actorId: "player",
      targetId: "enemy",
      message:
        currentBattle.phase === BattlePhase.Victory ? "Victory!" : "Defeat...",
      timestamp: nextTimestamp(),
    });

    return {
      ...state,
      activeBattle: {
        ...state.activeBattle,
        battleState: currentBattle,
      },
    };
  }

  // 2. Enemy Turn
  // If it's now the enemy's turn (might not be if player was stunned or turn order is weird)
  if (currentBattle.phase === BattlePhase.EnemyTurn) {
    // The enemy logic is deterministic here
    currentBattle = executeEnemyTurn(currentBattle);

    if (currentBattle.roundEvents) {
      currentBattle.roundEvents.push({
        type: "ATTACK",
        actorId: "enemy",
        targetId: "player",
        message: "Enemy attacked!",
        timestamp: nextTimestamp(),
      });
    }

    // Check termination again
    if (isBattleComplete(currentBattle) && currentBattle.roundEvents) {
      currentBattle.roundEvents.push({
        type:
          currentBattle.phase === BattlePhase.Victory ? "VICTORY" : "DEFEAT",
        actorId: "player",
        targetId: "enemy",
        message:
          currentBattle.phase === BattlePhase.Victory
            ? "Victory!"
            : "Defeat...",
        timestamp: nextTimestamp(),
      });

      return {
        ...state,
        activeBattle: {
          ...state.activeBattle,
          battleState: currentBattle,
        },
      };
    }
  }

  // 3. Turn Resolution (End of Turn Effects)
  if (currentBattle.phase === BattlePhase.TurnResolution) {
    currentBattle = resolveTurnEnd(currentBattle);

    // Add end-of-turn event
    if (currentBattle.roundEvents) {
      currentBattle.roundEvents.push({
        type: "TURN_END",
        actorId: "player",
        targetId: "enemy",
        message: "Turn ended. Effects resolved.",
        timestamp: nextTimestamp(),
      });
    }
  }

  return {
    ...state,
    activeBattle: {
      ...state.activeBattle,
      battleState: currentBattle,
    },
  };
}

/**
 * Process a flee attempt.
 */
export function processFleeAttempt(state: GameState): GameState {
  if (!state.activeBattle) return state;

  // Derive flee chance from combatant stats for determinism
  // Calculate chance based on agility ratio: player / (player + enemy)
  const playerAgility =
    state.activeBattle.battleState.player.battleStats.agility;
  const enemyAgility = state.activeBattle.battleState.enemy.battleStats.agility;

  // Avoid division by zero
  const totalAgility = playerAgility + enemyAgility;
  const fleeChance = totalAgility > 0 ? playerAgility / totalAgility : 0.5;

  // Base success on agility advantage (>= 50% relative agility)
  // This makes it deterministic: if you are faster or equal, you escape.
  // If you are slower, you fail.
  const canFlee = fleeChance >= 0.5;

  if (canFlee) {
    // End battle
    // We would need to clear activeBattle, but GameState doesn't make it nullable easily in some contexts?
    // actually GameState.activeBattle is optional.

    return {
      ...state,
      activeBattle: undefined,
      pendingEvents: [
        ...state.pendingEvents,
        {
          type: "battleFled", // Legacy event
          timestamp: now(),
        },
      ],
    };
  }

  // Failed to flee - Enemy gets a free turn!
  let currentBattle: BattleState = {
    ...state.activeBattle.battleState,
    roundEvents: [
      {
        type: "FLEE",
        actorId: "player",
        targetId: "enemy",
        message: "Failed to flee!",
        timestamp: now(),
      },
    ],
  };

  // Force phase to enemy turn if not already (it should be player turn when fleeing)
  // Avoid mutation - create new object if changing phase
  currentBattle = {
    ...currentBattle,
    phase: BattlePhase.EnemyTurn,
  };

  // Execute enemy turn
  currentBattle = executeEnemyTurn(currentBattle);

  currentBattle.roundEvents?.push({
    type: "ATTACK",
    actorId: "enemy",
    targetId: "player",
    message: "Enemy attacked fleeing player!",
    timestamp: now() + 1,
  });

  // Resolve turn
  if (currentBattle.phase === BattlePhase.TurnResolution) {
    currentBattle = resolveTurnEnd(currentBattle);
  }

  return {
    ...state,
    activeBattle: {
      ...state.activeBattle,
      battleState: currentBattle,
    },
  };
}
