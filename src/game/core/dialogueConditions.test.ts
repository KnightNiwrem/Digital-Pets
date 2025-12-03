import { describe, expect, test } from "bun:test";
import { createInitialGameState } from "@/game/types/gameState";
import { DialogueConditionType } from "@/game/types/npc";
import { createQuestProgress, QuestState } from "@/game/types/quest";
import { checkCondition } from "./dialogue";

describe("Dialogue Logic", () => {
  test("checkCondition should return true for QuestState condition when met", () => {
    const state = createInitialGameState();
    // Mock a quest as completed
    const questId = "test_quest";
    state.quests.push({
      ...createQuestProgress(questId),
      state: QuestState.Completed,
    });

    const condition = {
      type: DialogueConditionType.QuestState,
      targetId: questId,
      value: QuestState.Completed,
      comparison: "eq" as const,
    };

    expect(checkCondition(state, condition)).toBe(true);
  });

  test("checkCondition should return false for QuestState condition when not met", () => {
    const state = createInitialGameState();
    const questId = "test_quest";
    // Quest not started

    const condition = {
      type: DialogueConditionType.QuestState,
      targetId: questId,
      value: QuestState.Completed,
      comparison: "eq" as const,
    };

    // Default state is Locked or Available, but definitely not Completed
    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should work with SkillLevel", () => {
    const state = createInitialGameState();
    // Set skill level
    state.player.skills.foraging.level = 5;

    const condition = {
      type: DialogueConditionType.SkillLevel,
      targetId: "foraging",
      value: "5",
      comparison: "gte" as const,
    };

    expect(checkCondition(state, condition)).toBe(true);

    const highCondition = {
      type: DialogueConditionType.SkillLevel,
      targetId: "foraging",
      value: "10",
      comparison: "gte" as const,
    };

    expect(checkCondition(state, highCondition)).toBe(false);
  });
});
