/**
 * Dialogue navigation logic.
 */

import { getQuestState } from "@/game/core/quests/quests";
import { getDialogue } from "@/game/data/dialogues";
import { getNpc } from "@/game/data/npcs";
import type { GameState } from "@/game/types/gameState";
import {
  type DialogueAction,
  type DialogueCondition,
  DialogueConditionType,
  type DialogueNode,
  DialogueNodeType,
  type DialogueState,
} from "@/game/types/npc";

/**
 * Result of starting a dialogue.
 */
export interface StartDialogueResult {
  success: boolean;
  message: string;
  state?: DialogueState;
  node?: DialogueNode;
}

/**
 * Result of advancing dialogue.
 */
export interface AdvanceDialogueResult {
  success: boolean;
  message: string;
  state?: DialogueState;
  node?: DialogueNode;
  ended: boolean;
}

/**
 * Check if a condition is met.
 */
export function checkCondition(
  state: GameState,
  condition: DialogueCondition,
): boolean {
  switch (condition.type) {
    case DialogueConditionType.QuestState: {
      const questState = getQuestState(state, condition.targetId) || "locked";
      const targetValue = condition.value as string;
      const comparison = condition.comparison || "eq";

      if (comparison === "eq") return questState === targetValue;
      if (comparison === "neq") return questState !== targetValue;
      return questState === targetValue;
    }
    case DialogueConditionType.SkillLevel: {
      const skill =
        state.player.skills[
          condition.targetId as keyof typeof state.player.skills
        ];
      if (!skill) return false;
      const level = skill.level;
      const targetLevel = Number(condition.value);
      const comparison = condition.comparison || "gte";

      if (comparison === "eq") return level === targetLevel;
      if (comparison === "neq") return level !== targetLevel;
      if (comparison === "gte") return level >= targetLevel;
      if (comparison === "gt") return level > targetLevel;
      if (comparison === "lte") return level <= targetLevel;
      if (comparison === "lt") return level < targetLevel;
      return level >= targetLevel;
    }
    // Add other condition types here as needed
    default:
      return true;
  }
}

/**
 * Start a dialogue with an NPC.
 */
export function startDialogue(npcId: string): StartDialogueResult {
  const npc = getNpc(npcId);
  if (!npc) {
    return {
      success: false,
      message: "NPC not found.",
    };
  }

  const dialogue = getDialogue(npc.dialogueId);
  if (!dialogue) {
    return {
      success: false,
      message: "Dialogue not found.",
    };
  }

  const startNode = dialogue.nodes[dialogue.startNodeId];
  if (!startNode) {
    return {
      success: false,
      message: "Start node not found.",
    };
  }

  const state: DialogueState = {
    npcId,
    dialogueId: dialogue.id,
    currentNodeId: dialogue.startNodeId,
  };

  return {
    success: true,
    message: "Dialogue started.",
    state,
    node: startNode,
  };
}

/**
 * Get the current dialogue node.
 */
export function getCurrentNode(state: DialogueState): DialogueNode | undefined {
  const dialogue = getDialogue(state.dialogueId);
  if (!dialogue) return undefined;
  return dialogue.nodes[state.currentNodeId];
}

/**
 * Advance dialogue to the next node (for message nodes).
 */
export function advanceDialogue(state: DialogueState): AdvanceDialogueResult {
  const currentNode = getCurrentNode(state);
  if (!currentNode) {
    return {
      success: false,
      message: "Current node not found.",
      ended: true,
    };
  }

  // Check if dialogue has ended
  if (currentNode.type === DialogueNodeType.End) {
    return {
      success: true,
      message: "Dialogue ended.",
      ended: true,
    };
  }

  // For shop nodes, dialogue ends (shop interface takes over)
  if (currentNode.type === DialogueNodeType.Shop) {
    return {
      success: true,
      message: "Opening shop.",
      ended: true,
    };
  }

  // For choice nodes, cannot advance without selecting
  if (currentNode.type === DialogueNodeType.Choice) {
    return {
      success: false,
      message: "Please select a choice.",
      state,
      node: currentNode,
      ended: false,
    };
  }

  // For message nodes, advance to next
  if (currentNode.type === DialogueNodeType.Message) {
    if (!currentNode.nextNodeId) {
      return {
        success: true,
        message: "Dialogue ended.",
        ended: true,
      };
    }

    const dialogue = getDialogue(state.dialogueId);
    const nextNode = dialogue?.nodes[currentNode.nextNodeId];
    if (!nextNode) {
      return {
        success: false,
        message: "Next node not found.",
        ended: true,
      };
    }

    const newState: DialogueState = {
      ...state,
      currentNodeId: currentNode.nextNodeId,
    };

    return {
      success: true,
      message: "Advanced to next node.",
      state: newState,
      node: nextNode,
      ended: false,
    };
  }

  return {
    success: false,
    message: "Unknown node type.",
    ended: true,
  };
}

/**
 * Select a choice in a dialogue (for choice nodes).
 */
export function selectChoice(
  state: DialogueState,
  choiceIndex: number,
  gameState?: GameState,
): AdvanceDialogueResult & { action?: DialogueAction } {
  const currentNode = getCurrentNode(state);
  if (!currentNode) {
    return {
      success: false,
      message: "Current node not found.",
      ended: true,
    };
  }

  if (currentNode.type !== DialogueNodeType.Choice) {
    return {
      success: false,
      message: "Current node is not a choice node.",
      state,
      node: currentNode,
      ended: false,
    };
  }

  if (
    !currentNode.choices ||
    choiceIndex < 0 ||
    choiceIndex >= currentNode.choices.length
  ) {
    return {
      success: false,
      message: "Invalid choice index.",
      state,
      node: currentNode,
      ended: false,
    };
  }

  const choice = currentNode.choices[choiceIndex];
  // With noUncheckedIndexedAccess, TypeScript needs explicit check
  if (!choice) {
    return {
      success: false,
      message: "Invalid choice index.",
      state,
      node: currentNode,
      ended: false,
    };
  }

  // Check conditions if gameState is provided
  if (gameState && choice.conditions) {
    const conditionsMet = choice.conditions.every((condition) =>
      checkCondition(gameState, condition),
    );
    if (!conditionsMet) {
      return {
        success: false,
        message: "Conditions not met for this choice.",
        state,
        node: currentNode,
        ended: false,
      };
    }
  }

  const dialogue = getDialogue(state.dialogueId);
  const nextNode = dialogue?.nodes[choice.nextNodeId];
  if (!nextNode) {
    return {
      success: false,
      message: "Next node not found.",
      ended: true,
    };
  }

  const newState: DialogueState = {
    ...state,
    currentNodeId: choice.nextNodeId,
  };

  // Check if the next node is an end or shop node
  const ended =
    nextNode.type === DialogueNodeType.End ||
    nextNode.type === DialogueNodeType.Shop;

  return {
    success: true,
    message: ended ? "Dialogue ended." : "Choice selected.",
    state: newState,
    node: nextNode,
    ended,
    action: choice.action,
  };
}

/**
 * Check if a node is a terminal node (end or shop).
 */
export function isTerminalNode(node: DialogueNode): boolean {
  return (
    node.type === DialogueNodeType.End || node.type === DialogueNodeType.Shop
  );
}
