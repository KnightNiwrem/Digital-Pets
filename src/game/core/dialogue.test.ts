/**
 * Tests for dialogue navigation logic.
 */

import { expect, test } from "bun:test";
import {
  advanceDialogue,
  getCurrentNode,
  isTerminalNode,
  selectChoice,
  startDialogue,
} from "@/game/core/dialogue";
import type { DialogueState } from "@/game/types/npc";
import { DialogueNodeType } from "@/game/types/npc";

// startDialogue tests
test("startDialogue succeeds with valid NPC", () => {
  const result = startDialogue("shopkeeper_mira");
  expect(result.success).toBe(true);
  expect(result.state?.npcId).toBe("shopkeeper_mira");
  expect(result.state?.dialogueId).toBe("mira_dialogue");
  expect(result.node?.type).toBe(DialogueNodeType.Choice);
});

test("startDialogue fails with unknown NPC", () => {
  const result = startDialogue("unknown_npc");
  expect(result.success).toBe(false);
  expect(result.message).toBe("NPC not found.");
});

test("startDialogue returns correct starting node", () => {
  const result = startDialogue("trainer_oak");
  expect(result.success).toBe(true);
  expect(result.node?.id).toBe("greeting");
  expect(result.node?.text).toContain("fellow pet trainer");
});

// getCurrentNode tests
test("getCurrentNode returns correct node", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "greeting",
  };
  const node = getCurrentNode(state);
  expect(node).toBeDefined();
  expect(node?.id).toBe("greeting");
});

test("getCurrentNode returns undefined for invalid dialogue", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "invalid_dialogue",
    currentNodeId: "greeting",
  };
  const node = getCurrentNode(state);
  expect(node).toBeUndefined();
});

// advanceDialogue tests
test("advanceDialogue advances message node", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "about_town",
  };
  const result = advanceDialogue(state);
  expect(result.success).toBe(true);
  expect(result.ended).toBe(false);
  expect(result.state?.currentNodeId).toBe("about_town_2");
});

test("advanceDialogue fails for choice node without selection", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "greeting",
  };
  const result = advanceDialogue(state);
  expect(result.success).toBe(false);
  expect(result.message).toBe("Please select a choice.");
  expect(result.ended).toBe(false);
});

test("advanceDialogue ends at end node", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "farewell",
  };
  const result = advanceDialogue(state);
  expect(result.success).toBe(true);
  expect(result.ended).toBe(true);
});

test("advanceDialogue ends at shop node", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "shop",
  };
  const result = advanceDialogue(state);
  expect(result.success).toBe(true);
  expect(result.ended).toBe(true);
  expect(result.message).toBe("Opening shop.");
});

// selectChoice tests
test("selectChoice advances to selected node", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "greeting",
  };
  const result = selectChoice(state, 1); // "Tell me about Willowbrook"
  expect(result.success).toBe(true);
  expect(result.state?.currentNodeId).toBe("about_town");
  expect(result.ended).toBe(false);
});

test("selectChoice fails with invalid index", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "greeting",
  };
  const result = selectChoice(state, 99);
  expect(result.success).toBe(false);
  expect(result.message).toBe("Invalid choice index.");
});

test("selectChoice fails on non-choice node", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "about_town",
  };
  const result = selectChoice(state, 0);
  expect(result.success).toBe(false);
  expect(result.message).toBe("Current node is not a choice node.");
});

test("selectChoice ends when selecting farewell", () => {
  const state: DialogueState = {
    npcId: "shopkeeper_mira",
    dialogueId: "mira_dialogue",
    currentNodeId: "greeting",
  };
  const result = selectChoice(state, 2); // "Just passing through. Goodbye!"
  expect(result.success).toBe(true);
  expect(result.ended).toBe(true);
});

// isTerminalNode tests
test("isTerminalNode returns true for end node", () => {
  const node = {
    id: "end",
    type: DialogueNodeType.End,
    text: "Goodbye!",
  };
  expect(isTerminalNode(node)).toBe(true);
});

test("isTerminalNode returns true for shop node", () => {
  const node = {
    id: "shop",
    type: DialogueNodeType.Shop,
    text: "Welcome to my shop!",
  };
  expect(isTerminalNode(node)).toBe(true);
});

test("isTerminalNode returns false for message node", () => {
  const node = {
    id: "msg",
    type: DialogueNodeType.Message,
    text: "Hello!",
  };
  expect(isTerminalNode(node)).toBe(false);
});

test("isTerminalNode returns false for choice node", () => {
  const node = {
    id: "choice",
    type: DialogueNodeType.Choice,
    text: "What would you like?",
    choices: [],
  };
  expect(isTerminalNode(node)).toBe(false);
});
