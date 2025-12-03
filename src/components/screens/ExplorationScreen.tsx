/**
 * Exploration screen for exploring wild areas and gathering resources.
 * Uses the activity-based exploration system with requirements, cooldowns, and drop tables.
 */

import { useMemo } from "react";
import {
  ActivitySelect,
  type ActivityStatus,
  ExplorationProgress,
} from "@/components/exploration";
import { LocationHeader } from "@/components/map";
import {
  ActivityBlockedCard,
  getActivityBlockingInfo,
} from "@/components/ui/ActivityBlockedCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forceEncounter } from "@/game/core/exploration/encounter";
import {
  canStartExplorationActivity,
  getActivityCooldownRemaining,
  getAvailableActivities,
} from "@/game/core/exploration/exploration";
import { getLocation } from "@/game/data/locations";
import { useGameState } from "@/game/hooks/useGameState";
import {
  cancelExploration,
  startExploration,
} from "@/game/state/actions/exploration";
import {
  selectCurrentLocationId,
  selectPet,
  selectSkills,
  selectTotalTicks,
} from "@/game/state/selectors";
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

  // All hooks must be called unconditionally before any early returns
  const pet = state ? selectPet(state) : null;
  const currentLocationId = state ? selectCurrentLocationId(state) : "home";
  const currentTick = state ? selectTotalTicks(state) : 0;
  const skills = state ? selectSkills(state) : null;
  const currentLocation = getLocation(currentLocationId);

  // Get completed quest IDs for requirement checking (memoized for performance)
  const completedQuestIds = useMemo(
    () =>
      state?.quests
        .filter((q) => q.state === "completed")
        .map((q) => q.questId) ?? [],
    [state?.quests],
  );

  // Get available activities for this location with their status (memoized for performance)
  const availableActivities = useMemo(
    () => getAvailableActivities(currentLocationId),
    [currentLocationId],
  );

  const activityStatuses: ActivityStatus[] = useMemo(() => {
    if (!pet || !skills) return [];
    return availableActivities.map((activity) => {
      const canStart = canStartExplorationActivity(
        pet,
        skills,
        completedQuestIds,
        currentLocationId,
        activity.id,
        currentTick,
      );
      const cooldownRemaining = getActivityCooldownRemaining(
        pet,
        currentLocationId,
        activity.id,
        currentTick,
      );
      return {
        activity,
        canStart,
        cooldownRemaining,
      };
    });
  }, [
    availableActivities,
    pet,
    skills,
    completedQuestIds,
    currentLocationId,
    currentTick,
  ]);

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state || !pet) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No pet to explore with.</p>
      </div>
    );
  }

  const currentEnergy = toDisplay(pet.energyStats.energy);
  const isExploring = pet.activityState === ActivityState.Exploring;
  const isBlocked = pet.activityState !== ActivityState.Idle;
  const blockingInfo = getActivityBlockingInfo(pet, "explore");

  // Check if current location is a wild area
  const isWildArea = currentLocation?.type === LocationType.Wild;

  // Check if location has battle area
  const hasBattleArea = currentLocation?.facilities?.includes(
    FacilityType.BattleArea,
  );

  // Handle starting exploration
  const handleStartActivity = (activityId: string) => {
    const result = startExploration(
      state,
      currentLocationId,
      activityId,
      currentTick,
    );
    if (result.success) {
      actions.updateState(() => result.state);
    }
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

    const encounterResult = forceEncounter(currentLocationId, pet);
    if (encounterResult.hasEncounter && encounterResult.speciesId) {
      onStartBattle(encounterResult.speciesId, encounterResult.level ?? 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Location & Energy Header */}
      <LocationHeader location={currentLocation} currentEnergy={currentEnergy}>
        {!isExploring &&
          (isWildArea ? (
            <p className="text-sm text-muted-foreground">
              Explore this wild area to find useful items. Activities cost
              energy and take time to complete.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Travel to a wild area to explore and forage for items.
            </p>
          ))}
      </LocationHeader>

      {/* Activity Blocking Status */}
      {blockingInfo && !isExploring && (
        <ActivityBlockedCard blockingInfo={blockingInfo} />
      )}

      {/* Active Exploration Progress */}
      {isExploring && pet.activeExploration && (
        <ExplorationProgress
          exploration={pet.activeExploration}
          onCancel={handleCancelExploration}
        />
      )}

      {/* Exploration Activities */}
      {!isBlocked && isWildArea && (
        <>
          <h2 className="text-lg font-semibold px-1">Activities</h2>
          <ActivitySelect
            activities={activityStatuses}
            currentEnergy={currentEnergy}
            onStartActivity={handleStartActivity}
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
                  Find Wild Pet
                </Button>
              </CardContent>
            </Card>
          )}
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
  );
}
