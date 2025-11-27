/**
 * Exploration progress indicator component.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExplorationProgress } from "@/game/core/exploration/forage";
import { getLocation } from "@/game/data/locations";
import type { ActiveExploration } from "@/game/types/activity";
import { formatTicksAsTime } from "@/game/types/common";

interface ExplorationProgressProps {
  exploration: ActiveExploration;
  onCancel: () => void;
}

/**
 * Active exploration progress display.
 */
export function ExplorationProgress({
  exploration,
  onCancel,
}: ExplorationProgressProps) {
  const location = getLocation(exploration.locationId);
  const progress = getExplorationProgress(exploration);
  const timeRemaining = formatTicksAsTime(exploration.ticksRemaining);

  const activityName =
    exploration.activityType === "forage" ? "Foraging" : "Exploring";

  return (
    <Card className="border-green-500/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <div>
              <CardTitle className="text-base">{activityName}...</CardTitle>
              <p className="text-sm text-muted-foreground">
                {location?.name ?? "Unknown Location"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time remaining */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Time remaining</span>
          <span className="text-sm font-medium">{timeRemaining}</span>
        </div>

        {/* Cancel button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onCancel}
        >
          Cancel Exploration
        </Button>
      </CardContent>
    </Card>
  );
}
