/**
 * Exploration state actions.
 * TODO: Implement with new exploration system
 */

import { addItem } from "@/game/core/inventory";
import { addXpToPlayerSkill } from "@/game/core/skills";
import type { ExplorationDrop, ExplorationResult } from "@/game/types/activity";
import { ActivityState } from "@/game/types/constants";
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
 * TODO: Implement with new exploration system
 */
export function startForaging(state: GameState): ExplorationActionResult {
  // TODO: Implement with new exploration system
  return {
    success: false,
    state,
    message: "Exploration system is being upgraded. Please try again later.",
  };
}

/**
 * Cancel the current exploration session.
 * TODO: Implement with new exploration system
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

  // Refund energy and clear exploration state
  const energyRefunded = state.pet.activeExploration.energyCost;

  return {
    success: true,
    state: {
      ...state,
      pet: {
        ...state.pet,
        activityState: ActivityState.Idle,
        activeExploration: undefined,
        energyStats: {
          energy: state.pet.energyStats.energy + energyRefunded,
        },
      },
    },
    message: "Exploration cancelled. Energy has been refunded.",
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
