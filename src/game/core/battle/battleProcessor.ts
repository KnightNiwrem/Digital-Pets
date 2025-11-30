/**
 * Battle tick processor for automatic battle phase progression.
 *
 * This module handles the "headless" battle logic - processing enemy turns
 * and turn resolution automatically, emitting events for the UI to consume.
 * The UI reacts to state changes and events rather than driving the logic.
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
  executeEnemyTurn,
  isBattleComplete,
  resolveTurnEnd,
} from "./battle";

/**
 * Process battle tick - handles automatic enemy turns and turn resolution.
 * The player turn is still handled by direct user input in the UI.
 *
 * This inverts the control flow: Logic updates first, events are emitted,
 * and the UI reacts by playing animations.
 */
export function processBattleTick(
  state: GameState,
  currentTime: number = Date.now(),
): GameState {
  if (!state.activeBattle) return state;

  const { battleState } = state.activeBattle;

  // Skip if battle is complete or waiting for player input
  if (isBattleComplete(battleState)) return state;
  if (battleState.phase === BattlePhase.PlayerTurn) return state;

  let newState = state;

  // Process enemy turn automatically
  if (battleState.phase === BattlePhase.EnemyTurn) {
    const newBattleState = executeEnemyTurn(battleState);

    // Emit enemy attack event for UI animation
    newState = emitEvent(
      {
        ...state,
        activeBattle: {
          ...state.activeBattle,
          battleState: newBattleState,
        },
      },
      createEvent<BattleActionEvent>(
        {
          type: "battleAction",
          action: "enemyAttack",
          actorName: battleState.enemy.name,
          targetName: battleState.player.name,
        },
        currentTime,
      ),
    );

    // Check if battle ended
    if (isBattleComplete(newBattleState)) {
      newState = emitBattleEndEvent(newState, newBattleState, currentTime);
    }

    return newState;
  }

  // Process turn resolution automatically
  if (battleState.phase === BattlePhase.TurnResolution) {
    const newBattleState = resolveTurnEnd(battleState);

    newState = emitEvent(
      {
        ...state,
        activeBattle: {
          ...state.activeBattle,
          battleState: newBattleState,
        },
      },
      createEvent<BattleActionEvent>(
        {
          type: "battleAction",
          action: "turnResolved",
          actorName: "system",
          message: `Turn ${battleState.turn} resolved`,
        },
        currentTime,
      ),
    );

    // Check if battle ended (from DoT damage)
    if (isBattleComplete(newBattleState)) {
      newState = emitBattleEndEvent(newState, newBattleState, currentTime);
    }

    return newState;
  }

  return state;
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
 * Process a player attack action and emit events.
 * Called directly from UI when player selects a move.
 * Returns the new state with battle updates and events.
 */
export function processPlayerAttack(
  state: GameState,
  newBattleState: BattleState,
  moveName: string,
  currentTime: number = Date.now(),
): GameState {
  if (!state.activeBattle) return state;

  let newState: GameState = {
    ...state,
    activeBattle: {
      ...state.activeBattle,
      battleState: newBattleState,
    },
  };

  // Emit player attack event
  newState = emitEvent(
    newState,
    createEvent<BattleActionEvent>(
      {
        type: "battleAction",
        action: "playerAttack",
        actorName: state.activeBattle.battleState.player.name,
        targetName: state.activeBattle.battleState.enemy.name,
        moveName,
      },
      currentTime,
    ),
  );

  // Check if battle ended
  if (isBattleComplete(newBattleState)) {
    newState = emitBattleEndEvent(newState, newBattleState, currentTime);
  }

  return newState;
}
