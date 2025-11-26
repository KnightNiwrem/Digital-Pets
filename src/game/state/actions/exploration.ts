/**
 * Exploration state actions.
 */

import {
  cancelExploration as cancelExplorationCore,
  startForaging as startForagingCore,
} from "@/game/core/exploration/forage";
import { addItem } from "@/game/core/inventory";
import type { ExplorationDrop, ExplorationResult } from "@/game/types/activity";
import type { GameState } from "@/game/types/gameState";

/**
 * Result of an exploration action.
 */
export interface ExplorationActionResult {
  success: boolean;
  state: GameState;
  message: string;
  itemsFound?: ExplorationDrop[];
}

/**
 * Start a foraging session at the current location.
 */
export function startForaging(state: GameState): ExplorationActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet to explore with.",
    };
  }

  const result = startForagingCore(
    state.pet,
    state.player.currentLocationId,
    state.totalTicks,
  );

  return {
    success: result.success,
    state: {
      ...state,
      pet: result.pet,
    },
    message: result.message,
  };
}

/**
 * Cancel the current exploration session.
 */
export function cancelExploration(state: GameState): ExplorationActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet.",
    };
  }

  const result = cancelExplorationCore(state.pet);

  return {
    success: result.success,
    state: {
      ...state,
      pet: result.pet,
    },
    message: result.message,
  };
}

/**
 * Apply exploration results to game state (called when exploration completes).
 * Adds found items to inventory.
 */
export function applyExplorationResults(
  state: GameState,
  result: ExplorationResult,
): GameState {
  if (!result.success || result.itemsFound.length === 0) {
    return state;
  }

  // Add each found item to inventory
  let currentInventory = state.player.inventory;

  for (const drop of result.itemsFound) {
    currentInventory = addItem(currentInventory, drop.itemId, drop.quantity);
  }

  return {
    ...state,
    player: {
      ...state.player,
      inventory: currentInventory,
    },
  };
}
