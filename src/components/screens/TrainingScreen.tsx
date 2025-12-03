/**
 * Training screen for training the pet's battle stats.
 */

import {
  ActivityBlockedCard,
  getActivityBlockingInfo,
} from "@/components/shared";
import {
  FacilityCard,
  StatsDisplay,
  TrainingProgress,
} from "@/components/training";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { getAllFacilities } from "@/game/data/facilities";
import { useGameState } from "@/game/hooks/useGameState";
import { cancelTraining, startTraining } from "@/game/state/actions/training";
import { selectPet } from "@/game/state/selectors";
import type { TrainingSessionType } from "@/game/types/activity";
import { toDisplay } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";

/**
 * Main training screen component.
 */
export function TrainingScreen() {
  const { state, isLoading, actions } = useGameState();

  // Get all facilities
  const facilities = getAllFacilities();

  if (isLoading) {
    return <LoadingState />;
  }

  const pet = state ? selectPet(state) : null;

  if (!state || !pet) {
    return <EmptyState message="No pet to train." />;
  }

  const currentEnergy = toDisplay(pet.energyStats.energy);
  const isTraining = pet.activityState === ActivityState.Training;
  const isBlocked = pet.activityState !== ActivityState.Idle;
  const blockingInfo = getActivityBlockingInfo(pet, "train");

  // Handle starting a training session
  const handleStartTraining = (
    facilityId: string,
    sessionType: TrainingSessionType,
  ) => {
    const result = startTraining(state, facilityId, sessionType);
    if (result.success) {
      actions.updateState(() => result.state);
    }
  };

  // Handle canceling training
  const handleCancelTraining = () => {
    const result = cancelTraining(state);
    if (result.success) {
      actions.updateState(() => result.state);
    }
  };

  return (
    <div className="space-y-4">
      {/* Energy Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Training</CardTitle>
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <span className="text-lg">⚡</span>
              <span className="font-medium">{currentEnergy}</span>
            </div>
          </div>
        </CardHeader>
        {!isTraining && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Train your pet to improve battle stats. Each session costs energy
              and takes time to complete.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Activity Blocking Status */}
      {blockingInfo && !isTraining && (
        <ActivityBlockedCard blockingInfo={blockingInfo} />
      )}

      {/* Active Training Progress */}
      {isTraining && pet.activeTraining && (
        <TrainingProgress
          training={pet.activeTraining}
          onCancel={handleCancelTraining}
        />
      )}

      {/* Battle Stats Overview */}
      <StatsDisplay battleStats={pet.battleStats} />

      {/* Training Facilities */}
      {!isBlocked && (
        <>
          <h2 className="text-lg font-semibold px-1">Training Facilities</h2>
          {facilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              petStage={pet.growth.stage}
              currentEnergy={currentEnergy}
              isTraining={isTraining}
              onSelectSession={handleStartTraining}
            />
          ))}
        </>
      )}
    </div>
  );
}
