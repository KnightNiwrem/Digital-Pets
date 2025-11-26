/**
 * Training progress indicator component.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getTrainingProgress,
  getTrainingTimeRemaining,
} from "@/game/core/training";
import { getFacility, getSession } from "@/game/data/facilities";
import type { ActiveTraining } from "@/game/types/activity";

interface TrainingProgressProps {
  training: ActiveTraining;
  onCancel: () => void;
}

/**
 * Active training progress display.
 */
export function TrainingProgress({
  training,
  onCancel,
}: TrainingProgressProps) {
  const facility = getFacility(training.facilityId);
  const session = getSession(training.facilityId, training.sessionType);
  const progress = getTrainingProgress(training);
  const timeRemaining = getTrainingTimeRemaining(training);

  if (!facility || !session) {
    return null;
  }

  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{facility.emoji}</span>
            <div>
              <CardTitle className="text-base">Training in Progress</CardTitle>
              <p className="text-sm text-muted-foreground">
                {session.name} at {facility.name}
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
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time remaining */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Time remaining</span>
          <span className="text-sm font-medium">{timeRemaining}</span>
        </div>

        {/* Expected gains */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Expected gains</span>
          <span className="text-sm">
            +{session.primaryStatGain} {facility.primaryStat}
            {session.secondaryStatGain > 0 && (
              <>
                , +{session.secondaryStatGain} {facility.secondaryStat}
              </>
            )}
          </span>
        </div>

        {/* Cancel button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onCancel}
        >
          Cancel Training
        </Button>
      </CardContent>
    </Card>
  );
}
