// Activities Panel - shows available activities and current progress

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pickaxe, Fish, TreePine, Sword, Trophy, Clock, Zap, Gift } from "lucide-react";
import type { Pet, WorldState } from "@/types";
import { WorldSystem } from "@/systems/WorldSystem";

interface ActivitiesPanelProps {
  pet: Pet;
  worldState: WorldState;
  onStartActivity: (activityId: string) => void;
  onCancelActivity: () => void;
  onOpenShop?: (shopId: string) => void;
  disabled?: boolean;
}

// Icon mapping for activity types
const ACTIVITY_ICONS = {
  foraging: TreePine,
  fishing: Fish,
  mining: Pickaxe,
  training: Sword,
  battle: Trophy,
  shop: Gift,
  quest: Gift,
} as const;

export function ActivitiesPanel({
  pet,
  worldState,
  onStartActivity,
  onCancelActivity,
  onOpenShop,
  disabled = false,
}: ActivitiesPanelProps) {
  const currentLocation = WorldSystem.getCurrentLocation(worldState);
  const activityProgress = WorldSystem.getActivityProgress(worldState, pet.id);
  const isTravel = worldState.travelState !== undefined;
  const availableShops = WorldSystem.getAvailableShops(worldState);

  if (!currentLocation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">No location data available</div>
        </CardContent>
      </Card>
    );
  }

  const availableActivities = currentLocation.activities;
  const hasActiveActivity = activityProgress.activity !== undefined;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          Activities at {currentLocation.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Activity Progress */}
        {hasActiveActivity && activityProgress.activity && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">{activityProgress.activity.name}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelActivity}
                disabled={disabled}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel
              </Button>
            </div>

            <p className="text-sm text-green-700 mb-3">{activityProgress.activity.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Progress</span>
                <span className="text-green-800 font-medium">{Math.round(activityProgress.progress)}%</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${activityProgress.progress}%` }}
                />
              </div>
              <div className="text-xs text-green-600">{activityProgress.timeRemaining} minutes remaining</div>
            </div>
          </div>
        )}

        {/* Travel Warning */}
        {isTravel && (
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-center text-orange-800">
              <Clock className="w-6 h-6 mx-auto mb-2" />
              <p className="font-medium">Currently Travelling</p>
              <p className="text-sm text-orange-600">
                Activities will be available when you arrive at your destination.
              </p>
            </div>
          </div>
        )}

        {/* Available Shops */}
        {!isTravel && availableShops.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">
              Shops & Services
            </h4>
            <div className="space-y-2">
              {availableShops.map(shop => (
                <div key={shop.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-4 h-4 text-gray-600" />
                        <h5 className="font-medium">{shop.name}</h5>
                      </div>
                      <p className="text-sm text-gray-600">{shop.description}</p>
                      <div className="text-xs text-gray-500 mt-1">
                        Keeper: {shop.keeper} • {shop.items.length} items available
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onOpenShop?.(shop.id)}
                      disabled={disabled}
                      className="ml-3"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Shop
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Activities List */}
        {!hasActiveActivity && !isTravel && (
          <div>
            <h4 className="font-medium mb-3">Available Activities</h4>
            {availableActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <TreePine className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No activities available at this location.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableActivities.map(activity => {
                  const IconComponent = ACTIVITY_ICONS[activity.type] || TreePine;
                  const canStart = pet.currentEnergy >= activity.energyCost && pet.state !== "sleeping" && !disabled;
                  const duration = Math.ceil(activity.duration / 4); // Convert to minutes

                  return (
                    <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="w-4 h-4 text-gray-600" />
                            <h5 className="font-medium">{activity.name}</h5>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{activity.description}</p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {duration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {activity.energyCost} energy
                            </div>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{activity.type}</span>
                          </div>

                          {/* Potential Rewards */}
                          {activity.rewards.length > 0 && (
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Rewards: </span>
                              {activity.rewards.slice(0, 3).map((reward, index) => {
                                const chance = Math.round(reward.probability * 100);
                                let rewardText = "";

                                switch (reward.type) {
                                  case "gold":
                                    rewardText = `${reward.amount} gold (${chance}%)`;
                                    break;
                                  case "item":
                                    rewardText = `${reward.id} (${chance}%)`;
                                    break;
                                  case "experience":
                                    rewardText = `${reward.amount} exp (${chance}%)`;
                                    break;
                                }

                                return (
                                  <span key={index}>
                                    {rewardText}
                                    {index < Math.min(activity.rewards.length, 3) - 1 ? ", " : ""}
                                  </span>
                                );
                              })}
                              {activity.rewards.length > 3 && "..."}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => onStartActivity(activity.id)}
                          disabled={!canStart}
                          className="ml-3"
                        >
                          {!canStart && pet.currentEnergy < activity.energyCost
                            ? "No Energy"
                            : pet.state === "sleeping"
                              ? "Pet Sleeping"
                              : "Start"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Energy Warning */}
        {!hasActiveActivity && !isTravel && availableActivities.some(a => a.energyCost > pet.currentEnergy) && (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
            ⚡ Some activities require more energy than your pet currently has. Let them rest or use energy items to
            restore energy.
          </div>
        )}

        {/* Pet Sleeping Warning */}
        {pet.state === "sleeping" && !hasActiveActivity && (
          <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg">
            😴 Your pet is sleeping and cannot start new activities. Wake them up to begin exploring!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
