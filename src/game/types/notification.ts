/**
 * Types for game notifications.
 */

import type { GrowthStage } from "./constants";

/**
 * Notification for stage transition.
 */
export interface StageTransitionNotification {
  type: "stageTransition";
  /** Previous growth stage */
  previousStage: GrowthStage;
  /** New growth stage */
  newStage: GrowthStage;
  /** Pet name */
  petName: string;
}

/**
 * Union type for all notification types.
 */
export type GameNotification = StageTransitionNotification;
