import { describe, expect, test } from "bun:test";
import type { QuestProgress } from "@/game/types/quest";
import { QuestState, QuestType } from "@/game/types/quest";
import { createProgressMap, hasExpiration } from "./questUtils";

describe("hasExpiration", () => {
  test("returns true for Daily quests", () => {
    expect(hasExpiration(QuestType.Daily)).toBe(true);
  });

  test("returns true for Weekly quests", () => {
    expect(hasExpiration(QuestType.Weekly)).toBe(true);
  });

  test("returns true for Timed quests", () => {
    expect(hasExpiration(QuestType.Timed)).toBe(true);
  });

  test("returns false for Main quests", () => {
    expect(hasExpiration(QuestType.Main)).toBe(false);
  });

  test("returns false for Side quests", () => {
    expect(hasExpiration(QuestType.Side)).toBe(false);
  });

  test("returns false for Tutorial quests", () => {
    expect(hasExpiration(QuestType.Tutorial)).toBe(false);
  });

  test("returns false for Hidden quests", () => {
    expect(hasExpiration(QuestType.Hidden)).toBe(false);
  });
});

describe("createProgressMap", () => {
  test("returns empty map for empty array", () => {
    const result = createProgressMap([]);
    expect(result.size).toBe(0);
  });

  test("creates map with correct entries", () => {
    const quests: QuestProgress[] = [
      { questId: "quest1", state: QuestState.Active, objectiveProgress: {} },
      {
        questId: "quest2",
        state: QuestState.Completed,
        objectiveProgress: {},
      },
    ];
    const result = createProgressMap(quests);

    expect(result.size).toBe(2);
    expect(result.get("quest1")?.state).toBe(QuestState.Active);
    expect(result.get("quest2")?.state).toBe(QuestState.Completed);
  });

  test("allows retrieval of full progress object", () => {
    const progress: QuestProgress = {
      questId: "test_quest",
      state: QuestState.Active,
      objectiveProgress: { obj1: 5 },
      startedAt: 1234567890,
    };
    const result = createProgressMap([progress]);

    const retrieved = result.get("test_quest");
    expect(retrieved).toBeDefined();
    expect(retrieved?.objectiveProgress.obj1).toBe(5);
    expect(retrieved?.startedAt).toBe(1234567890);
  });
});
