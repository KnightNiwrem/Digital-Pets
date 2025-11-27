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
 * A dialogue choice option.
 */
export interface DialogueChoice {
  /** Text shown to the player */
  text: string;
  /** Node ID to navigate to when selected */
  nextNodeId: string;
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
