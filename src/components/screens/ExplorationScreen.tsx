/**
 * Exploration screen for foraging and exploring wild areas.
 */

import { useState } from "react";
import {
  ActivitySelect,
  ExplorationProgress,
  ResultsPanel,
} from "@/components/exploration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorDialog } from "@/components/ui/error-dialog";
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
import type { ExplorationDrop } from "@/game/types/activity";
import { toDisplay } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import { LocationType } from "@/game/types/location";

/**
 * Main exploration screen component.
 */
export function ExplorationScreen() {
  const { state, isLoading, actions } = useGameState();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [explorationResults, setExplorationResults] = useState<{
    message: string;
    itemsFound: ExplorationDrop[];
  } | null>(null);

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
  const isExploring = pet.activityState === ActivityState.Exploring;
  const currentLocation = getLocation(state.player.currentLocationId);
  const forageInfo = getLocationForageInfo(state.player.currentLocationId);

  // Check if current location is a wild area
  const isWildArea = currentLocation?.type === LocationType.Wild;

  // Get foraging availability
  const forageCheck = canStartForaging(pet, state.player.currentLocationId);

  // Handle starting foraging
  const handleStartForage = () => {
    const result = startForaging(state);
    if (result.success) {
      actions.updateState(() => result.state);
    } else {
      setErrorMessage(result.message);
    }
  };

  // Handle canceling exploration
  const handleCancelExploration = () => {
    const result = cancelExploration(state);
    if (result.success) {
      actions.updateState(() => result.state);
    } else {
      setErrorMessage(result.message);
    }
  };

  // Handle closing results panel
  const handleCloseResults = () => {
    setExplorationResults(null);
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
          {!isExploring && !explorationResults && (
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

        {/* Exploration Results */}
        {explorationResults && (
          <ResultsPanel
            itemsFound={explorationResults.itemsFound}
            message={explorationResults.message}
            onClose={handleCloseResults}
          />
        )}

        {/* Active Exploration Progress */}
        {isExploring && pet.activeExploration && (
          <ExplorationProgress
            exploration={pet.activeExploration}
            onCancel={handleCancelExploration}
          />
        )}

        {/* Exploration Activities */}
        {!isExploring && !explorationResults && isWildArea && (
          <>
            <h2 className="text-lg font-semibold px-1">Activities</h2>
            <ActivitySelect
              forageInfo={forageInfo}
              currentEnergy={currentEnergy}
              canForage={forageCheck.canForage}
              forageMessage={forageCheck.message}
              onStartForage={handleStartForage}
            />
          </>
        )}

        {/* Not in a wild area message */}
        {!isWildArea && !isExploring && (
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
