/**
 * Exploration state actions.
 * Provides high-level state action handlers for the exploration system.
 */

import {
  cancelExploration as cancelExplorationCore,
  canStartExplorationActivity,
  startExplorationActivity,
} from "@/game/core/exploration/exploration";
import type { ExplorationDrop } from "@/game/types/activity";
import type { Tick } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";

/**
 * Result of an exploration action.
 */
export interface ExplorationActionResult {
  success: boolean;
  state: GameState;
  message: string;
  itemsFound?: ExplorationDrop[];
  xpGained?: number;
  leveledUp?: boolean;
}

/**
 * Start an exploration activity at the specified location.
 */
export function startExploration(
  state: GameState,
  locationId: string,
  activityId: string,
  currentTick: Tick,
): ExplorationActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet.",
    };
  }

  // Get completed quest IDs for requirement checking
  const completedQuestIds = state.quests
    .filter((q) => q.state === "completed")
    .map((q) => q.questId);

  // Attempt to start the exploration
  const result = startExplorationActivity(
    state.pet,
    state.player.skills,
    completedQuestIds,
    locationId,
    activityId,
    currentTick,
  );

  if (!result.success) {
    return {
      success: false,
      state,
      message: result.message ?? "Failed to start exploration.",
    };
  }

  return {
    success: true,
    state: {
      ...state,
      pet: result.pet,
    },
    message: `Started exploration at ${locationId}.`,
  };
}

/**
 * Check if an exploration activity can be started.
 */
export function canStartExploration(
  state: GameState,
  locationId: string,
  activityId: string,
  currentTick: Tick,
): { canStart: boolean; reason?: string } {
  if (!state.pet) {
    return { canStart: false, reason: "No pet." };
  }

  // Get completed quest IDs for requirement checking
  const completedQuestIds = state.quests
    .filter((q) => q.state === "completed")
    .map((q) => q.questId);

  return canStartExplorationActivity(
    state.pet,
    state.player.skills,
    completedQuestIds,
    locationId,
    activityId,
    currentTick,
  );
}

/**
 * Cancel the current exploration session.
 * Energy is fully refunded as per the spec.
 */
export function cancelExploration(state: GameState): ExplorationActionResult {
  if (!state.pet) {
    return {
      success: false,
      state,
      message: "No pet.",
    };
  }

  if (!state.pet.activeExploration) {
    return {
      success: false,
      state,
      message: "No exploration to cancel.",
    };
  }

  const result = cancelExplorationCore(state.pet);

  return {
    success: true,
    state: {
      ...state,
      pet: result.pet,
    },
    message: result.message,
  };
}
