/**
 * Location detail component showing information about a selected location.
 */

import { NPCDisplay } from "@/components/npc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNpcsAtLocation } from "@/game/data/npcs";
import {
  FacilityDisplay,
  FacilityDisplayFallback,
  LocationTypeNames,
  LocationUI,
} from "@/game/data/uiText";
import type { Location } from "@/game/types/location";
import { FacilityType, LocationType } from "@/game/types/location";

interface LocationDetailProps {
  location: Location;
  isCurrentLocation: boolean;
  canTravel: boolean;
  travelMessage?: string;
  energyCost?: number;
  onTravel: () => void;
  onNpcClick?: (npcId: string) => void;
}

/**
 * Styling colors for location types (kept local as they are styling, not text).
 */
const LOCATION_TYPE_COLORS: Record<LocationType, string> = {
  [LocationType.Home]: "text-blue-600 dark:text-blue-400",
  [LocationType.Town]: "text-amber-600 dark:text-amber-400",
  [LocationType.Wild]: "text-green-600 dark:text-green-400",
  [LocationType.Dungeon]: "text-purple-600 dark:text-purple-400",
};

/**
 * Get display name for facility type.
 */
function getFacilityDisplay(facility: FacilityType): {
  name: string;
  emoji: string;
} {
  return FacilityDisplay[facility] ?? FacilityDisplayFallback;
}

/**
 * Get display for location type.
 */
function getLocationTypeDisplay(type: LocationType): {
  name: string;
  color: string;
} {
  return {
    name: LocationTypeNames[type] ?? type,
    color: LOCATION_TYPE_COLORS[type] ?? "text-muted-foreground",
  };
}

/**
 * Displays detailed information about a location.
 */
export function LocationDetail({
  location,
  isCurrentLocation,
  canTravel,
  travelMessage,
  energyCost,
  onTravel,
  onNpcClick,
}: LocationDetailProps) {
  const typeDisplay = getLocationTypeDisplay(location.type);
  const npcs = isCurrentLocation ? getNpcsAtLocation(location.id) : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{location.emoji}</span>
          <div>
            <CardTitle className="text-lg">{location.name}</CardTitle>
            <span className={`text-sm ${typeDisplay.color}`}>
              {typeDisplay.name}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{location.description}</p>

        {/* Level Range for Wild/Dungeon */}
        {(location.type === LocationType.Wild ||
          location.type === LocationType.Dungeon) &&
          location.levelMin !== undefined &&
          location.levelMax !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {LocationUI.levelRange}
              </span>
              <span className="font-medium">
                {location.levelMin} - {location.levelMax}
              </span>
            </div>
          )}

        {/* Facilities */}
        {location.facilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              {LocationUI.facilities}
            </h4>
            <div className="flex flex-wrap gap-2">
              {location.facilities.map((facility) => {
                const display = getFacilityDisplay(facility);
                return (
                  <span
                    key={facility}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs"
                  >
                    <span>{display.emoji}</span>
                    <span>{display.name}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* NPCs (only shown for current location) */}
        {isCurrentLocation && npcs.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">
              {LocationUI.peopleHere}
            </h4>
            <div className="flex flex-col gap-2">
              {npcs.map((npc) => (
                <NPCDisplay
                  key={npc.id}
                  npc={npc}
                  onClick={() => onNpcClick?.(npc.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Travel Button */}
        {!isCurrentLocation && (
          <div className="pt-2">
            <Button className="w-full" onClick={onTravel} disabled={!canTravel}>
              {canTravel ? (
                <>
                  {LocationUI.travelHere}
                  {energyCost !== undefined && (
                    <span className="ml-2 text-xs opacity-80">
                      (⚡ {energyCost})
                    </span>
                  )}
                </>
              ) : (
                (travelMessage ?? LocationUI.cannotTravel)
              )}
            </Button>
          </div>
        )}

        {isCurrentLocation && (
          <div className="pt-2 text-center text-sm text-muted-foreground">
            {LocationUI.youAreHere}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
