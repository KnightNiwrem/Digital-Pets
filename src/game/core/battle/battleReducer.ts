/**
 * Battle reducer for processing battle actions.
 *
 * This module implements the action-dispatch pattern, decoupling
 * battle logic from the UI layer. The reducer processes actions
 * dispatched by the UI and returns the new game state.
 *
 * The UI knows NOTHING about game rules/math - it simply expresses
 * intent via actions, and this reducer handles the logic.
 */

import { emitEvent } from "@/game/core/events";
import {
  type BattleActionEvent,
  type BattleEndEvent,
  createEvent,
} from "@/game/types/event";
import type { GameState } from "@/game/types/gameState";
import {
  BattlePhase,
  type BattleState,
  executePlayerTurn,
  isBattleComplete,
} from "./battle";
import type { BattleAction } from "./battleActions";

/**
 * Update the battle state within the game state.
 */
function updateBattleState(
  state: GameState,
  newBattleState: BattleState,
): GameState {
  if (!state.activeBattle) return state;
  return {
    ...state,
    activeBattle: {
      ...state.activeBattle,
      battleState: newBattleState,
    },
  };
}

/**
 * Get a move by name from a combatant's move slots.
 */
function getMoveByName(
  battleState: BattleState,
  moveName: string,
): BattleState["player"]["moveSlots"][number]["move"] | undefined {
  const moveSlot = battleState.player.moveSlots.find(
    (slot) => slot.move.name === moveName,
  );
  return moveSlot?.move;
}

/**
 * Emit a battle end event.
 */
function emitBattleEndEvent(
  state: GameState,
  battleState: BattleState,
  currentTime: number,
): GameState {
  const isVictory = battleState.phase === BattlePhase.Victory;
  return emitEvent(
    state,
    createEvent<BattleEndEvent>(
      {
        type: "battleEnd",
        isVictory,
        playerName: battleState.player.name,
        enemyName: battleState.enemy.name,
      },
      currentTime,
    ),
  );
}

/**
 * Process a player attack action.
 * Executes the move and emits appropriate events.
 */
function processPlayerAttackAction(
  state: GameState,
  moveName: string,
  currentTime: number,
): GameState {
  if (!state.activeBattle) return state;

  const { battleState } = state.activeBattle;

  // Validate it's the player's turn
  if (battleState.phase !== BattlePhase.PlayerTurn) {
    return state;
  }

  // Get the move by name
  const move = getMoveByName(battleState, moveName);
  if (!move) {
    console.warn(`Move not found: ${moveName}`);
    return state;
  }

  // Execute the turn
  const newBattleState = executePlayerTurn(battleState, move);

  // Update state with new battle state
  let newState = updateBattleState(state, newBattleState);

  // Emit battle action event
  newState = emitEvent(
    newState,
    createEvent<BattleActionEvent>(
      {
        type: "battleAction",
        action: "playerAttack",
        actorName: battleState.player.name,
        targetName: battleState.enemy.name,
        moveName,
      },
      currentTime,
    ),
  );

  // Check if battle ended and emit end event if so
  if (isBattleComplete(newBattleState)) {
    newState = emitBattleEndEvent(newState, newBattleState, currentTime);
  }

  return newState;
}

/**
 * Battle reducer - processes battle actions and returns new game state.
 * This runs purely in the engine domain, decoupled from the UI.
 */
export function battleReducer(
  state: GameState,
  action: BattleAction,
  currentTime: number = Date.now(),
): GameState {
  switch (action.type) {
    case "BATTLE_PLAYER_ATTACK":
      return processPlayerAttackAction(
        state,
        action.payload.moveName,
        currentTime,
      );
    default:
      return state;
  }
}
