// World Map component - shows current location and available destinations

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Zap, Lock } from "lucide-react";
import type { Pet, WorldState } from "@/types";
import { WorldSystem } from "@/systems/WorldSystem";
import { PetValidator, GameMath } from "@/lib/utils";

interface WorldMapProps {
  pet: Pet;
  worldState: WorldState;
  onTravel: (destinationId: string) => void;
  disabled?: boolean;
}

export function WorldMap({ pet, worldState, onTravel, disabled = false }: WorldMapProps) {
  const currentLocation = WorldSystem.getCurrentLocation(worldState);
  const availableDestinationsResult = WorldSystem.getAvailableDestinations(worldState, pet);
  const availableDestinations = availableDestinationsResult.success ? availableDestinationsResult.data : [];

  // Check if currently travelling
  const isTravel = worldState.travelState !== undefined;
  const travelProgress = WorldSystem.getTravelProgress(worldState);

  if (!currentLocation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            World Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Location not found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          World Map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">{currentLocation.name}</h3>
              <p className="text-sm text-blue-700">{currentLocation.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{currentLocation.type}</span>
                {currentLocation.activities.length > 0 && (
                  <span className="text-xs text-blue-600">
                    {currentLocation.activities.length} activities available
                  </span>
                )}
              </div>
            </div>
            <div className="text-2xl">📍</div>
          </div>
        </div>

        {/* Travel Status */}
        {isTravel && worldState.travelState && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-900">Travelling...</span>
            </div>
            <div className="text-sm text-orange-700 mb-2">
              Heading to{" "}
              {
                WorldSystem.getCurrentLocation({
                  ...worldState,
                  currentLocationId: worldState.travelState.destinationId,
                })?.name
              }
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${travelProgress}%` }}
              />
            </div>
            <div className="text-xs text-orange-600 mt-1">{GameMath.roundToPercentage(travelProgress)}% complete</div>
          </div>
        )}

        {/* Available Destinations */}
        {!isTravel && (
          <div>
            <h4 className="font-medium mb-3">Available Destinations</h4>
            {!availableDestinations || availableDestinations.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No destinations available.</p>
                <p className="text-xs text-gray-400">Level up your pet to unlock new areas!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableDestinations.map(destination => {
                  const connection = currentLocation.connections.find(c => c.destinationId === destination.id);
                  const energyCost = connection ? GameMath.convertTicksToEnergyCost(connection.travelTime) : 0;
                  const canAfford = pet.currentEnergy >= energyCost;
                  const travelTime = connection ? GameMath.convertTicksToMinutes(connection.travelTime) : 0;

                  return (
                    <div key={destination.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">{destination.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{destination.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {travelTime} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {energyCost} energy
                            </div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{destination.type}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onTravel(destination.id)}
                          disabled={disabled || !canAfford || PetValidator.isSleeping(pet)}
                          className="ml-3"
                        >
                          {!canAfford ? "No Energy" : "Travel"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        {!isTravel && (!availableDestinations || availableDestinations.length === 0) && (
          <div className="text-xs text-gray-500 text-center">
            💡 Take care of your pet and help them grow to unlock new locations!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
