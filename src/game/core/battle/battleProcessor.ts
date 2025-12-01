/**
 * Battle tick processor for automatic battle phase progression.
 *
 * This module handles the "headless" battle logic - processing enemy turns
 * and turn resolution automatically, emitting events for the UI to consume.
 * The UI reacts to state changes and events rather than driving the logic.
 */

import { emitEvent } from "@/game/core/events";
import { type BattleActionEvent, createEvent } from "@/game/types/event";
import type { GameState } from "@/game/types/gameState";
import {
  BattlePhase,
  type BattleState,
  executeEnemyTurn,
  isBattleComplete,
  resolveTurnEnd,
} from "./battle";
import { emitBattleEndEvent, updateBattleState } from "./battleUtils";

/**
 * Emit a battle action event and check for battle completion.
 * Returns the updated state with events emitted.
 */
function emitBattleAction(
  state: GameState,
  newBattleState: BattleState,
  event: Omit<BattleActionEvent, "timestamp" | "type">,
  currentTime: number,
): GameState {
  let newState = emitEvent(
    updateBattleState(state, newBattleState),
    createEvent<BattleActionEvent>(
      { type: "battleAction", ...event },
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

  // Process enemy turn automatically
  if (battleState.phase === BattlePhase.EnemyTurn) {
    const newBattleState = executeEnemyTurn(battleState);
    return emitBattleAction(
      state,
      newBattleState,
      {
        action: "enemyAttack",
        actorName: battleState.enemy.name,
        targetName: battleState.player.name,
      },
      currentTime,
    );
  }

  // Process turn resolution automatically
  if (battleState.phase === BattlePhase.TurnResolution) {
    const newBattleState = resolveTurnEnd(battleState);
    return emitBattleAction(
      state,
      newBattleState,
      {
        action: "turnResolved",
        actorName: "system",
        message: `Turn ${battleState.turn} resolved`,
      },
      currentTime,
    );
  }

  return state;
}
