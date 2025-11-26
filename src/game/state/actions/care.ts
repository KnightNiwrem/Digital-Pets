/**
 * Care state actions for feeding, watering, and cleaning.
 */

import { useCleaningItem, useDrinkItem, useFoodItem } from "@/game/core/items";
import type { GameState } from "@/game/types/gameState";

/**
 * Result of a care action.
 */
export interface CareActionResult {
  success: boolean;
  state: GameState;
  message: string;
}

/**
 * Feed the pet with the specified food item.
 */
export function feedPet(state: GameState, itemId: string): CareActionResult {
  return useFoodItem(state, itemId);
}

/**
 * Give the pet water with the specified drink item.
 */
export function waterPet(state: GameState, itemId: string): CareActionResult {
  return useDrinkItem(state, itemId);
}

/**
 * Clean the pet with the specified cleaning item.
 */
export function cleanPet(state: GameState, itemId: string): CareActionResult {
  return useCleaningItem(state, itemId);
}
