/**
 * Card component to display when an activity is blocked due to pet state.
 */

import { Card, CardContent } from "@/components/ui/card";
import { ActivityState } from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";

interface ActivityBlockingInfo {
  blocked: true;
  emoji: string;
  title: string;
  message: string;
  colorClass: string;
}

/**
 * Get blocking information for a pet's current activity state.
 * Returns null if the pet is idle (not blocked).
 */
export function getActivityBlockingInfo(
  pet: Pet,
  actionDescription: string,
): ActivityBlockingInfo | null {
  switch (pet.activityState) {
    case ActivityState.Sleeping:
      return {
        blocked: true,
        emoji: "💤",
        title: "Your pet is sleeping...",
        message: `Wake up your pet to ${actionDescription}.`,
        colorClass:
          "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
      };
    case ActivityState.Training:
      return {
        blocked: true,
        emoji: "💪",
        title: "Your pet is training...",
        message: `Wait for training to complete or cancel it to ${actionDescription}.`,
        colorClass:
          "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 text-orange-700 dark:text-orange-300",
      };
    case ActivityState.Exploring:
      return {
        blocked: true,
        emoji: "🌿",
        title: "Your pet is exploring...",
        message: `Wait for exploration to complete or cancel it to ${actionDescription}.`,
        colorClass:
          "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 text-green-700 dark:text-green-300",
      };
    case ActivityState.Battling:
      return {
        blocked: true,
        emoji: "⚔️",
        title: "Your pet is in battle...",
        message: `Finish the battle to ${actionDescription}.`,
        colorClass:
          "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 text-red-700 dark:text-red-300",
      };
    case ActivityState.Idle:
      return null;
    default: {
      const _exhaustive: never = pet.activityState;
      return _exhaustive;
    }
  }
}

interface ActivityBlockedCardProps {
  blockingInfo: ActivityBlockingInfo;
}

/**
 * Card displayed when an activity is blocked due to pet state.
 */
export function ActivityBlockedCard({
  blockingInfo,
}: ActivityBlockedCardProps) {
  return (
    <Card className={blockingInfo.colorClass}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">{blockingInfo.emoji}</span>
          <span className="font-medium">{blockingInfo.title}</span>
        </div>
        <p className="text-center text-sm mt-2 opacity-80">
          {blockingInfo.message}
        </p>
      </CardContent>
    </Card>
  );
}
