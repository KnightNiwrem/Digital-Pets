import { describe, expect, test } from "bun:test";
import { addItem } from "@/game/core/inventory";
import { FOOD_ITEMS } from "@/game/data/items";
import { tutorialFirstSteps } from "@/game/data/quests/tutorial";
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

  test("checkCondition should return false for QuestState with invalid value type", () => {
    const state = createInitialGameState();

    const condition = {
      type: DialogueConditionType.QuestState,
      targetId: "test_quest",
      value: 123, // Invalid: should be string
      comparison: "eq" as const,
    };

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

  test("checkCondition should return false for SkillLevel with NaN value", () => {
    const state = createInitialGameState();
    state.player.skills.foraging.level = 5;

    const condition = {
      type: DialogueConditionType.SkillLevel,
      targetId: "foraging",
      value: "not-a-number",
      comparison: "gte" as const,
    };

    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should work with HasItem when player has exact quantity", () => {
    const state = createInitialGameState();
    state.player.inventory = addItem(
      state.player.inventory,
      FOOD_ITEMS.KIBBLE.id,
      5,
    );

    const condition = {
      type: DialogueConditionType.HasItem,
      targetId: FOOD_ITEMS.KIBBLE.id,
      value: 5,
      comparison: "eq" as const,
    };

    expect(checkCondition(state, condition)).toBe(true);
  });

  test("checkCondition should work with HasItem when player has more than required", () => {
    const state = createInitialGameState();
    state.player.inventory = addItem(
      state.player.inventory,
      FOOD_ITEMS.KIBBLE.id,
      10,
    );

    const condition = {
      type: DialogueConditionType.HasItem,
      targetId: FOOD_ITEMS.KIBBLE.id,
      value: 5,
      comparison: "gte" as const,
    };

    expect(checkCondition(state, condition)).toBe(true);
  });

  test("checkCondition should work with HasItem when player has less than required", () => {
    const state = createInitialGameState();
    state.player.inventory = addItem(
      state.player.inventory,
      FOOD_ITEMS.KIBBLE.id,
      3,
    );

    const condition = {
      type: DialogueConditionType.HasItem,
      targetId: FOOD_ITEMS.KIBBLE.id,
      value: 5,
      comparison: "gte" as const,
    };

    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should work with HasItem when player has no item", () => {
    const state = createInitialGameState();
    // Clear inventory to ensure no items
    state.player.inventory = { items: [] };

    const condition = {
      type: DialogueConditionType.HasItem,
      targetId: FOOD_ITEMS.KIBBLE.id,
      value: 1,
      comparison: "gte" as const,
    };

    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should return false for unknown condition type", () => {
    const state = createInitialGameState();

    const condition = {
      type: "unknownType" as DialogueConditionType,
      targetId: "test",
      value: "test",
    };

    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should work with QuestObjectivesComplete when all objectives are complete", () => {
    const state = createInitialGameState();
    const questId = tutorialFirstSteps.id;

    // Start the quest and complete all objectives
    state.quests.push({
      ...createQuestProgress(questId),
      state: QuestState.Active,
      objectiveProgress: {
        feed_pet: 1,
        give_water: 1,
      },
    });

    const condition = {
      type: DialogueConditionType.QuestObjectivesComplete,
      targetId: questId,
      value: true,
    };

    expect(checkCondition(state, condition)).toBe(true);
  });

  test("checkCondition should return false for QuestObjectivesComplete when objectives are incomplete", () => {
    const state = createInitialGameState();
    const questId = tutorialFirstSteps.id;

    // Start the quest but only complete one objective
    state.quests.push({
      ...createQuestProgress(questId),
      state: QuestState.Active,
      objectiveProgress: {
        feed_pet: 1,
        give_water: 0,
      },
    });

    const condition = {
      type: DialogueConditionType.QuestObjectivesComplete,
      targetId: questId,
      value: true,
    };

    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should return false for QuestObjectivesComplete when quest not in progress", () => {
    const state = createInitialGameState();
    const questId = tutorialFirstSteps.id;
    // Quest not started

    const condition = {
      type: DialogueConditionType.QuestObjectivesComplete,
      targetId: questId,
      value: true,
    };

    expect(checkCondition(state, condition)).toBe(false);
  });

  test("checkCondition should return false for QuestObjectivesComplete when quest does not exist", () => {
    const state = createInitialGameState();

    const condition = {
      type: DialogueConditionType.QuestObjectivesComplete,
      targetId: "nonexistent_quest",
      value: true,
    };

    expect(checkCondition(state, condition)).toBe(false);
  });
});
