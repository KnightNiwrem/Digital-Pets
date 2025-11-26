/**
 * Energy bar component for displaying pet energy.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EnergyDisplay } from "@/game/state/selectors";
import { cn } from "@/lib/utils";

interface EnergyBarProps {
  energy: EnergyDisplay;
}

/**
 * Get color class based on energy percentage.
 */
function getEnergyColor(percent: number): string {
  if (percent >= 75) return "bg-blue-500";
  if (percent >= 50) return "bg-blue-400";
  if (percent >= 25) return "bg-yellow-500";
  return "bg-orange-500";
}

/**
 * Displays the pet's energy level.
 */
export function EnergyBar({ energy }: EnergyBarProps) {
  const colorClass = getEnergyColor(energy.energyPercent);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Energy</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <span>⚡</span>
              <span>Energy</span>
            </span>
            <span className="text-muted-foreground">
              {energy.energy}/{energy.energyMax}
            </span>
          </div>
          <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", colorClass)}
              style={{
                width: `${Math.max(0, Math.min(100, energy.energyPercent))}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
