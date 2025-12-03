/**
 * Shared utilities for exploration components.
 */

/**
 * Get an emoji icon for an activity based on its ID.
 */
export function getActivityIcon(activityId: string): string {
  switch (activityId) {
    case "foraging":
      return "🌿";
    case "mining":
      return "⛏️";
    case "fishing":
      return "🎣";
    case "deep_exploration":
      return "🗺️";
    default:
      return "🔍";
  }
}
