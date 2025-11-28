/**
 * Travel logic for moving between locations.
 */

import { updateQuestProgress } from "@/game/core/quests/quests";
import { areLocationsConnected, getLocation } from "@/game/data/locations";
import { toDisplay, toMicro } from "@/game/types/common";
import {
  ActivityState,
  GROWTH_STAGE_ORDER,
  type GrowthStage,
  getActivityConflictMessage,
} from "@/game/types/constants";
import type { GameState } from "@/game/types/gameState";
import type { LocationRequirement, TravelResult } from "@/game/types/location";
import { ObjectiveType } from "@/game/types/quest";

/**
 * Check if a growth stage meets or exceeds the required stage.
 */
function meetsStageRequirement(
  currentStage: GrowthStage,
  requiredStage: GrowthStage,
): boolean {
  const currentIndex = GROWTH_STAGE_ORDER.indexOf(currentStage);
  const requiredIndex = GROWTH_STAGE_ORDER.indexOf(requiredStage);
  // Return false if either stage is unknown
  if (currentIndex === -1 || requiredIndex === -1) {
    return false;
  }
  return currentIndex >= requiredIndex;
}

/**
 * Check if all requirements are met for a location.
 */
export function checkLocationRequirements(
  state: GameState,
  requirements: LocationRequirement | undefined,
): { met: boolean; reason?: string } {
  if (!requirements) {
    return { met: true };
  }

  // Check growth stage requirement
  if (requirements.stage) {
    if (!state.pet) {
      return {
        met: false,
        reason: "You need a pet to access this location.",
      };
    }
    if (!meetsStageRequirement(state.pet.growth.stage, requirements.stage)) {
      return {
        met: false,
        reason: `Your pet must be at least ${requirements.stage} stage to access this location.`,
      };
    }
  }

  // Check quest requirement
  if (requirements.questId) {
    const questCompleted = state.quests.some(
      (q) => q.questId === requirements.questId && q.state === "completed",
    );
    if (!questCompleted) {
      return {
        met: false,
        reason: "You need to complete a required quest first.",
      };
    }
  }

  // Skill requirements would be checked here when skills are implemented

  return { met: true };
}

/**
 * Calculate the energy cost to travel between two locations.
 */
export function calculateTravelCost(
  fromId: string,
  toId: string,
): number | null {
  const fromLocation = getLocation(fromId);
  if (!fromLocation) return null;

  const connection = fromLocation.connections.find(
    (conn) => conn.targetId === toId,
  );
  if (!connection) return null;

  const baseCost = connection.energyCost;
  const terrainModifier = connection.terrainModifier ?? 1;

  return Math.ceil(baseCost * terrainModifier);
}

/**
 * Check if the pet can travel to a destination.
 */
export function canTravel(
  state: GameState,
  destinationId: string,
): TravelResult {
  // Must have a pet
  if (!state.pet) {
    return { success: false, message: "You need a pet to travel." };
  }

  // Cannot travel while doing another activity
  if (state.pet.activityState !== ActivityState.Idle) {
    return {
      success: false,
      message: getActivityConflictMessage("travel", state.pet.activityState),
    };
  }

  const currentLocationId = state.player.currentLocationId;
  const destination = getLocation(destinationId);

  // Check destination exists
  if (!destination) {
    return { success: false, message: "Unknown destination." };
  }

  // Check locations are connected
  if (!areLocationsConnected(currentLocationId, destinationId)) {
    return {
      success: false,
      message: "You cannot travel there directly from here.",
    };
  }

  // Check requirements
  const requirementCheck = checkLocationRequirements(
    state,
    destination.requirements,
  );
  if (!requirementCheck.met) {
    return {
      success: false,
      message: requirementCheck.reason ?? "Requirements not met.",
    };
  }

  // Check energy cost
  const energyCost = calculateTravelCost(currentLocationId, destinationId);
  if (energyCost === null) {
    return { success: false, message: "Cannot calculate travel cost." };
  }

  const currentEnergy = toDisplay(state.pet.energyStats.energy);
  if (currentEnergy < energyCost) {
    return {
      success: false,
      message: `Not enough energy. Need ${energyCost}, have ${currentEnergy}.`,
      energyCost,
    };
  }

  return { success: true, message: "Ready to travel.", energyCost };
}

/**
 * Execute travel to a destination, consuming energy.
 */
export function travel(
  state: GameState,
  destinationId: string,
): { success: boolean; state: GameState; message: string } {
  const canTravelResult = canTravel(state, destinationId);

  if (!canTravelResult.success) {
    return { success: false, state, message: canTravelResult.message };
  }

  if (!state.pet || canTravelResult.energyCost === undefined) {
    return { success: false, state, message: "Invalid state." };
  }

  const energyCostMicro = toMicro(canTravelResult.energyCost);
  const destination = getLocation(destinationId);

  // Deduct energy and update location
  const newState: GameState = {
    ...state,
    pet: {
      ...state.pet,
      energyStats: {
        ...state.pet.energyStats,
        energy: Math.max(0, state.pet.energyStats.energy - energyCostMicro),
      },
    },
    player: {
      ...state.player,
      currentLocationId: destinationId,
    },
  };

  // Update quest progress for Visit objectives
  const stateWithQuestProgress = updateQuestProgress(
    newState,
    ObjectiveType.Visit,
    destinationId,
  );

  return {
    success: true,
    state: stateWithQuestProgress,
    message: `Traveled to ${destination?.name ?? destinationId}!`,
  };
}
