/**
 * Shared utilities for exploration components.
 */

import { ActivityId } from "@/game/data/exploration/activities";

/**
 * Get an emoji icon for an activity based on its ID.
 */
export function getActivityIcon(activityId: string): string {
  switch (activityId) {
    case ActivityId.Foraging:
      return "🌿";
    case ActivityId.Mining:
      return "⛏️";
    case ActivityId.Fishing:
      return "🎣";
    case ActivityId.DeepExploration:
      return "🗺️";
    default:
      return "🔍";
  }
}
