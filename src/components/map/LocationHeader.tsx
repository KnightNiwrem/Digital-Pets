/**
 * Shared LocationHeader component for displaying location and energy info.
 * Used by ExplorationScreen and MapScreen to avoid duplication.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Location } from "@/game/types/location";

interface LocationHeaderProps {
  /** The location to display */
  location: Location | undefined;
  /** Current energy value to display */
  currentEnergy: number;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional content to display below the header */
  children?: React.ReactNode;
}

/**
 * Displays a location header with emoji, name, and energy indicator.
 */
export function LocationHeader({
  location,
  currentEnergy,
  subtitle,
  children,
}: LocationHeaderProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{location?.emoji ?? "📍"}</span>
            <div>
              <CardTitle className="text-lg">
                {location?.name ?? "Unknown Location"}
              </CardTitle>
              {subtitle && (
                <span className="text-sm text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
            <span className="text-lg">⚡</span>
            <span className="font-medium">{currentEnergy}</span>
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );
}
