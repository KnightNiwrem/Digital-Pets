/**
 * Training screen for training the pet's battle stats.
 */

import { ActivityStatusCard } from "@/components/game";
import {
  FacilityCard,
  StatsDisplay,
  TrainingProgress,
} from "@/components/training";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllFacilities } from "@/game/data/facilities";
import { useGameState } from "@/game/hooks/useGameState";
import { cancelTraining, startTraining } from "@/game/state/actions/training";
import type { TrainingSessionType } from "@/game/types/activity";
import { toDisplay } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";

/**
 * Messages for each activity state blocking training.
 */
const TRAINING_BLOCKED_MESSAGES: Record<ActivityState, string> = {
  [ActivityState.Idle]: "",
  [ActivityState.Sleeping]: "Wake up your pet to start training.",
  [ActivityState.Training]: "",
  [ActivityState.Exploring]:
    "Cancel exploration or wait for it to complete before training.",
  [ActivityState.Battling]: "Complete the battle before training.",
};

/**
 * Main training screen component.
 */
export function TrainingScreen() {
  const { state, isLoading, actions } = useGameState();

  // Get all facilities
  const facilities = getAllFacilities();

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
        <p className="text-muted-foreground">No pet to train.</p>
      </div>
    );
  }

  const pet = state.pet;
  const currentEnergy = toDisplay(pet.energyStats.energy);
  const activityState = pet.activityState;
  const isTraining = activityState === ActivityState.Training;
  const isIdle = activityState === ActivityState.Idle;
  const canStartTraining = isIdle;

  // Handle starting a training session
  const handleStartTraining = (
    facilityId: string,
    sessionType: TrainingSessionType,
  ) => {
    const result = startTraining(state, facilityId, sessionType);
    if (result.success) {
      actions.updateState(() => result.state);
    }
    // Error case should not happen since we hide the buttons when not idle
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
        {isIdle && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Train your pet to improve battle stats. Each session costs energy
              and takes time to complete.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Active Training Progress */}
      {isTraining && pet.activeTraining && (
        <TrainingProgress
          training={pet.activeTraining}
          onCancel={handleCancelTraining}
        />
      )}

      {/* Activity Blocking Status */}
      <ActivityStatusCard
        activityState={activityState}
        message={TRAINING_BLOCKED_MESSAGES[activityState]}
      />

      {/* Battle Stats Overview */}
      <StatsDisplay battleStats={pet.battleStats} />

      {/* Training Facilities */}
      {canStartTraining && (
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
