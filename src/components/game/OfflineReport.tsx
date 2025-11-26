/**
 * Offline report dialog showing what happened while the player was away.
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toDisplay } from "@/game/types/common";
import type { OfflineReport as OfflineReportType } from "@/game/types/offline";

interface OfflineReportProps {
  report: OfflineReportType;
  onDismiss: () => void;
}

/**
 * Format elapsed time in a human-readable way.
 */
function formatElapsedTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days} day${days > 1 ? "s" : ""} and ${remainingHours} hour${remainingHours > 1 ? "s" : ""}`
      : `${days} day${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} and ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  return "less than a minute";
}

/**
 * Stat change indicator showing the difference between before and after values.
 */
function StatChange({
  label,
  before,
  after,
  max,
}: {
  label: string;
  before: number;
  after: number;
  max: number;
}) {
  const beforeDisplay = toDisplay(before);
  const afterDisplay = toDisplay(after);
  const maxDisplay = toDisplay(max);
  const change = afterDisplay - beforeDisplay;

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span>
          {afterDisplay}/{maxDisplay}
        </span>
        {change !== 0 && (
          <span className={change < 0 ? "text-destructive" : "text-green-500"}>
            ({change > 0 ? "+" : ""}
            {change})
          </span>
        )}
      </span>
    </div>
  );
}

/**
 * Display the offline report as a dialog.
 */
export function OfflineReport({ report, onDismiss }: OfflineReportProps) {
  const {
    elapsedMs,
    wasCapped,
    petName,
    beforeStats,
    afterStats,
    maxStats,
    poopBefore,
    poopAfter,
  } = report;

  const poopChange = poopAfter - poopBefore;

  // Use max values from report, with fallback for safety
  const maxCareStat = maxStats?.careStatMax ?? 200_000;
  const maxEnergy = maxStats?.energyMax ?? 200_000;

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            You were away for {formatElapsedTime(elapsedMs)}
            {wasCapped && " (capped at 7 days)"}
          </DialogDescription>
        </DialogHeader>

        {petName && beforeStats && afterStats && (
          <div className="space-y-4">
            <p className="text-sm">
              While you were away, <strong>{petName}</strong> experienced the
              following changes:
            </p>

            <div className="space-y-1 text-sm">
              <StatChange
                label="Satiety"
                before={beforeStats.satiety}
                after={afterStats.satiety}
                max={maxCareStat}
              />
              <StatChange
                label="Hydration"
                before={beforeStats.hydration}
                after={afterStats.hydration}
                max={maxCareStat}
              />
              <StatChange
                label="Happiness"
                before={beforeStats.happiness}
                after={afterStats.happiness}
                max={maxCareStat}
              />
              <StatChange
                label="Energy"
                before={beforeStats.energy}
                after={afterStats.energy}
                max={maxEnergy}
              />

              {poopChange > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-muted-foreground">Poop</span>
                  <span className="text-amber-500">
                    +{poopChange} poop{poopChange > 1 ? "s" : ""} accumulated
                  </span>
                </div>
              )}
            </div>

            {(afterStats.satiety === 0 ||
              afterStats.hydration === 0 ||
              afterStats.happiness === 0 ||
              afterStats.energy === 0) && (
              <p className="text-destructive text-sm">
                ⚠️ Some needs are critical! Take care of your pet immediately.
              </p>
            )}
          </div>
        )}

        {!petName && (
          <p className="text-sm text-muted-foreground">
            Time has passed but you don&apos;t have a pet yet.
          </p>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={onDismiss}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
