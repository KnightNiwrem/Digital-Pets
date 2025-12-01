/**
 * Map screen for viewing the world map and traveling between locations.
 */

import { useMemo, useState } from "react";
import { LocationDetail, LocationNode } from "@/components/map";
import { DialogueScreen } from "@/components/npc";
import { ShopScreen } from "@/components/screens/ShopScreen";
import {
  ActivityBlockedCard,
  getActivityBlockingInfo,
} from "@/components/ui/ActivityBlockedCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { getConnectedLocations, getLocation } from "@/game/data/locations";
import { useGameState } from "@/game/hooks/useGameState";
import { checkCanTravel, travelToLocation } from "@/game/state/actions/travel";
import {
  selectCurrentLocationId,
  selectEnergy,
  selectPet,
} from "@/game/state/selectors";

/**
 * Main map screen showing world locations and travel options.
 */
export function MapScreen() {
  const { state, isLoading, actions } = useGameState();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [talkingToNpcId, setTalkingToNpcId] = useState<string | null>(null);
  const [shoppingAtNpcId, setShoppingAtNpcId] = useState<string | null>(null);

  // Get current location
  const currentLocationId = state ? selectCurrentLocationId(state) : "home";
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

  // Handle NPC click
  const handleNpcClick = (npcId: string) => {
    setTalkingToNpcId(npcId);
  };

  // Handle dialogue close
  const handleDialogueClose = () => {
    setTalkingToNpcId(null);
  };

  // Handle shop open
  const handleOpenShop = (npcId: string) => {
    setTalkingToNpcId(null);
    setShoppingAtNpcId(npcId);
  };

  // Handle shop close
  const handleCloseShop = () => {
    setShoppingAtNpcId(null);
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

  // Get pet for blocking info
  const pet = selectPet(state);

  // If shopping at an NPC, show shop screen
  if (shoppingAtNpcId) {
    return <ShopScreen npcId={shoppingAtNpcId} onClose={handleCloseShop} />;
  }

  // If talking to an NPC, show dialogue screen
  if (talkingToNpcId) {
    return (
      <DialogueScreen
        npcId={talkingToNpcId}
        onClose={handleDialogueClose}
        onOpenShop={handleOpenShop}
      />
    );
  }

  const energy = selectEnergy(state);
  const currentEnergy = energy ? energy.energy : 0;
  const blockingInfo = pet ? getActivityBlockingInfo(pet, "travel") : null;

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
                      isSelected={selectedLocationId === location.id}
                      energyCost={info?.energyCost}
                      onClick={() => setSelectedLocationId(location.id)}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Blocking Status */}
        {blockingInfo && <ActivityBlockedCard blockingInfo={blockingInfo} />}

        {/* Selected Location Detail */}
        {selectedLocation && (
          <LocationDetail
            location={selectedLocation}
            isCurrentLocation={selectedLocation.id === currentLocationId}
            canTravel={travelInfo[selectedLocation.id]?.canTravel ?? false}
            travelMessage={travelInfo[selectedLocation.id]?.message}
            energyCost={travelInfo[selectedLocation.id]?.energyCost}
            onTravel={() => handleTravel(selectedLocation.id)}
            onNpcClick={handleNpcClick}
          />
        )}

        {/* Current Location Detail (shown when no selection) */}
        {!selectedLocation && (
          <LocationDetail
            location={currentLocation}
            isCurrentLocation={true}
            canTravel={false}
            onTravel={() => {}}
            onNpcClick={handleNpcClick}
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
