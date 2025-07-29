// React hook for world system interactions

import { useCallback } from "react";
import { WorldSystem } from "@/systems/WorldSystem";
import type { Pet, WorldState, GameState, Location, Activity } from "@/types";

interface UseWorldStateProps {
  pet: Pet | null;
  worldState: WorldState;
  updateGameState: (updater: (prev: GameState) => GameState) => void;
  disabled?: boolean;
}

interface UseWorldStateReturn {
  // Travel functions
  startTravel: (destinationId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  getTravelProgress: () => number;
  isTravel: boolean;

  // Activity functions
  startActivity: (activityId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  cancelActivity: () => Promise<{ success: boolean; message?: string; error?: string }>;
  getActivityProgress: () => { activity: Activity | undefined; progress: number; timeRemaining: number };
  hasActiveActivity: boolean;

  // Location functions
  getCurrentLocation: () => Location | null;
  getAvailableDestinations: () => Location[];
  getAvailableLocations: () => Location[];

  // State
  worldState: WorldState;
  disabled: boolean;
}

export function useWorldState({
  pet,
  worldState,
  updateGameState,
  disabled = false,
}: UseWorldStateProps): UseWorldStateReturn {
  const startTravel = useCallback(
    async (destinationId: string) => {
      if (!pet || disabled) {
        return { success: false, error: "Cannot travel at this time" };
      }

      const result = WorldSystem.startTravel(worldState, pet, destinationId);

      if (result.success && result.data) {
        updateGameState((prev: GameState) => ({
          ...prev,
          world: result.data!.worldState,
          currentPet: result.data!.pet,
        }));

        return {
          success: true,
          message: result.message || "Travel started successfully",
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    },
    [pet, worldState, updateGameState, disabled]
  );

  const startActivity = useCallback(
    async (activityId: string) => {
      if (!pet || disabled) {
        return { success: false, error: "Cannot start activity at this time" };
      }

      const result = WorldSystem.startActivity(worldState, pet, activityId);

      if (result.success && result.data) {
        updateGameState((prev: GameState) => ({
          ...prev,
          world: result.data!.worldState,
          currentPet: result.data!.pet,
        }));

        return {
          success: true,
          message: result.message || "Activity started successfully",
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    },
    [pet, worldState, updateGameState, disabled]
  );

  const cancelActivity = useCallback(async () => {
    if (!pet || disabled) {
      return { success: false, error: "Cannot cancel activity at this time" };
    }

    const result = WorldSystem.cancelActivity(worldState, pet.id);

    if (result.success && result.data) {
      updateGameState((prev: GameState) => ({
        ...prev,
        world: result.data!,
      }));

      return {
        success: true,
        message: result.message || "Activity cancelled successfully",
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  }, [pet, worldState, updateGameState, disabled]);

  const getTravelProgress = useCallback(() => {
    return WorldSystem.getTravelProgress(worldState);
  }, [worldState]);

  const getActivityProgress = useCallback(() => {
    if (!pet) {
      return { activity: undefined, progress: 0, timeRemaining: 0 };
    }
    return WorldSystem.getActivityProgress(worldState, pet.id);
  }, [worldState, pet]);

  const getCurrentLocation = useCallback(() => {
    return WorldSystem.getCurrentLocation(worldState) || null;
  }, [worldState]);

  const getAvailableDestinations = useCallback(() => {
    if (!pet) return [];
    const result = WorldSystem.getAvailableDestinations(worldState, pet);
    return result.success && result.data ? result.data : [];
  }, [worldState, pet]);

  const getAvailableLocations = useCallback(() => {
    return WorldSystem.getAvailableLocations(worldState);
  }, [worldState]);

  // Computed state
  const isTravel = worldState.travelState !== undefined;
  const activityProgress = getActivityProgress();
  const hasActiveActivity = activityProgress.activity !== undefined;

  return {
    // Travel functions
    startTravel,
    getTravelProgress,
    isTravel,

    // Activity functions
    startActivity,
    cancelActivity,
    getActivityProgress,
    hasActiveActivity,

    // Location functions
    getCurrentLocation,
    getAvailableDestinations,
    getAvailableLocations,

    // State
    worldState,
    disabled,
  };
}
