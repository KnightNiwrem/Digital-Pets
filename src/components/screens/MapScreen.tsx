/**
 * Map screen for viewing the world map and traveling between locations.
 */

import { useMemo, useState } from "react";
import { LocationDetail, LocationNode } from "@/components/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { getConnectedLocations, getLocation } from "@/game/data/locations";
import { useGameState } from "@/game/hooks/useGameState";
import { checkCanTravel, travelToLocation } from "@/game/state/actions/travel";
import { toDisplay } from "@/game/types/common";

/**
 * Main map screen showing world locations and travel options.
 */
export function MapScreen() {
  const { state, isLoading, actions } = useGameState();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get current location
  const currentLocationId = state?.player.currentLocationId ?? "home";
  const currentLocation = getLocation(currentLocationId);

  // Get connected locations
  const connectedLocations = useMemo(() => {
    return getConnectedLocations(currentLocationId);
  }, [currentLocationId]);

  // Calculate travel info for each connected location
  const travelInfo = useMemo(() => {
    if (!state) return {};

    const info: Record<
      string,
      { canTravel: boolean; message: string; energyCost?: number }
    > = {};

    for (const location of connectedLocations) {
      const result = checkCanTravel(state, location.id);
      info[location.id] = {
        canTravel: result.canTravel,
        message: result.message,
        energyCost: result.energyCost,
      };
    }

    return info;
  }, [state, connectedLocations]);

  // Get selected location
  const selectedLocation = selectedLocationId
    ? getLocation(selectedLocationId)
    : null;

  // Handle travel to location
  const handleTravel = (destinationId: string) => {
    if (!state) return;

    const result = travelToLocation(state, destinationId);
    if (result.success) {
      actions.updateState(() => result.state);
      setSelectedLocationId(null);
    } else {
      setErrorMessage(result.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state || !currentLocation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading map data.</p>
      </div>
    );
  }

  const currentEnergy = state.pet ? toDisplay(state.pet.energyStats.energy) : 0;

  return (
    <>
      <div className="space-y-4">
        {/* Current Location Header */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentLocation.emoji}</span>
                <div>
                  <CardTitle className="text-lg">
                    {currentLocation.name}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    Current Location
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span className="text-lg">⚡</span>
                <span className="font-medium">{currentEnergy}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Connected Locations */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Nearby Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {connectedLocations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No connected locations found.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {connectedLocations.map((location) => {
                  const info = travelInfo[location.id];
                  return (
                    <LocationNode
                      key={location.id}
                      location={location}
                      isCurrentLocation={false}
                      isAccessible={info?.canTravel ?? false}
                      energyCost={info?.energyCost}
                      onClick={() => setSelectedLocationId(location.id)}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Location Detail */}
        {selectedLocation && (
          <LocationDetail
            location={selectedLocation}
            isCurrentLocation={selectedLocation.id === currentLocationId}
            canTravel={travelInfo[selectedLocation.id]?.canTravel ?? false}
            travelMessage={travelInfo[selectedLocation.id]?.message}
            energyCost={travelInfo[selectedLocation.id]?.energyCost}
            onTravel={() => handleTravel(selectedLocation.id)}
          />
        )}

        {/* Current Location Detail (shown when no selection) */}
        {!selectedLocation && (
          <LocationDetail
            location={currentLocation}
            isCurrentLocation={true}
            canTravel={false}
            onTravel={() => {}}
          />
        )}
      </div>

      <ErrorDialog
        open={errorMessage !== null}
        onOpenChange={() => setErrorMessage(null)}
        message={errorMessage ?? ""}
      />
    </>
  );
}
