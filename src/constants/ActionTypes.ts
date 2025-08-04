/**
 * Centralized action type constants for cross-system communication
 * Eliminates string mismatches between game systems and quest progression
 */

// Quest Action Types - Used by QuestSystem.processGameAction()
export const QUEST_ACTION_TYPES = {
  /** Item obtained from any source (activities, rewards, etc.) */
  ITEM_OBTAINED: "item_obtained",
  /** Item delivered/sold to NPCs or systems */
  ITEM_DELIVERED: "item_delivered",
  /** Item sold to shop or NPC */
  ITEM_SOLD: "item_sold",
  /** Location visited after travel completion */
  LOCATION_VISITED: "location_visited",
  /** Battle won against opponent */
  BATTLE_WON: "battle_won",
  /** Pet care action performed (feed, drink, play, etc.) */
  PET_CARE: "pet_care",
  /** Pet reached new level/growth stage */
  LEVEL_UP: "level_up",
  /** Quest completed */
  QUEST_COMPLETED: "quest_completed",
} as const;

// Activity Action Types - Used by GameLoop for activity rewards
export const ACTIVITY_ACTION_TYPES = {
  /** Item earned from activities */
  ITEM_EARNED: "item_earned",
  /** Gold earned from activities */
  GOLD_EARNED: "gold_earned",
  /** Experience earned from activities */
  EXPERIENCE_EARNED: "experience_earned",
} as const;

// System Action Types - Used by GameLoop for system events
export const SYSTEM_ACTION_TYPES = {
  /** Travel completed to destination */
  TRAVEL_COMPLETED: "travel_completed",
  /** Activity completed */
  ACTIVITY_COMPLETED: "activity_completed",
  /** Pet growth stage increased */
  PET_GROWTH: "pet_growth",
  /** Pet died */
  PET_DIED: "pet_died",
  /** Pet pooped */
  PET_POOPED: "pet_pooped",
  /** Pet became sick */
  PET_BECAME_SICK: "pet_became_sick",
} as const;

// Combined type for all action types
export type ActionType =
  | (typeof QUEST_ACTION_TYPES)[keyof typeof QUEST_ACTION_TYPES]
  | (typeof ACTIVITY_ACTION_TYPES)[keyof typeof ACTIVITY_ACTION_TYPES]
  | (typeof SYSTEM_ACTION_TYPES)[keyof typeof SYSTEM_ACTION_TYPES];

/**
 * Mapping between activity actions and quest actions
 * Used to emit both types when processing rewards
 */
export const ACTION_TYPE_MAPPING = {
  [ACTIVITY_ACTION_TYPES.ITEM_EARNED]: QUEST_ACTION_TYPES.ITEM_OBTAINED,
  [SYSTEM_ACTION_TYPES.TRAVEL_COMPLETED]: QUEST_ACTION_TYPES.LOCATION_VISITED,
  [SYSTEM_ACTION_TYPES.PET_GROWTH]: QUEST_ACTION_TYPES.LEVEL_UP,
} as const;
