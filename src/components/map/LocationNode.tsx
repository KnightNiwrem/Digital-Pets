/**
 * Location node component for displaying a location on the map.
 */

import { Button } from "@/components/ui/button";
import type { Location } from "@/game/types/location";
import { cn } from "@/lib/utils";

interface LocationNodeProps {
  location: Location;
  isCurrentLocation: boolean;
  isAccessible: boolean;
  energyCost?: number;
  onClick: () => void;
}

/**
 * Displays a single location on the map.
 */
export function LocationNode({
  location,
  isCurrentLocation,
  isAccessible,
  energyCost,
  onClick,
}: LocationNodeProps) {
  return (
    <Button
      variant={
        isCurrentLocation ? "default" : isAccessible ? "outline" : "ghost"
      }
      className={cn(
        "flex flex-col items-center gap-1 h-auto py-3 px-4 min-w-[100px]",
        isCurrentLocation && "ring-2 ring-primary ring-offset-2",
        !isAccessible && !isCurrentLocation && "opacity-50 cursor-not-allowed",
      )}
      onClick={onClick}
      disabled={isCurrentLocation || !isAccessible}
    >
      <span className="text-2xl">{location.emoji}</span>
      <span className="text-sm font-medium">{location.name}</span>
      {!isCurrentLocation && isAccessible && energyCost !== undefined && (
        <span className="text-xs text-muted-foreground">⚡ {energyCost}</span>
      )}
      {isCurrentLocation && (
        <span className="text-xs text-primary-foreground">📍 Here</span>
      )}
    </Button>
  );
}
