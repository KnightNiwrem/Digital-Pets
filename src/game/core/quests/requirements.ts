/**
 * Quest requirement checking logic.
 */

import type { GameState } from "@/game/types/gameState";
import {
  type QuestRequirement,
  QuestState,
  RequirementType,
} from "@/game/types/quest";
import type { SkillType } from "@/game/types/skill";

/**
 * Check if a single requirement is met.
 */
export function checkRequirement(
  state: GameState,
  requirement: QuestRequirement,
): boolean {
  switch (requirement.type) {
    case RequirementType.Quest: {
      // Check if the required quest is completed
      const questProgress = state.quests.find(
        (q) => q.questId === requirement.target,
      );
      return questProgress?.state === QuestState.Completed;
    }

    case RequirementType.Stage: {
      // Check if pet has reached the required growth stage
      if (!state.pet) return false;
      const stageOrder = ["egg", "baby", "child", "teen", "adult", "elder"];
      const currentStageIndex = stageOrder.indexOf(state.pet.growth.stage);
      const requiredStageIndex = stageOrder.indexOf(requirement.target);
      return currentStageIndex >= requiredStageIndex;
    }

    case RequirementType.Skill: {
      // Check if skill level is high enough
      const skillType = requirement.target as SkillType;
      const skill = state.player.skills[skillType];
      if (!skill) return false;
      return skill.level >= (requirement.value ?? 1);
    }

    case RequirementType.Item: {
      // Check if player has the required item
      const item = state.player.inventory.items.find(
        (i) => i.itemId === requirement.target,
      );
      return item !== undefined && item.quantity >= (requirement.value ?? 1);
    }

    case RequirementType.Location: {
      // Check if player has visited the location
      // For now, just check if current location matches (discovery tracking would be more robust)
      return state.player.currentLocationId === requirement.target;
    }

    case RequirementType.Battle: {
      // Check battle win count - would need a battleStats tracker in GameState
      // For now, return true as we don't track this yet
      return true;
    }

    default:
      return false;
  }
}

/**
 * Check if all requirements for a quest are met.
 */
export function checkAllRequirements(
  state: GameState,
  requirements: QuestRequirement[],
): boolean {
  return requirements.every((req) => checkRequirement(state, req));
}
