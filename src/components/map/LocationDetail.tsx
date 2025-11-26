/**
 * Location detail component showing information about a selected location.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Location } from "@/game/types/location";
import { FacilityType, LocationType } from "@/game/types/location";

interface LocationDetailProps {
  location: Location;
  isCurrentLocation: boolean;
  canTravel: boolean;
  travelMessage?: string;
  energyCost?: number;
  onTravel: () => void;
}

/**
 * Get display name for facility type.
 */
function getFacilityDisplay(facility: FacilityType): {
  name: string;
  emoji: string;
} {
  const facilities: Record<FacilityType, { name: string; emoji: string }> = {
    [FacilityType.RestArea]: { name: "Rest Area", emoji: "🛏️" },
    [FacilityType.FoodStation]: { name: "Food Station", emoji: "🍽️" },
    [FacilityType.WaterStation]: { name: "Water Station", emoji: "💧" },
    [FacilityType.PlayArea]: { name: "Play Area", emoji: "🎮" },
    [FacilityType.Storage]: { name: "Storage", emoji: "📦" },
    [FacilityType.Shop]: { name: "Shop", emoji: "🛒" },
    [FacilityType.Trainer]: { name: "Trainer", emoji: "💪" },
    [FacilityType.Inn]: { name: "Inn", emoji: "🏨" },
    [FacilityType.QuestBoard]: { name: "Quest Board", emoji: "📋" },
    [FacilityType.RestPoint]: { name: "Rest Point", emoji: "⛺" },
    [FacilityType.ForageZone]: { name: "Forage Zone", emoji: "🌿" },
    [FacilityType.BattleArea]: { name: "Battle Area", emoji: "⚔️" },
  };
  return facilities[facility] ?? { name: facility, emoji: "❓" };
}

/**
 * Get display for location type.
 */
function getLocationTypeDisplay(type: LocationType): {
  name: string;
  color: string;
} {
  const types: Record<LocationType, { name: string; color: string }> = {
    [LocationType.Home]: { name: "Home", color: "text-blue-600" },
    [LocationType.Town]: { name: "Town", color: "text-amber-600" },
    [LocationType.Wild]: { name: "Wild Area", color: "text-green-600" },
    [LocationType.Dungeon]: { name: "Dungeon", color: "text-purple-600" },
  };
  return types[type] ?? { name: type, color: "text-muted-foreground" };
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
}: LocationDetailProps) {
  const typeDisplay = getLocationTypeDisplay(location.type);

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
              <span className="text-muted-foreground">Level Range:</span>
              <span className="font-medium">
                {location.levelMin} - {location.levelMax}
              </span>
            </div>
          )}

        {/* Facilities */}
        {location.facilities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Facilities</h4>
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

        {/* Travel Button */}
        {!isCurrentLocation && (
          <div className="pt-2">
            <Button className="w-full" onClick={onTravel} disabled={!canTravel}>
              {canTravel ? (
                <>
                  Travel Here
                  {energyCost !== undefined && (
                    <span className="ml-2 text-xs opacity-80">
                      (⚡ {energyCost})
                    </span>
                  )}
                </>
              ) : (
                (travelMessage ?? "Cannot Travel")
              )}
            </Button>
          </div>
        )}

        {isCurrentLocation && (
          <div className="pt-2 text-center text-sm text-muted-foreground">
            📍 You are here
          </div>
        )}
      </CardContent>
    </Card>
  );
}
