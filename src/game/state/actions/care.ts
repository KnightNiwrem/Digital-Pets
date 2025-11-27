/**
 * Care state actions for feeding, watering, cleaning, and playing.
 */

import {
  useCleaningItem,
  useDrinkItem,
  useFoodItem,
  useToyItem,
} from "@/game/core/items";
import { updateQuestProgress } from "@/game/core/quests/quests";
import type { GameState } from "@/game/types/gameState";
import { ObjectiveType } from "@/game/types/quest";

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
  const result = useFoodItem(state, itemId);
  if (result.success) {
    return {
      ...result,
      state: updateQuestProgress(result.state, ObjectiveType.Care, "feed"),
    };
  }
  return result;
}

/**
 * Give the pet water with the specified drink item.
 */
export function waterPet(state: GameState, itemId: string): CareActionResult {
  const result = useDrinkItem(state, itemId);
  if (result.success) {
    return {
      ...result,
      state: updateQuestProgress(result.state, ObjectiveType.Care, "water"),
    };
  }
  return result;
}

/**
 * Clean the pet with the specified cleaning item.
 */
export function cleanPet(state: GameState, itemId: string): CareActionResult {
  const result = useCleaningItem(state, itemId);
  if (result.success) {
    return {
      ...result,
      state: updateQuestProgress(result.state, ObjectiveType.Care, "clean"),
    };
  }
  return result;
}

/**
 * Play with the pet using the specified toy item.
 */
export function playWithPet(
  state: GameState,
  itemId: string,
): CareActionResult {
  const result = useToyItem(state, itemId);
  if (result.success) {
    return {
      ...result,
      state: updateQuestProgress(result.state, ObjectiveType.Care, "play"),
    };
  }
  return result;
}
