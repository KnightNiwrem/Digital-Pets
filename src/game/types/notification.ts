/**
 * Types for game notifications.
 */

import type { GrowthStage } from "./constants";
import type { BattleStats } from "./stats";

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
 * Notification for training completion.
 */
export interface TrainingCompleteNotification {
  type: "trainingComplete";
  /** Facility name */
  facilityName: string;
  /** Stats gained from training */
  statsGained: Partial<BattleStats>;
  /** Pet name */
  petName: string;
}

/**
 * Union type for all notification types.
 */
export type GameNotification =
  | StageTransitionNotification
  | TrainingCompleteNotification;
