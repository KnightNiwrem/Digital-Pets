/**
 * Quest system types for tracking objectives, rewards, and quest state.
 */

/**
 * Quest types.
 */
export const QuestType = {
  Main: "main",
  Side: "side",
  Daily: "daily",
  Weekly: "weekly",
  Timed: "timed",
  Tutorial: "tutorial",
  Hidden: "hidden",
} as const;

export type QuestType = (typeof QuestType)[keyof typeof QuestType];

/**
 * Quest states.
 */
export const QuestState = {
  /** Requirements not met */
  Locked: "locked",
  /** Can be accepted */
  Available: "available",
  /** In progress */
  Active: "active",
  /** Finished, rewards claimed */
  Completed: "completed",
  /** Timed quest expired without completion */
  Expired: "expired",
} as const;

export type QuestState = (typeof QuestState)[keyof typeof QuestState];

/**
 * Requirement types for quest prerequisites.
 */
export const RequirementType = {
  Quest: "quest",
  Stage: "stage",
  Skill: "skill",
  Item: "item",
  Location: "location",
  Battle: "battle",
} as const;

export type RequirementType =
  (typeof RequirementType)[keyof typeof RequirementType];

/**
 * Objective types for quest tasks.
 */
export const ObjectiveType = {
  Collect: "collect",
  Defeat: "defeat",
  Visit: "visit",
  Talk: "talk",
  Explore: "explore",
  Train: "train",
  Care: "care",
} as const;

export type ObjectiveType = (typeof ObjectiveType)[keyof typeof ObjectiveType];

/**
 * Reward types.
 */
export const RewardType = {
  Currency: "currency",
  Item: "item",
  XP: "xp",
  Unlock: "unlock",
} as const;

export type RewardType = (typeof RewardType)[keyof typeof RewardType];

/**
 * A quest requirement.
 */
export interface QuestRequirement {
  /** Requirement type */
  type: RequirementType;
  /** Target ID (quest ID, location ID, item ID, etc.) or threshold */
  target: string;
  /** Required value (for skill level, battle count, etc.) */
  value?: number;
}

/**
 * A quest objective.
 */
export interface QuestObjective {
  /** Unique ID within the quest */
  id: string;
  /** Objective type */
  type: ObjectiveType;
  /** Description of the objective */
  description: string;
  /** Target ID (item ID, location ID, NPC ID, etc.) */
  target: string;
  /** Required quantity */
  quantity: number;
  /** Whether this objective is optional (bonus rewards) */
  optional?: boolean;
}

/**
 * A quest reward.
 */
export interface QuestReward {
  /** Reward type */
  type: RewardType;
  /** Target ID (item ID, skill ID, location ID, etc.) */
  target: string;
  /** Quantity or amount */
  quantity: number;
}

/**
 * Quest definition.
 */
export interface Quest {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Quest description */
  description: string;
  /** Quest type */
  type: QuestType;
  /** NPC ID who assigns this quest */
  giverId: string;
  /** Prerequisites to start */
  requirements: QuestRequirement[];
  /** Tasks to complete */
  objectives: QuestObjective[];
  /** Rewards upon completion */
  rewards: QuestReward[];
  /** Next quest ID in chain (optional) */
  chainNext?: string;
  /** Previous quest ID in chain (optional) */
  chainPrevious?: string;
  /** Duration in milliseconds for timed quests (required for Timed type) */
  durationMs?: number;
  /** Location ID where quest can be started (omit for any location) */
  startLocationId?: string;
  /** Location ID where quest can be completed (omit for any location) */
  completeLocationId?: string;
}

/**
 * Player's progress on a specific quest.
 */
export interface QuestProgress {
  /** Quest ID */
  questId: string;
  /** Current state */
  state: QuestState;
  /** Progress for each objective: objectiveId -> current count */
  objectiveProgress: Record<string, number>;
  /** Timestamp when quest was started */
  startedAt?: number;
  /** Timestamp when quest was completed */
  completedAt?: number;
  /** Timestamp when quest expires (for daily, weekly, and timed quests) */
  expiresAt?: number;
}

/**
 * Create initial quest progress for an active quest.
 */
export function createQuestProgress(
  questId: string,
  expiresAt?: number,
): QuestProgress {
  return {
    questId,
    state: QuestState.Active,
    objectiveProgress: {},
    startedAt: Date.now(),
    expiresAt,
  };
}
