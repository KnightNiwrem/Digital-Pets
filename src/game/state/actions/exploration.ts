/**
 * Exploration state actions.
 */

import {
  cancelExploration as cancelExplorationCore,
  startForaging as startForagingCore,
} from "@/game/core/exploration/forage";
import { addItem } from "@/game/core/inventory";
import { addXpToPlayerSkill } from "@/game/core/skills";
import type { ExplorationDrop, ExplorationResult } from "@/game/types/activity";
import type { GameState } from "@/game/types/gameState";
import { SkillType } from "@/game/types/skill";

/**
 * Base XP for completing a foraging session.
 */
const FORAGING_BASE_XP = 15;

/**
 * Bonus XP per item found.
 */
const FORAGING_XP_PER_ITEM = 5;

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
 * Adds found items to inventory and grants foraging XP.
 * XP is only granted for successful explorations.
 */
export function applyExplorationResults(
  state: GameState,
  result: ExplorationResult,
): { state: GameState; xpGained: number; leveledUp: boolean } {
  // Do not grant XP for failed explorations
  if (!result.success) {
    return {
      state,
      xpGained: 0,
      leveledUp: false,
    };
  }

  // Calculate XP: base + bonus per item found
  const itemCount = result.itemsFound.reduce(
    (sum, drop) => sum + drop.quantity,
    0,
  );
  const xpGained = FORAGING_BASE_XP + itemCount * FORAGING_XP_PER_ITEM;

  // Grant foraging XP
  const { skills, result: xpResult } = addXpToPlayerSkill(
    state.player.skills,
    SkillType.Foraging,
    xpGained,
  );

  let updatedState: GameState = {
    ...state,
    player: {
      ...state.player,
      skills,
    },
  };

  // Add each found item to inventory
  if (result.itemsFound.length > 0) {
    let currentInventory = updatedState.player.inventory;

    for (const drop of result.itemsFound) {
      currentInventory = addItem(currentInventory, drop.itemId, drop.quantity);
    }

    updatedState = {
      ...updatedState,
      player: {
        ...updatedState.player,
        inventory: currentInventory,
      },
    };
  }

  return {
    state: updatedState,
    xpGained: xpResult.xpGained,
    leveledUp: xpResult.leveledUp,
  };
}
