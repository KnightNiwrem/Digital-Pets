/**
 * Pet status component displaying care stat bars.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CareStatDisplay } from "@/game/state/selectors";
import type { CareThreshold } from "@/game/types/constants";
import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  icon: string;
  value: number;
  max: number;
  percent: number;
  threshold: CareThreshold;
}

/**
 * Get color classes based on care threshold.
 */
function getThresholdColor(threshold: CareThreshold): string {
  switch (threshold) {
    case "content":
      return "bg-green-500";
    case "okay":
      return "bg-yellow-500";
    case "uncomfortable":
      return "bg-orange-500";
    case "distressed":
      return "bg-red-500";
    case "critical":
      return "bg-red-700";
    default:
      return "bg-gray-500";
  }
}

/**
 * Individual stat bar component.
 */
function StatBar({
  label,
  icon,
  value,
  max,
  percent,
  threshold,
}: StatBarProps) {
  const colorClass = getThresholdColor(threshold);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
        </span>
        <span className="text-muted-foreground">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", colorClass)}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}

interface PetStatusProps {
  careStats: CareStatDisplay;
}

/**
 * Displays all care stat bars.
 */
export function PetStatus({ careStats }: PetStatusProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Care Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatBar
          label="Satiety"
          icon="🍖"
          value={careStats.satiety}
          max={careStats.satietyMax}
          percent={careStats.satietyPercent}
          threshold={careStats.satietyThreshold}
        />
        <StatBar
          label="Hydration"
          icon="💧"
          value={careStats.hydration}
          max={careStats.hydrationMax}
          percent={careStats.hydrationPercent}
          threshold={careStats.hydrationThreshold}
        />
        <StatBar
          label="Happiness"
          icon="😊"
          value={careStats.happiness}
          max={careStats.happinessMax}
          percent={careStats.happinessPercent}
          threshold={careStats.happinessThreshold}
        />
      </CardContent>
    </Card>
  );
}
