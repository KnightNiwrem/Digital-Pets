/**
 * Growth progress component showing progress toward next stage.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrowthProgressDisplay } from "@/game/state/selectors";

interface GrowthProgressProps {
  progress: GrowthProgressDisplay;
}

/**
 * Progress bar component for growth.
 */
function ProgressBar({
  percent,
  className = "",
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div
      className={`h-2 bg-secondary rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}

/**
 * Displays growth progress toward next stage and substage.
 */
export function GrowthProgress({ progress }: GrowthProgressProps) {
  const isFullyGrown = progress.nextStage === null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Growth Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stage progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{progress.currentStage}</span>
            {isFullyGrown ? (
              <span className="text-muted-foreground">Fully grown</span>
            ) : (
              <span className="text-muted-foreground">
                → {progress.nextStage}
              </span>
            )}
          </div>
          <ProgressBar percent={progress.stageProgressPercent} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress.stageProgressPercent}%</span>
            {progress.timeUntilNextStage && (
              <span>{progress.timeUntilNextStage} remaining</span>
            )}
          </div>
        </div>

        {/* Substage info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Substage {progress.substage}/{progress.substageCount}
          </span>
          {progress.timeUntilNextSubstage && (
            <span className="text-xs text-muted-foreground">
              Next substage: {progress.timeUntilNextSubstage}
            </span>
          )}
        </div>

        {/* Age */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Total age: {progress.ageDays} day{progress.ageDays !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
}
