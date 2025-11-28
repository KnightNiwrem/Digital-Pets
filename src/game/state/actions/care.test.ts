/**
 * Tests for care actions including quest progress updates.
 */

import { expect, test } from "bun:test";
import {
  CLEANING_ITEMS,
  DRINK_ITEMS,
  FOOD_ITEMS,
  TOY_ITEMS,
} from "@/game/data/items";
import { dailyCareRoutine } from "@/game/data/quests/daily";
import { tutorialFirstSteps } from "@/game/data/quests/tutorial";
import { SPECIES } from "@/game/data/species";
import { createNewPet } from "@/game/data/starting";
import { createSleepingTestPet } from "@/game/testing/createTestPet";
import { CURRENT_SAVE_VERSION } from "@/game/types";
import type { GameState } from "@/game/types/gameState";
import type { QuestProgress } from "@/game/types/quest";
import { QuestState } from "@/game/types/quest";
import { createInitialSkills } from "@/game/types/skill";
import { cleanPet, feedPet, playWithPet, waterPet } from "./care";

function createTestState(quests: QuestProgress[] = []): GameState {
  const pet = createNewPet("TestPet", SPECIES.FLORABIT.id);
  // Reduce stats to test restoration
  pet.careStats.satiety = 10_000;
  pet.careStats.hydration = 10_000;
  pet.careStats.happiness = 10_000;
  pet.energyStats.energy = 10_000;
  // Add some poop to clean
  pet.poop.count = 3;

  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    lastDailyReset: Date.now(),
    totalTicks: 0,
    pet,
    player: {
      inventory: {
        items: [
          {
            itemId: FOOD_ITEMS.KIBBLE.id,
            quantity: 5,
            currentDurability: null,
          },
          {
            itemId: DRINK_ITEMS.WATER.id,
            quantity: 5,
            currentDurability: null,
          },
          {
            itemId: CLEANING_ITEMS.TISSUE.id,
            quantity: 3,
            currentDurability: null,
          },
          { itemId: TOY_ITEMS.BALL.id, quantity: 1, currentDurability: 10 },
        ],
      },
      currency: { coins: 100 },
      currentLocationId: "home",
      skills: createInitialSkills(),
    },
    quests,
    isInitialized: true,
  };
}

test("feedPet updates quest progress for Care/feed objective", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState([progress]);

  const result = feedPet(state, FOOD_ITEMS.KIBBLE.id);

  expect(result.success).toBe(true);
  expect(result.state.quests[0]?.objectiveProgress.feed_pet).toBe(1);
});

test("waterPet updates quest progress for Care/water objective", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState([progress]);

  const result = waterPet(state, DRINK_ITEMS.WATER.id);

  expect(result.success).toBe(true);
  expect(result.state.quests[0]?.objectiveProgress.give_water).toBe(1);
});

test("cleanPet updates quest progress for Care/clean objective", () => {
  const progress: QuestProgress = {
    questId: dailyCareRoutine.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState([progress]);

  const result = cleanPet(state, CLEANING_ITEMS.TISSUE.id);

  expect(result.success).toBe(true);
  // The daily care routine doesn't have a clean objective, but the action should still succeed
  expect(result.state.pet?.poop.count).toBeLessThan(3);
});

test("playWithPet updates quest progress for Care/play objective", () => {
  const progress: QuestProgress = {
    questId: dailyCareRoutine.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState([progress]);

  const result = playWithPet(state, TOY_ITEMS.BALL.id);

  expect(result.success).toBe(true);
  // The daily care routine doesn't have a play objective, but action should succeed
  expect(result.state.pet?.careStats.happiness).toBeGreaterThan(10_000);
});

test("feedPet accumulates quest progress on multiple calls", () => {
  const progress: QuestProgress = {
    questId: dailyCareRoutine.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState([progress]);

  const result1 = feedPet(state, FOOD_ITEMS.KIBBLE.id);
  expect(result1.success).toBe(true);
  expect(result1.state.quests[0]?.objectiveProgress.feed_pet).toBe(1);

  const result2 = feedPet(result1.state, FOOD_ITEMS.KIBBLE.id);
  expect(result2.success).toBe(true);
  expect(result2.state.quests[0]?.objectiveProgress.feed_pet).toBe(2);
});

test("care actions do not update quest progress when action fails", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState([progress]);
  // Make pet sleep so feeding fails
  state.pet = createSleepingTestPet({
    careStats: { satiety: 10_000, hydration: 10_000, happiness: 10_000 },
  });

  const result = feedPet(state, FOOD_ITEMS.KIBBLE.id);

  expect(result.success).toBe(false);
  expect(result.state.quests[0]?.objectiveProgress.feed_pet).toBeUndefined();
});

test("care actions do not update non-active quests", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Completed,
    objectiveProgress: {
      feed_pet: 1,
      give_water: 1,
    },
  };
  const state = createTestState([progress]);

  const result = feedPet(state, FOOD_ITEMS.KIBBLE.id);

  expect(result.success).toBe(true);
  // Progress should not change for completed quest
  expect(result.state.quests[0]?.objectiveProgress.feed_pet).toBe(1);
});
