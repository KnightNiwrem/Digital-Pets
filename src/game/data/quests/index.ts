/**
 * Quest data index - exports all quests.
 */

import type { Quest } from "@/game/types/quest";
import { dailyQuests } from "./daily";
import { mainQuests } from "./main";
import { sideQuests } from "./side";
import { tutorialQuests } from "./tutorial";
import { weeklyQuests } from "./weekly";

/**
 * All quests indexed by ID.
 */
export const quests: Record<string, Quest> = {
  ...tutorialQuests,
  ...mainQuests,
  ...sideQuests,
  ...dailyQuests,
  ...weeklyQuests,
};

/**
 * Get a quest by ID.
 */
export function getQuest(questId: string): Quest | undefined {
  return quests[questId];
}

/**
 * Get all quests of a specific type.
 */
export function getQuestsByType(type: string): Quest[] {
  return Object.values(quests).filter((quest) => quest.type === type);
}

/**
 * Get all quests offered by a specific NPC.
 */
export function getQuestsByGiver(giverId: string): Quest[] {
  return Object.values(quests).filter((quest) => quest.giverId === giverId);
}

/**
 * Get all daily quests.
 */
export function getDailyQuests(): Quest[] {
  return Object.values(dailyQuests);
}

/**
 * Get all weekly quests.
 */
export function getWeeklyQuests(): Quest[] {
  return Object.values(weeklyQuests);
}
