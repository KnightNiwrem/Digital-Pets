/**
 * Inventory state actions for adding and removing items.
 */

import { addItem, removeItem } from "@/game/core/inventory";
import type { GameState } from "@/game/types/gameState";

/**
 * Add an item to the player's inventory.
 */
export function addItemToInventory(
  state: GameState,
  itemId: string,
  quantity = 1,
  currentDurability: number | null = null,
): GameState {
  const newInventory = addItem(
    state.player.inventory,
    itemId,
    quantity,
    currentDurability,
  );

  return {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
    },
  };
}

/**
 * Remove an item from the player's inventory.
 */
export function removeItemFromInventory(
  state: GameState,
  itemId: string,
  quantity = 1,
): GameState {
  const newInventory = removeItem(state.player.inventory, itemId, quantity);

  return {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
    },
  };
}
