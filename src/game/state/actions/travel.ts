/**
 * Travel state actions.
 */

import { canTravel, travel as travelCore } from "@/game/core/travel";
import type { GameState } from "@/game/types/gameState";

/**
 * Result of a travel action.
 */
export interface TravelActionResult {
  success: boolean;
  state: GameState;
  message: string;
}

/**
 * Travel to a new location.
 */
export function travelToLocation(
  state: GameState,
  destinationId: string,
): TravelActionResult {
  return travelCore(state, destinationId);
}

/**
 * Check if travel is possible without executing it.
 */
export function checkCanTravel(
  state: GameState,
  destinationId: string,
): { canTravel: boolean; message: string; energyCost?: number } {
  const result = canTravel(state, destinationId);
  return {
    canTravel: result.success,
    message: result.message,
    energyCost: result.energyCost,
  };
}
