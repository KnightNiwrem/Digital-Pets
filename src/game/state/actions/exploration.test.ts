/**
 * Tests for exploration state actions.
 */

import { expect, test } from "bun:test";
import { applyExplorationResults } from "@/game/state/actions/exploration";
import type { ExplorationResult } from "@/game/types/activity";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import { SkillType } from "@/game/types/skill";

function createTestState(): GameState {
  return {
    ...createInitialGameState(),
    isInitialized: true,
  };
}

// applyExplorationResults tests
test("applyExplorationResults grants foraging XP for completed exploration", () => {
  const state = createTestState();
  const result: ExplorationResult = {
    success: true,
    message: "Found items",
    itemsFound: [],
  };

  const { xpGained, leveledUp } = applyExplorationResults(state, result);

  // Base XP of 15 with 0 items
  expect(xpGained).toBe(15);
  expect(leveledUp).toBe(false);
});

test("applyExplorationResults grants bonus XP for items found", () => {
  const state = createTestState();
  const result: ExplorationResult = {
    success: true,
    message: "Found items",
    itemsFound: [
      { itemId: "food_apple", quantity: 2 },
      { itemId: "food_berry", quantity: 3 },
    ],
  };

  const { xpGained } = applyExplorationResults(state, result);

  // Base XP 15 + (5 items * 5 XP per item) = 40
  expect(xpGained).toBe(40);
});

test("applyExplorationResults updates skills in game state", () => {
  const state = createTestState();
  const result: ExplorationResult = {
    success: true,
    message: "Found items",
    itemsFound: [{ itemId: "food_apple", quantity: 1 }],
  };

  const { state: newState, xpGained } = applyExplorationResults(state, result);

  expect(newState.player.skills[SkillType.Foraging].currentXp).toBe(xpGained);
});

test("applyExplorationResults adds items to inventory", () => {
  const state = createTestState();
  const result: ExplorationResult = {
    success: true,
    message: "Found items",
    itemsFound: [{ itemId: "food_apple", quantity: 3 }],
  };

  const { state: newState } = applyExplorationResults(state, result);

  const appleItem = newState.player.inventory.items.find(
    (item) => item.itemId === "food_apple",
  );
  expect(appleItem).toBeDefined();
  expect(appleItem?.quantity).toBe(3);
});

test("applyExplorationResults returns leveledUp true when skill levels up", () => {
  const state = createTestState();
  // Give enough XP to level up (need 150 XP for level 2)
  // Simulate getting lots of items
  const result: ExplorationResult = {
    success: true,
    message: "Found items",
    itemsFound: [{ itemId: "food_apple", quantity: 30 }], // 15 + 30*5 = 165 XP
  };

  const { leveledUp } = applyExplorationResults(state, result);

  expect(leveledUp).toBe(true);
});

test("applyExplorationResults still grants XP when no items found", () => {
  const state = createTestState();
  const result: ExplorationResult = {
    success: true,
    message: "Nothing found",
    itemsFound: [],
  };

  const { xpGained, state: newState } = applyExplorationResults(state, result);

  expect(xpGained).toBe(15); // Base XP only
  expect(newState.player.skills[SkillType.Foraging].currentXp).toBe(15);
});

test("applyExplorationResults does not grant XP when exploration fails", () => {
  const state = createTestState();
  const result: ExplorationResult = {
    success: false,
    message: "Exploration failed",
    itemsFound: [],
  };

  const {
    xpGained,
    leveledUp,
    state: newState,
  } = applyExplorationResults(state, result);

  expect(xpGained).toBe(0);
  expect(leveledUp).toBe(false);
  expect(newState.player.skills[SkillType.Foraging].currentXp).toBe(0);
});
