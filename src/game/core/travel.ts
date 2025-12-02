/**
 * Travel logic for moving between locations.
 */

import { checkActivityIdle, checkEnergy } from "@/game/core/activityGating";
import { updateQuestProgress } from "@/game/core/quests/quests";
import { areLocationsConnected, getLocation } from "@/game/data/locations";
import { TravelMessages } from "@/game/data/messages";
import { toMicro } from "@/game/types/common";
import {
  GROWTH_STAGE_DISPLAY_NAMES,
  GROWTH_STAGE_ORDER,
  type GrowthStage,
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
        reason: TravelMessages.petRequired,
      };
    }
    if (!meetsStageRequirement(state.pet.growth.stage, requirements.stage)) {
      return {
        met: false,
        reason: TravelMessages.requiresStage(
          GROWTH_STAGE_DISPLAY_NAMES[requirements.stage],
        ),
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
        reason: "Quest required",
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
    return { success: false, message: TravelMessages.petRequired };
  }

  const currentLocationId = state.player.currentLocationId;
  const destination = getLocation(destinationId);

  // Check destination exists
  if (!destination) {
    return { success: false, message: TravelMessages.unknownDestination };
  }

  // Check locations are connected
  if (!areLocationsConnected(currentLocationId, destinationId)) {
    return {
      success: false,
      message: TravelMessages.notConnected,
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
      message: requirementCheck.reason ?? TravelMessages.requirementsNotMet,
    };
  }

  // Check energy cost
  const energyCost = calculateTravelCost(currentLocationId, destinationId);
  if (energyCost === null) {
    return { success: false, message: TravelMessages.cannotCalculateCost };
  }

  // Check activity state (after calculating energy cost so it's included in response)
  const activityCheck = checkActivityIdle(state.pet, "travel");
  if (!activityCheck.allowed) {
    return { success: false, message: activityCheck.message, energyCost };
  }

  const energyCheck = checkEnergy(state.pet.energyStats.energy, energyCost);
  if (!energyCheck.allowed) {
    return {
      success: false,
      message: energyCheck.message,
      energyCost,
    };
  }

  return { success: true, message: TravelMessages.readyToTravel, energyCost };
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
    return { success: false, state, message: TravelMessages.invalidState };
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
    message: TravelMessages.traveledTo(destination?.name ?? destinationId),
  };
}
