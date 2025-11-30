import { describe, expect, test } from "bun:test";
import { QuestType } from "@/game/types/quest";
import { hasExpiration } from "./questUtils";

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
