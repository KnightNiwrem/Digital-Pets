/**
 * Shared utility functions for quest components.
 */

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
