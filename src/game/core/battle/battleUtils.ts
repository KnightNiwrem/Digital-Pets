/**
 * Shared battle utility functions.
 *
 * These helpers are used by both battleProcessor and battleReducer
 * to maintain DRY principles and ensure consistency.
 */

import { emitEvent } from "@/game/core/events";
import { type BattleEndEvent, createEvent } from "@/game/types/event";
import type { GameState } from "@/game/types/gameState";
import { BattlePhase, type BattleState } from "./battle";

/**
 * Update the battle state within the game state.
 */
export function updateBattleState(
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
 * Emit a battle end event.
 */
export function emitBattleEndEvent(
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
