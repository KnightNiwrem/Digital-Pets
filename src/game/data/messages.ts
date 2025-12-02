/**
 * Centralized message registry for user-facing strings.
 *
 * This module provides consistent, translatable messages for:
 * - Error messages
 * - Status updates
 * - Activity feedback
 *
 * All user-facing strings should be defined here for:
 * - Consistency across the codebase
 * - Easy future localization/i18n support
 * - Single source of truth for UI text
 */

import type { MicroValue } from "@/game/types/common";
import { toDisplay } from "@/game/types/common";
import {
  type ActivityState,
  getActivityDisplayName,
} from "@/game/types/constants";

/**
 * Sleep-related messages.
 */
export const SleepMessages = {
  /** When attempting to put an already sleeping pet to sleep */
  alreadySleeping: "Pet is already sleeping.",
  /** When successfully putting a pet to sleep */
  nowSleeping: "Pet is now sleeping.",
  /** When attempting to wake an already awake pet */
  alreadyAwake: "Pet is already awake.",
  /** When successfully waking a pet */
  nowAwake: "Pet is now awake.",
} as const;

/**
 * Energy-related messages.
 */
export const EnergyMessages = {
  /**
   * Generate a message for insufficient energy.
   * @param required - Required energy in display units
   * @param current - Current energy in micro-units
   */
  notEnoughEnergy: (required: number, current: MicroValue): string =>
    `Not enough energy. Need ${required}, have ${toDisplay(current)}.`,
} as const;

/**
 * Activity conflict messages.
 */
export const ActivityMessages = {
  /**
   * Generate a message when the pet is already doing the same activity.
   * @param activity - The current activity state
   */
  alreadyDoingActivity: (activity: ActivityState): string =>
    `Your pet is already ${getActivityDisplayName(activity)}.`,

  /**
   * Generate a message when an action cannot be performed due to current activity.
   * @param attemptedAction - The action being attempted
   * @param currentActivity - The pet's current activity state
   */
  cannotPerformWhileBusy: (
    attemptedAction: string,
    currentActivity: ActivityState,
  ): string =>
    `Cannot ${attemptedAction} while ${getActivityDisplayName(currentActivity)}.`,
} as const;
