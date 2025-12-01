/**
 * Location node component for displaying a location on the map.
 */

import { Button } from "@/components/ui/button";
import type { Location } from "@/game/types/location";
import { cn } from "@/lib/utils";

interface LocationNodeProps {
  location: Location;
  isCurrentLocation: boolean;
  isSelected: boolean;
  energyCost?: number;
  onClick: () => void;
}

/**
 * Displays a single location on the map.
 */
export function LocationNode({
  location,
  isCurrentLocation,
  isSelected,
  energyCost,
  onClick,
}: LocationNodeProps) {
  return (
    <Button
      variant={
        isCurrentLocation ? "default" : isSelected ? "secondary" : "outline"
      }
      className={cn(
        "flex flex-col items-center gap-1 h-auto py-3 px-4 min-w-[100px]",
        isCurrentLocation && "ring-2 ring-primary ring-offset-2",
        isSelected &&
          !isCurrentLocation &&
          "ring-2 ring-secondary ring-offset-2",
      )}
      onClick={onClick}
      disabled={isCurrentLocation}
    >
      <span className="text-2xl">{location.emoji}</span>
      <span className="text-sm font-medium">{location.name}</span>
      {!isCurrentLocation && energyCost !== undefined && (
        <span className="text-xs text-muted-foreground">⚡ {energyCost}</span>
      )}
      {isCurrentLocation && (
        <span className="text-xs text-primary-foreground">📍 Here</span>
      )}
    </Button>
  );
}
