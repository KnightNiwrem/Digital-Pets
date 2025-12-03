/**
 * Shared exploration completion logic.
 * Used by both the tick processor and the exploration state actions.
 */

import { addItem } from "@/game/core/inventory";
import { updateQuestProgress } from "@/game/core/quests/quests";
import type { ExplorationDrop } from "@/game/types/activity";
import type { GameState } from "@/game/types/gameState";
import { ObjectiveType } from "@/game/types/quest";
import type { PlayerSkills } from "@/game/types/skill";
import { applySkillXpGains } from "./exploration";

/**
 * Result of applying exploration rewards to game state.
 */
export interface ApplyExplorationRewardsResult {
  /** Updated game state with rewards applied */
  state: GameState;
  /** Updated player skills with XP applied */
  skills: PlayerSkills;
  /** Map of skill IDs to whether they leveled up */
  skillLevelUps: Record<string, boolean>;
}

/**
 * Apply exploration rewards to game state.
 * Updates skills, inventory, and quest progress.
 * This is the shared implementation used by both tick processor and state actions.
 *
 * @param state The current game state (with updated pet already set)
 * @param itemsFound Items to add to inventory
 * @param skillXpGains Skill XP to award
 * @param activityId The activity ID for quest progress
 */
export function applyExplorationRewards(
  state: GameState,
  itemsFound: ExplorationDrop[],
  skillXpGains: Record<string, number>,
  activityId: string,
): ApplyExplorationRewardsResult {
  // Apply skill XP gains
  const { skills: updatedSkills, levelUps } = applySkillXpGains(
    state.player.skills,
    skillXpGains,
  );

  // Combine skills and inventory updates into a single state update
  let updatedState: GameState = {
    ...state,
    player: {
      ...state.player,
      skills: updatedSkills,
      inventory: itemsFound.reduce(
        (inv, drop) => addItem(inv, drop.itemId, drop.quantity),
        state.player.inventory,
      ),
    },
  };

  // Update quest progress for Explore objectives
  updatedState = updateQuestProgress(
    updatedState,
    ObjectiveType.Explore,
    activityId,
  );

  // Update quest progress for Collect objectives for each item found
  updatedState = itemsFound.reduce(
    (s, drop) =>
      updateQuestProgress(s, ObjectiveType.Collect, drop.itemId, drop.quantity),
    updatedState,
  );

  return {
    state: updatedState,
    skills: updatedSkills,
    skillLevelUps: levelUps,
  };
}
