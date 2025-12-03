/**
 * Shared utility functions for quest components.
 */

import type { QuestProgress } from "@/game/types/quest";
import { QuestType } from "@/game/types/quest";

/**
 * Quest types that have expiration timers.
 */
const EXPIRABLE_QUEST_TYPES: QuestType[] = [
  QuestType.Daily,
  QuestType.Weekly,
  QuestType.Timed,
];

/**
 * Check if quest type has an expiration.
 */
export function hasExpiration(type: QuestType): boolean {
  return EXPIRABLE_QUEST_TYPES.includes(type);
}

/**
 * Create a progress map from an array of quest progress objects.
 * Useful for efficient lookup of quest progress by quest ID.
 */
export function createProgressMap(
  quests: QuestProgress[],
): Map<string, QuestProgress> {
  return new Map(quests.map((progress) => [progress.questId, progress]));
}
