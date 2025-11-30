/**
 * Game event types for the event bus system.
 *
 * Events are transient notifications emitted by actions and the game tick.
 * They replace state-diffing for detecting "one-off" occurrences like
 * training completion, exploration results, or stage transitions.
 */

import type { ExplorationDrop } from "./activity";
import type { GrowthStage } from "./constants";
import type { BattleStats } from "./stats";

/**
 * Base event interface.
 */
interface BaseGameEvent {
  /** Unique event type identifier */
  type: string;
  /** Timestamp when the event occurred */
  timestamp: number;
}

/**
 * Event emitted when a pet evolves to a new growth stage.
 */
export interface StageTransitionEvent extends BaseGameEvent {
  type: "stageTransition";
  previousStage: GrowthStage;
  newStage: GrowthStage;
  petName: string;
}

/**
 * Event emitted when training completes.
 */
export interface TrainingCompleteEvent extends BaseGameEvent {
  type: "trainingComplete";
  facilityName: string;
  statsGained: Partial<BattleStats>;
  petName: string;
}

/**
 * Event emitted when exploration completes.
 */
export interface ExplorationCompleteEvent extends BaseGameEvent {
  type: "explorationComplete";
  locationName: string;
  itemsFound: ExplorationDrop[];
  message: string;
  petName: string;
}

/**
 * Event emitted when a care action is performed.
 */
export interface CareActionEvent extends BaseGameEvent {
  type: "careAction";
  action: "feed" | "water" | "clean" | "play";
  itemId: string;
  petName: string;
  message: string;
}

/**
 * Event emitted when travel occurs.
 */
export interface TravelEvent extends BaseGameEvent {
  type: "travel";
  fromLocationId: string;
  toLocationId: string;
  toLocationName: string;
}

/**
 * Event emitted when skill level increases.
 */
export interface SkillLevelUpEvent extends BaseGameEvent {
  type: "skillLevelUp";
  skillType: string;
  newLevel: number;
}

/**
 * Battle action types for battle events.
 */
export type BattleActionType =
  | "playerAttack"
  | "enemyAttack"
  | "playerDamaged"
  | "enemyDamaged"
  | "turnResolved";

/**
 * Event emitted when a battle action occurs.
 * The UI consumes these events to play animations while the state is already updated.
 */
export interface BattleActionEvent extends BaseGameEvent {
  type: "battleAction";
  action: BattleActionType;
  actorName: string;
  targetName?: string;
  moveName?: string;
  damage?: number;
  isCritical?: boolean;
  isDodged?: boolean;
  message?: string;
}

/**
 * Event emitted when a battle ends.
 */
export interface BattleEndEvent extends BaseGameEvent {
  type: "battleEnd";
  isVictory: boolean;
  playerName: string;
  enemyName: string;
}

/**
 * Union type of all game events.
 */
export type GameEvent =
  | StageTransitionEvent
  | TrainingCompleteEvent
  | ExplorationCompleteEvent
  | CareActionEvent
  | TravelEvent
  | SkillLevelUpEvent
  | BattleActionEvent
  | BattleEndEvent;

/**
 * Result type for actions that produce events.
 * Actions return both the new state and any events that occurred.
 *
 * Note: This interface is defined for future use when actions are refactored
 * to emit events directly. Currently, events are emitted by the tick processor.
 */
export interface ActionResult<T> {
  /** Updated game state */
  state: T;
  /** Events emitted by this action */
  events: GameEvent[];
}

/**
 * Create a new event with the specified or current timestamp.
 * @param event The event data without timestamp
 * @param timestamp Optional timestamp (defaults to Date.now())
 */
export function createEvent<T extends GameEvent>(
  event: Omit<T, "timestamp">,
  timestamp: number = Date.now(),
): T {
  return {
    ...event,
    timestamp,
  } as T;
}
