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

  const petName = state?.pet?.identity.name;
  const stage = state?.pet?.growth.stage;
  const training = state?.pet?.activeTraining;
  const explorationResult = state?.lastExplorationResult;

  // Detect stage transitions
  useEffect(() => {
    const currentStage = stage ?? null;
    const previousStage = previousStageRef.current;

    // Reset ref when pet is null (game reset or no pet yet)
    if (!petName) {
      previousStageRef.current = null;
      return;
    }

    if (currentStage && previousStage && currentStage !== previousStage) {
      setNotification({
        type: "stageTransition",
        previousStage: previousStage,
        newStage: currentStage,
        petName: petName,
      });
    }

    previousStageRef.current = currentStage;
  }, [stage, petName, setNotification]);

  // Detect training completion
  useEffect(() => {
    const currentTraining = training ?? null;
    const previousTraining = previousTrainingRef.current;

    // Reset ref when pet is null
    if (!petName) {
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
          petName: petName,
        });
      }
    }

    previousTrainingRef.current = currentTraining;
  }, [training, petName, setNotification]);

  // Detect exploration completion
  useEffect(() => {
    const currentResult = explorationResult ?? null;
    const previousResult = previousExplorationResultRef.current;

    // Reset ref when pet is null
    if (!petName) {
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
        petName: petName,
      });
    }

    previousExplorationResultRef.current = currentResult;
  }, [explorationResult, petName, setNotification]);
}
