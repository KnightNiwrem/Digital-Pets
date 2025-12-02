/**
 * Activity types for training and other timed activities.
 */

import type { Tick } from "./common";
import type { GrowthStage } from "./constants";
import type { BattleStats } from "./stats";

/**
 * Training session types with increasing intensity.
 */
export const TrainingSessionType = {
  Basic: "basic",
  Intensive: "intensive",
  Advanced: "advanced",
} as const;

export type TrainingSessionType =
  (typeof TrainingSessionType)[keyof typeof TrainingSessionType];

/**
 * Battle stat keys that can be trained.
 */
export type TrainableStat = keyof BattleStats;

/**
 * Training facility type that determines which stats are trained.
 */
export const TrainingFacilityType = {
  Strength: "strength",
  Endurance: "endurance",
  Agility: "agility",
  Precision: "precision",
  Fortitude: "fortitude",
  Cunning: "cunning",
} as const;

export type TrainingFacilityType =
  (typeof TrainingFacilityType)[keyof typeof TrainingFacilityType];

/**
 * Training session configuration.
 */
export interface TrainingSession {
  /** Session type identifier */
  type: TrainingSessionType;
  /** Display name */
  name: string;
  /** Description of the training */
  description: string;
  /** Duration in ticks */
  durationTicks: Tick;
  /** Energy cost (in display units) */
  energyCost: number;
  /** Primary stat gain amount */
  primaryStatGain: number;
  /** Secondary stat gain amount */
  secondaryStatGain: number;
  /** Minimum growth stage required (if any) */
  minStage?: GrowthStage;
}

/**
 * Training facility definition.
 */
export interface TrainingFacility {
  /** Unique facility identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of the facility */
  description: string;
  /** Facility type determining stats trained */
  facilityType: TrainingFacilityType;
  /** Primary stat trained */
  primaryStat: TrainableStat;
  /** Secondary stat trained */
  secondaryStat: TrainableStat;
  /** Available training sessions at this facility */
  sessions: TrainingSession[];
  /** Emoji icon for display */
  emoji: string;
}

/**
 * Active training state stored on the pet.
 */
export interface ActiveTraining {
  /** Facility ID where training is occurring */
  facilityId: string;
  /** Session type being performed */
  sessionType: TrainingSessionType;
  /** Tick when training started */
  startTick: Tick;
  /** Total ticks required */
  durationTicks: Tick;
  /** Ticks remaining */
  ticksRemaining: Tick;
  /** Energy cost paid to start (in micro units, for refund on cancel) */
  energyCost: number;
}

/**
 * Training completion result.
 */
export interface TrainingResult {
  /** Whether training completed successfully */
  success: boolean;
  /** Message describing the result */
  message: string;
  /** Stats gained (if successful) */
  statsGained?: Partial<BattleStats>;
}

/**
 * A single item drop from exploration.
 */
export interface ExplorationDrop {
  /** Item ID that was found */
  itemId: string;
  /** Quantity found */
  quantity: number;
}

/**
 * Active exploration state stored on the pet.
 */
export interface ActiveExploration {
  /** Activity ID being performed */
  activityId: string;
  /** Location ID where exploration is occurring */
  locationId: string;
  /** Tick when exploration started */
  startTick: Tick;
  /** Total ticks required */
  durationTicks: Tick;
  /** Ticks remaining */
  ticksRemaining: Tick;
  /** Energy cost paid to start (in micro units, for refund on cancel) */
  energyCost: number;
}

/**
 * Exploration completion result.
 */
export interface ExplorationResult {
  /** Whether exploration completed successfully */
  success: boolean;
  /** Message describing the result */
  message: string;
  /** Items found during exploration */
  itemsFound: ExplorationDrop[];
}
