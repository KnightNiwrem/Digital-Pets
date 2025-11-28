/**
 * Reusable status card for displaying pet activity states.
 * Used to inform users why certain actions are blocked.
 */

import { Card, CardContent } from "@/components/ui/card";
import { ActivityState } from "@/game/types/constants";

/**
 * Configuration for each activity state's display.
 */
interface ActivityStatusConfig {
  emoji: string;
  title: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  subtextColor: string;
}

/**
 * Map of activity states to their display configuration.
 */
const ACTIVITY_STATUS_CONFIG: Record<ActivityState, ActivityStatusConfig> = {
  [ActivityState.Idle]: {
    emoji: "",
    title: "",
    borderColor: "",
    bgColor: "",
    textColor: "",
    subtextColor: "",
  },
  [ActivityState.Sleeping]: {
    emoji: "💤",
    title: "Your pet is sleeping...",
    borderColor: "border-blue-200 dark:border-blue-800",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-700 dark:text-blue-300",
    subtextColor: "text-blue-600 dark:text-blue-400",
  },
  [ActivityState.Training]: {
    emoji: "💪",
    title: "Your pet is training...",
    borderColor: "border-amber-200 dark:border-amber-800",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    textColor: "text-amber-700 dark:text-amber-300",
    subtextColor: "text-amber-600 dark:text-amber-400",
  },
  [ActivityState.Exploring]: {
    emoji: "🌿",
    title: "Your pet is exploring...",
    borderColor: "border-green-200 dark:border-green-800",
    bgColor: "bg-green-50 dark:bg-green-950",
    textColor: "text-green-700 dark:text-green-300",
    subtextColor: "text-green-600 dark:text-green-400",
  },
  [ActivityState.Battling]: {
    emoji: "⚔️",
    title: "Your pet is battling...",
    borderColor: "border-red-200 dark:border-red-800",
    bgColor: "bg-red-50 dark:bg-red-950",
    textColor: "text-red-700 dark:text-red-300",
    subtextColor: "text-red-600 dark:text-red-400",
  },
};

interface ActivityStatusCardProps {
  /** The current activity state to display */
  activityState: ActivityState;
  /** The message explaining what the user should do */
  message: string;
}

/**
 * Displays a colored status card for the current pet activity state.
 * Returns null if the pet is idle.
 */
export function ActivityStatusCard({
  activityState,
  message,
}: ActivityStatusCardProps) {
  // Don't render anything for idle state
  if (activityState === ActivityState.Idle) {
    return null;
  }

  const config = ACTIVITY_STATUS_CONFIG[activityState];

  return (
    <Card className={`${config.borderColor} ${config.bgColor}`}>
      <CardContent className="pt-4 pb-4">
        <div
          className={`flex items-center justify-center gap-2 ${config.textColor}`}
        >
          <span className="text-2xl">{config.emoji}</span>
          <span className="font-medium">{config.title}</span>
        </div>
        <p className={`text-center text-sm ${config.subtextColor} mt-2`}>
          {message}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Get a message explaining why care actions are blocked.
 */
export function getCareBlockedMessage(activityState: ActivityState): string {
  const messages: Record<ActivityState, string> = {
    [ActivityState.Idle]: "",
    [ActivityState.Sleeping]:
      "Wake up your pet to feed, water, play, or clean.",
    [ActivityState.Training]: "Cancel training to feed, water, play, or clean.",
    [ActivityState.Exploring]:
      "Cancel exploration to feed, water, play, or clean.",
    [ActivityState.Battling]:
      "Complete the battle to feed, water, play, or clean.",
  };
  return messages[activityState];
}
