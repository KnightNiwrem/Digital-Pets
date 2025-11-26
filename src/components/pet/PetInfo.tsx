/**
 * Pet info component displaying name, species, age, and stage.
 */

import { Card, CardContent } from "@/components/ui/card";
import type { PetInfoDisplay } from "@/game/state/selectors";

interface PetInfoProps {
  info: PetInfoDisplay;
}

/**
 * Displays pet identity and growth information.
 */
export function PetInfo({ info }: PetInfoProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{info.name}</h2>
            <span className="text-sm text-muted-foreground">
              {info.speciesEmoji} {info.speciesName}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {info.stage} {info.substage}/{info.substageCount}
            </span>
            <span className="text-muted-foreground">
              {info.ageDays} day{info.ageDays !== 1 ? "s" : ""} old
            </span>
          </div>
          {info.isSleeping && (
            <div className="text-center text-sm text-blue-500 font-medium">
              💤 Sleeping...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
