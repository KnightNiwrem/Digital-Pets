/**
 * Activity selection component for exploration options.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForageTable } from "@/game/data/tables/forage";
import { formatTicksAsTime } from "@/game/types/common";

interface ActivitySelectProps {
  forageInfo: ForageTable | undefined;
  currentEnergy: number;
  canForage: boolean;
  forageMessage: string;
  onStartForage: () => void;
}

/**
 * Display exploration activity options.
 */
export function ActivitySelect({
  forageInfo,
  currentEnergy,
  canForage,
  forageMessage,
  onStartForage,
}: ActivitySelectProps) {
  if (!forageInfo) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No exploration activities available at this location.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasEnoughEnergy = currentEnergy >= forageInfo.baseEnergyCost;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>🌿</span>
          <span>Forage</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Search the area for useful items. Duration depends on the location.
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
            ⚡ {forageInfo.baseEnergyCost}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Duration:</span>
          <span>{formatTicksAsTime(forageInfo.baseDurationTicks)}</span>
        </div>

        <Button
          className="w-full"
          onClick={onStartForage}
          disabled={!canForage}
        >
          {canForage ? "Start Foraging" : forageMessage}
        </Button>
      </CardContent>
    </Card>
  );
}
