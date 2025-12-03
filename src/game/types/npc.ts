/**
 * NPC and Dialogue types for town interactions.
 */

/**
 * NPC role types.
 */
export const NpcRole = {
  QuestGiver: "questGiver",
  Merchant: "merchant",
  Trainer: "trainer",
  Guide: "guide",
  Lore: "lore",
} as const;

export type NpcRole = (typeof NpcRole)[keyof typeof NpcRole];

/**
 * Dialogue node types.
 */
export const DialogueNodeType = {
  /** Simple text message */
  Message: "message",
  /** Multiple choice for player */
  Choice: "choice",
  /** Opens shop interface */
  Shop: "shop",
  /** Ends the dialogue */
  End: "end",
} as const;

export type DialogueNodeType =
  (typeof DialogueNodeType)[keyof typeof DialogueNodeType];

/**
 * Dialogue condition types.
 */
export const DialogueConditionType = {
  QuestState: "questState",
  HasItem: "hasItem",
  SkillLevel: "skillLevel",
  QuestObjectivesComplete: "questObjectivesComplete",
} as const;

export type DialogueConditionType =
  (typeof DialogueConditionType)[keyof typeof DialogueConditionType];

/**
 * A condition that must be met for a dialogue choice to be available.
 */
export interface DialogueCondition {
  /** Type of condition */
  type: DialogueConditionType;
  /** Target ID (quest ID, item ID, skill ID) */
  targetId: string;
  /** Value to compare against (quest state, item quantity, skill level) */
  value?: string | number | boolean;
  /** Comparison operator (default: 'eq') */
  comparison?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
}

/**
 * Dialogue action types.
 */
export const DialogueActionType = {
  StartQuest: "startQuest",
  CompleteQuest: "completeQuest",
} as const;

export type DialogueActionType =
  (typeof DialogueActionType)[keyof typeof DialogueActionType];

/**
 * An action to perform when a dialogue choice is selected.
 */
export interface DialogueAction {
  /** Type of action */
  type: DialogueActionType;
  /** Target ID (quest ID) */
  targetId: string;
}

/**
 * A dialogue choice option.
 */
export interface DialogueChoice {
  /** Text shown to the player */
  text: string;
  /** Node ID to navigate to when selected */
  nextNodeId: string;
  /** Conditions required to see this choice */
  conditions?: DialogueCondition[];
  /** Action to perform when selected */
  action?: DialogueAction;
}

/**
 * A single node in a dialogue tree.
 */
export interface DialogueNode {
  /** Unique identifier within the dialogue tree */
  id: string;
  /** Node type */
  type: DialogueNodeType;
  /** NPC speaker text */
  text: string;
  /** Choices available (only for 'choice' type) */
  choices?: DialogueChoice[];
  /** Next node ID for automatic progression (only for 'message' type) */
  nextNodeId?: string;
}

/**
 * A complete dialogue tree.
 */
export interface DialogueTree {
  /** Unique dialogue identifier */
  id: string;
  /** Starting node ID */
  startNodeId: string;
  /** All nodes in the tree */
  nodes: Record<string, DialogueNode>;
}

/**
 * NPC definition.
 */
export interface NPC {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** NPC description */
  description: string;
  /** Role(s) this NPC serves */
  roles: NpcRole[];
  /** Location ID where this NPC is found */
  locationId: string;
  /** Dialogue tree ID for conversations */
  dialogueId: string;
  /** Quest IDs this NPC offers (if quest giver) */
  questIds?: string[];
  /** Shop inventory ID (if merchant) */
  shopId?: string;
  /** Visual representation emoji */
  emoji: string;
}

/**
 * Current dialogue state for active conversation.
 */
export interface DialogueState {
  /** NPC ID being spoken to */
  npcId: string;
  /** Current dialogue tree ID */
  dialogueId: string;
  /** Current node ID within the tree */
  currentNodeId: string;
}
