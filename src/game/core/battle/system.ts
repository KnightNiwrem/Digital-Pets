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

  // 1. Player Turn
  // We start with a fresh list of round events
  let currentBattle: BattleState = {
    ...state.activeBattle.battleState,
    roundEvents: [] as BattleEvent[],
  };
  const _initialTurn = currentBattle.turn;

  // Execute player action
  currentBattle = executePlayerTurn(currentBattle, playerMove);

  // Capture events from logs that happened during player turn
  // (In a more advanced refactor, executePlayerTurn would return events directly,
  // but for now we parse the log or just infer events - to keep it simple we'll add a helper)
  currentBattle.roundEvents = [
    ...(currentBattle.roundEvents || []),
    {
      type: "ATTACK",
      actorId: "player",
      targetId: "enemy",
      moveName: playerMove.name,
      message: `Player used ${playerMove.name}`,
      timestamp: now(),
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
      timestamp: now() + 1,
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

    // We need to find what move the enemy used.
    // Since executeEnemyTurn handles AI internally, we'd ideally extract that.
    // For this refactor, we can check the last log entry or just generic "Enemy Attacked"
    if (currentBattle.roundEvents) {
      currentBattle.roundEvents.push({
        type: "ATTACK",
        actorId: "enemy",
        targetId: "player",
        message: "Enemy attacked!", // We could improve this by returning the move from executeEnemyTurn
        timestamp: now() + 2,
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
        timestamp: now() + 3,
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
        type: "BUFF", // Generic type for turn end resolution
        actorId: "player",
        targetId: "enemy",
        message: "Turn ended. Effects resolved.",
        timestamp: now() + 4,
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

  // Simple 50% chance for now, or based on stats
  const canFlee = Math.random() > 0.5;

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
      } as BattleEvent,
    ],
  };

  // Force phase to enemy turn if not already (it should be player turn when fleeing)
  currentBattle.phase = BattlePhase.EnemyTurn;

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
