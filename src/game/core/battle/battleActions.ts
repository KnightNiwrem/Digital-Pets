/**
 * Battle action types for the action-dispatch pattern.
 *
 * Actions represent user intent - the UI dispatches these,
 * and the game engine processes them to produce new state.
 * This decouples the UI from the battle logic.
 */

/**
 * Player attack action - dispatched when player selects a move.
 */
export interface BattlePlayerAttackAction {
  type: "BATTLE_PLAYER_ATTACK";
  payload: {
    moveName: string;
  };
}

/**
 * Union type of all battle actions.
 */
export type BattleAction = BattlePlayerAttackAction;
