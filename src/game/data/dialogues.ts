/**
 * Dialogue tree definitions for NPCs.
 */

import {
  type DialogueNode,
  DialogueNodeType,
  type DialogueTree,
} from "@/game/types/npc";

/**
 * Helper to create a message node.
 */
function messageNode(
  id: string,
  text: string,
  nextNodeId?: string,
): DialogueNode {
  return {
    id,
    type: DialogueNodeType.Message,
    text,
    nextNodeId,
  };
}

/**
 * Helper to create a choice node.
 */
function choiceNode(
  id: string,
  text: string,
  choices: { text: string; nextNodeId: string }[],
): DialogueNode {
  return {
    id,
    type: DialogueNodeType.Choice,
    text,
    choices,
  };
}

/**
 * Helper to create an end node.
 */
function endNode(id: string, text: string): DialogueNode {
  return {
    id,
    type: DialogueNodeType.End,
    text,
  };
}

/**
 * Helper to create a shop node.
 */
function shopNode(id: string, text: string): DialogueNode {
  return {
    id,
    type: DialogueNodeType.Shop,
    text,
  };
}

/**
 * Mira's dialogue tree.
 */
export const miraDialogue: DialogueTree = {
  id: "mira_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "Welcome to my shop! I have all sorts of supplies for your pet. What can I help you with today?",
      [
        { text: "I'd like to browse your wares.", nextNodeId: "shop" },
        { text: "Tell me about Willowbrook.", nextNodeId: "about_town" },
        { text: "Just passing through. Goodbye!", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "Take your time and look around! Let me know if you need anything.",
    ),
    about_town: messageNode(
      "about_town",
      "Willowbrook has been a peaceful haven for pet owners for generations. The meadows to the east are great for foraging, and the Misty Woods beyond hold many mysteries.",
      "about_town_2",
    ),
    about_town_2: choiceNode(
      "about_town_2",
      "Is there anything else you'd like to know?",
      [
        { text: "I'd like to see your shop.", nextNodeId: "shop" },
        { text: "That's all, thank you!", nextNodeId: "farewell" },
      ],
    ),
    farewell: endNode(
      "farewell",
      "Safe travels! Come back anytime you need supplies.",
    ),
  },
};

/**
 * Oak's dialogue tree.
 */
export const oakDialogue: DialogueTree = {
  id: "oak_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "Ah, a fellow pet trainer! I've dedicated my life to understanding these wonderful creatures. How can I assist you?",
      [
        { text: "Any tips for training?", nextNodeId: "training_tips" },
        {
          text: "What should new trainers know?",
          nextNodeId: "beginner_advice",
        },
        { text: "I should get going.", nextNodeId: "farewell" },
      ],
    ),
    training_tips: messageNode(
      "training_tips",
      "The key to effective training is consistency and patience. Make sure your pet is well-rested and well-fed before training sessions. A happy pet learns faster!",
      "training_tips_2",
    ),
    training_tips_2: choiceNode(
      "training_tips_2",
      "Different training focuses develop different strengths. Would you like to know more?",
      [
        { text: "Tell me about battle stats.", nextNodeId: "battle_stats" },
        { text: "I think I understand. Thanks!", nextNodeId: "farewell" },
      ],
    ),
    battle_stats: messageNode(
      "battle_stats",
      "Every pet has six core attributes: Strength for power, Endurance for toughness, Agility for speed, Precision for accuracy, Fortitude for resilience, and Cunning for tactical advantage.",
      "battle_stats_2",
    ),
    battle_stats_2: endNode(
      "battle_stats_2",
      "Master these, and your pet will become a formidable partner. Good luck with your training!",
    ),
    beginner_advice: messageNode(
      "beginner_advice",
      "New to pet raising? The most important thing is taking care of your pet's basic needs. Keep them fed, hydrated, and happy. A healthy pet is a strong pet!",
      "beginner_advice_2",
    ),
    beginner_advice_2: messageNode(
      "beginner_advice_2",
      "Don't forget to let them rest when they're tired. And clean up after them - a messy environment isn't good for anyone!",
      "beginner_advice_3",
    ),
    beginner_advice_3: endNode(
      "beginner_advice_3",
      "Once you've got the basics down, you can focus on training and exploration. You'll do great!",
    ),
    farewell: endNode(
      "farewell",
      "May your journey together be filled with adventure and growth. Until next time!",
    ),
  },
};

/**
 * All dialogue trees indexed by ID.
 */
export const dialogues: Record<string, DialogueTree> = {
  [miraDialogue.id]: miraDialogue,
  [oakDialogue.id]: oakDialogue,
};

/**
 * Get a dialogue tree by ID.
 */
export function getDialogue(dialogueId: string): DialogueTree | undefined {
  return dialogues[dialogueId];
}
