/**
 * Centralized activity state and energy gating utilities.
 *
 * This module provides consistent blocking rules for actions that require:
 * - The pet to be idle (not sleeping, training, exploring, or battling)
 * - Sufficient energy to perform the action
 */

import { type MicroValue, toDisplay } from "@/game/types/common";
import {
  ActivityState,
  getActivityConflictMessage,
} from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";

/**
 * Result of an activity gating check.
 */
export interface ActivityGatingResult {
  /** Whether the action can proceed */
  allowed: boolean;
  /** Human-readable reason if blocked */
  message: string;
}

/**
 * Check if the pet is in an idle state and can start a new activity.
 *
 * @param pet - The pet to check
 * @param attemptedAction - Description of the action being attempted (e.g., "train", "forage", "feed")
 * @param sameActivityState - Optional: The activity state that matches the attempted action for clearer messaging
 */
export function checkActivityIdle(
  pet: Pet,
  attemptedAction: string,
  sameActivityState?: ActivityState,
): ActivityGatingResult {
  if (pet.activityState !== ActivityState.Idle) {
    return {
      allowed: false,
      message: getActivityConflictMessage(
        attemptedAction,
        pet.activityState,
        sameActivityState,
      ),
    };
  }
  return { allowed: true, message: "" };
}

/**
 * Check if the pet has sufficient energy for an action.
 *
 * @param currentEnergy - Current energy in micro-units
 * @param requiredEnergy - Required energy in display units
 */
export function checkEnergy(
  currentEnergy: MicroValue,
  requiredEnergy: number,
): ActivityGatingResult {
  const displayEnergy = toDisplay(currentEnergy);
  if (displayEnergy < requiredEnergy) {
    return {
      allowed: false,
      message: `Not enough energy. Need ${requiredEnergy}, have ${displayEnergy}.`,
    };
  }
  return { allowed: true, message: "" };
}

/**
 * Combined check for activity idle state and energy requirements.
 *
 * @param pet - The pet to check
 * @param attemptedAction - Description of the action being attempted
 * @param requiredEnergy - Required energy in display units (optional, skip energy check if not provided)
 * @param sameActivityState - Optional: The activity state that matches the attempted action
 */
export function checkActivityRequirements(
  pet: Pet,
  attemptedAction: string,
  requiredEnergy?: number,
  sameActivityState?: ActivityState,
): ActivityGatingResult {
  // First check activity state
  const activityCheck = checkActivityIdle(
    pet,
    attemptedAction,
    sameActivityState,
  );
  if (!activityCheck.allowed) {
    return activityCheck;
  }

  // Then check energy if required
  if (requiredEnergy !== undefined) {
    const energyCheck = checkEnergy(pet.energyStats.energy, requiredEnergy);
    if (!energyCheck.allowed) {
      return energyCheck;
    }
  }

  return { allowed: true, message: "" };
}
