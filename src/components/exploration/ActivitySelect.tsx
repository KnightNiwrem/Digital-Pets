/**
 * Activity selection component for exploration options.
 * TODO: Implement with new exploration system
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTicksAsTime } from "@/game/types/common";

/**
 * Temporary placeholder for activity info until new exploration system is implemented.
 */
interface ActivityInfo {
  name: string;
  description: string;
  energyCost: number;
  durationTicks: number;
}

interface ActivitySelectProps {
  activityInfo: ActivityInfo | undefined;
  currentEnergy: number;
  canStartActivity: boolean;
  activityMessage: string;
  onStartActivity: () => void;
}

/**
 * Display exploration activity options.
 * TODO: Update to use new activity-based exploration system
 */
export function ActivitySelect({
  activityInfo,
  currentEnergy,
  canStartActivity,
  activityMessage,
  onStartActivity,
}: ActivitySelectProps) {
  if (!activityInfo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Exploration system is being upgraded. Please check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasEnoughEnergy = currentEnergy >= activityInfo.energyCost;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>🌿</span>
          <span>{activityInfo.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {activityInfo.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Energy Cost:</span>
          <span
            className={
              hasEnoughEnergy
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            ⚡ {activityInfo.energyCost}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Duration:</span>
          <span>{formatTicksAsTime(activityInfo.durationTicks)}</span>
        </div>

        <Button
          className="w-full"
          onClick={onStartActivity}
          disabled={!canStartActivity}
        >
          {canStartActivity ? `Start ${activityInfo.name}` : activityMessage}
        </Button>
      </CardContent>
    </Card>
  );
}
