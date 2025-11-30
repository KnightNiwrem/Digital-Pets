import { useEffect, useRef } from "react";
import { getFacility, getSession } from "@/game/data/facilities";
import type {
  ActiveTraining,
  ExplorationResult,
  GameNotification,
  GameState,
  GrowthStage,
} from "@/game/types";

/**
 * Hook to handle side effects and generate notifications based on state changes.
 *
 * @param state The current game state
 * @param setNotification callback to set a new notification
 */
export function useGameNotifications(
  state: GameState | null,
  setNotification: (notification: GameNotification) => void,
) {
  const previousStageRef = useRef<GrowthStage | null>(null);
  const previousTrainingRef = useRef<ActiveTraining | null>(null);
  const previousExplorationResultRef = useRef<
    (ExplorationResult & { locationName: string }) | null
  >(null);

  // Detect stage transitions
  useEffect(() => {
    const currentStage = state?.pet?.growth.stage ?? null;
    const previousStage = previousStageRef.current;

    // Reset ref when pet is null (game reset or no pet yet)
    if (!state?.pet) {
      previousStageRef.current = null;
      return;
    }

    if (currentStage && previousStage && currentStage !== previousStage) {
      setNotification({
        type: "stageTransition",
        previousStage: previousStage,
        newStage: currentStage,
        petName: state.pet.identity.name,
      });
    }

    previousStageRef.current = currentStage;
  }, [state?.pet, setNotification]);

  // Detect training completion
  useEffect(() => {
    const currentTraining = state?.pet?.activeTraining ?? null;
    const previousTraining = previousTrainingRef.current;

    // Reset ref when pet is null
    if (!state?.pet) {
      previousTrainingRef.current = null;
      return;
    }

    // Training completed: was training before, not training now, and was on last tick
    // If ticksRemaining > 1, training was cancelled, not completed
    const wasNaturalCompletion =
      previousTraining &&
      !currentTraining &&
      previousTraining.ticksRemaining <= 1;

    if (wasNaturalCompletion) {
      const facility = getFacility(previousTraining.facilityId);
      const session = getSession(
        previousTraining.facilityId,
        previousTraining.sessionType,
      );

      if (facility && session) {
        const statsGained: Record<string, number> = {
          [facility.primaryStat]: session.primaryStatGain,
        };
        if (session.secondaryStatGain > 0) {
          statsGained[facility.secondaryStat] = session.secondaryStatGain;
        }

        setNotification({
          type: "trainingComplete",
          facilityName: facility.name,
          statsGained,
          petName: state.pet.identity.name,
        });
      }
    }

    previousTrainingRef.current = currentTraining;
  }, [state?.pet, setNotification]);

  // Detect exploration completion
  useEffect(() => {
    const currentResult = state?.lastExplorationResult ?? null;
    const previousResult = previousExplorationResultRef.current;

    // Reset ref when pet is null
    if (!state?.pet) {
      previousExplorationResultRef.current = null;
      return;
    }

    // Only show notification for new results (avoid duplicates on re-renders)
    if (currentResult && currentResult !== previousResult) {
      setNotification({
        type: "explorationComplete",
        locationName: currentResult.locationName,
        itemsFound: currentResult.itemsFound,
        message: currentResult.message,
        petName: state.pet.identity.name,
      });
    }

    previousExplorationResultRef.current = currentResult;
  }, [state?.lastExplorationResult, state?.pet, setNotification]);
}
