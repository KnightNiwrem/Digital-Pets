import { describe, expect, test } from "bun:test";
import { oakDialogue } from "@/game/data/dialogues";
import {
  tutorialExploration,
  tutorialFirstSteps,
} from "@/game/data/quests/tutorial";
import { createInitialGameState } from "@/game/types/gameState";
import { createQuestProgress, QuestState } from "@/game/types/quest";
import { checkCondition } from "./dialogue";

describe("Oak Dialogue Conditions", () => {
  // Helper to get a specific choice from Oak's greeting node
  function getOakChoice(textSubstr: string) {
    const greetingNode = oakDialogue.nodes.greeting;
    if (!greetingNode) {
      throw new Error("Oak's greeting node not found");
    }
    if (greetingNode.type !== "choice" || !greetingNode.choices) {
      throw new Error(
        "Oak's greeting node is not a choice node or has no choices",
      );
    }
    return greetingNode.choices.find((c) => c.text.includes(textSubstr));
  }

  test("First quest option should be available initially", () => {
    const state = createInitialGameState();
    // Ensure first quest is available (requirements met)
    // Since tutorialFirstSteps has no requirements, it's available by default if not started

    const choice = getOakChoice("start my journey");
    expect(choice).toBeDefined();

    if (choice?.conditions) {
      const met = choice.conditions.every((c) => checkCondition(state, c));
      expect(met).toBe(true);
    }
  });

  test("Second quest option should be hidden initially", () => {
    const state = createInitialGameState();
    const choice = getOakChoice("next challenge");
    expect(choice).toBeDefined();

    if (choice?.conditions) {
      const met = choice.conditions.every((c) => checkCondition(state, c));
      expect(met).toBe(false);
    }
  });

  test("Second quest option should be available after completing first quest", () => {
    const state = createInitialGameState();

    // Mock completing the first quest
    state.quests.push({
      ...createQuestProgress(tutorialFirstSteps.id),
      state: QuestState.Completed,
    });

    const choice = getOakChoice("next challenge");
    expect(choice).toBeDefined();

    if (choice?.conditions) {
      const met = choice.conditions.every((c) => checkCondition(state, c));
      expect(met).toBe(true);
    }
  });

  test("Third quest option should be available after completing second quest", () => {
    const state = createInitialGameState();

    // Mock completing the first and second quests
    state.quests.push({
      ...createQuestProgress(tutorialFirstSteps.id),
      state: QuestState.Completed,
    });
    state.quests.push({
      ...createQuestProgress(tutorialExploration.id),
      state: QuestState.Completed,
    });

    const choice = getOakChoice("make my pet stronger");
    expect(choice).toBeDefined();

    if (choice?.conditions) {
      const met = choice.conditions.every((c) => checkCondition(state, c));
      expect(met).toBe(true);
    }
  });
});
