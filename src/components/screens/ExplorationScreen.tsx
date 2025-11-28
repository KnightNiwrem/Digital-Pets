/**
 * Exploration screen for foraging and exploring wild areas.
 */

import { useState } from "react";
import { ActivitySelect, ExplorationProgress } from "@/components/exploration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorDialog } from "@/components/ui/error-dialog";
import { forceEncounter } from "@/game/core/exploration/encounter";
import {
  canStartForaging,
  getLocationForageInfo,
} from "@/game/core/exploration/forage";
import { getLocation } from "@/game/data/locations";
import { useGameState } from "@/game/hooks/useGameState";
import {
  cancelExploration,
  startForaging,
} from "@/game/state/actions/exploration";
import { toDisplay } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import { FacilityType, LocationType } from "@/game/types/location";

/**
 * Main exploration screen component.
 */
export function ExplorationScreen({
  onStartBattle,
}: {
  onStartBattle?: (enemySpeciesId: string, enemyLevel: number) => void;
}) {
  const { state, isLoading, actions } = useGameState();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state?.pet) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No pet to explore with.</p>
      </div>
    );
  }

  const pet = state.pet;
  const currentEnergy = toDisplay(pet.energyStats.energy);
  const activityState = pet.activityState;
  const isExploring = activityState === ActivityState.Exploring;
  const isIdle = activityState === ActivityState.Idle;
  const currentLocation = getLocation(state.player.currentLocationId);
  const forageInfo = getLocationForageInfo(state.player.currentLocationId);

  // Check if current location is a wild area
  const isWildArea = currentLocation?.type === LocationType.Wild;

  // Check if location has battle area
  const hasBattleArea = currentLocation?.facilities?.includes(
    FacilityType.BattleArea,
  );

  // Get foraging availability (only when idle, otherwise show activity status)
  const forageCheck = isIdle
    ? canStartForaging(pet, state.player.currentLocationId)
    : { canForage: false, message: "" };

  // Handle starting foraging
  const handleStartForage = () => {
    const result = startForaging(state);
    if (result.success) {
      actions.updateState(() => result.state);
    }
    // Error case should not happen since we hide the activities when not idle
  };

  // Handle canceling exploration
  const handleCancelExploration = () => {
    const result = cancelExploration(state);
    if (result.success) {
      actions.updateState(() => result.state);
    }
  };

  // Handle seeking battle
  const handleSeekBattle = () => {
    if (!pet || !onStartBattle) return;

    const encounterResult = forceEncounter(state.player.currentLocationId, pet);
    if (encounterResult.hasEncounter && encounterResult.speciesId) {
      onStartBattle(encounterResult.speciesId, encounterResult.level ?? 1);
    } else {
      setErrorMessage("No wild pets found in this area.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Location & Energy Header */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {currentLocation?.emoji ?? "📍"}
                </span>
                <CardTitle className="text-lg">
                  {currentLocation?.name ?? "Unknown Location"}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span className="text-lg">⚡</span>
                <span className="font-medium">{currentEnergy}</span>
              </div>
            </div>
          </CardHeader>
          {isIdle && (
            <CardContent>
              {isWildArea ? (
                <p className="text-sm text-muted-foreground">
                  Explore this wild area to find useful items. Activities cost
                  energy and take time to complete.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Travel to a wild area to explore and forage for items.
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Active Exploration Progress */}
        {isExploring && pet.activeExploration && (
          <ExplorationProgress
            exploration={pet.activeExploration}
            onCancel={handleCancelExploration}
          />
        )}

        {/* Activity Blocking Status */}
        {activityState === ActivityState.Sleeping && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                <span className="text-2xl">💤</span>
                <span className="font-medium">Your pet is sleeping...</span>
              </div>
              <p className="text-center text-sm text-blue-600 dark:text-blue-400 mt-2">
                Wake up your pet to start exploring.
              </p>
            </CardContent>
          </Card>
        )}

        {activityState === ActivityState.Training && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
                <span className="text-2xl">💪</span>
                <span className="font-medium">Your pet is training...</span>
              </div>
              <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
                Cancel training or wait for it to complete before exploring.
              </p>
            </CardContent>
          </Card>
        )}

        {activityState === ActivityState.Battling && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
                <span className="text-2xl">⚔️</span>
                <span className="font-medium">Your pet is battling...</span>
              </div>
              <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2">
                Complete the battle before exploring.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Exploration Activities */}
        {isIdle && isWildArea && (
          <>
            <h2 className="text-lg font-semibold px-1">Activities</h2>
            <ActivitySelect
              forageInfo={forageInfo}
              currentEnergy={currentEnergy}
              canForage={forageCheck.canForage}
              forageMessage={forageCheck.message}
              onStartForage={handleStartForage}
            />

            {/* Battle Option */}
            {hasBattleArea && onStartBattle && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>⚔️</span>
                    Seek Battle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Search for wild pets to battle in this area.
                  </p>
                  <Button onClick={handleSeekBattle} className="w-full">
                    🔍 Find Wild Pet
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Not in a wild area message */}
        {!isWildArea && isIdle && (
          <Card>
            <CardContent className="pt-6 text-center">
              <span className="text-4xl">🏠</span>
              <p className="text-sm text-muted-foreground mt-2">
                You need to be in a wild area to explore.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Use the Map to travel to a wild location.
              </p>
            </CardContent>
          </Card>
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
