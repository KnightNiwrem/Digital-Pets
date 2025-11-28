/**
 * Tests for tick processor batch processing.
 */

import { expect, test } from "bun:test";
import { createTestPet } from "@/game/testing/createTestPet";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import {
  processGameTick,
  processMultipleTicks,
  processOfflineCatchup,
} from "./tickProcessor";

function createTestGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState(),
    ...overrides,
  };
}

// Tests for processGameTick

test("processGameTick updates state when no pet", () => {
  const state = createTestGameState({ pet: null, totalTicks: 5 });
  const newState = processGameTick(state);

  expect(newState.totalTicks).toBe(6);
  expect(newState.lastSaveTime).toBeGreaterThan(0);
  expect(newState.pet).toBeNull();
});

test("processGameTick updates totalTicks", () => {
  const state = createTestGameState({ pet: createTestPet(), totalTicks: 10 });
  const newState = processGameTick(state);

  expect(newState.totalTicks).toBe(11);
});

test("processGameTick updates lastSaveTime", () => {
  const state = createTestGameState({ pet: createTestPet(), lastSaveTime: 0 });
  const newState = processGameTick(state);

  expect(newState.lastSaveTime).toBeGreaterThan(0);
});

test("processGameTick processes pet tick", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet });
  const newState = processGameTick(state);

  // Pet should have been processed - age incremented
  expect(newState.pet?.growth.ageTicks).toBe(1);
  // Care stats should have decayed
  expect(newState.pet?.careStats.satiety).toBeLessThan(pet.careStats.satiety);
});

// Tests for processMultipleTicks

test("processMultipleTicks processes ticks sequentially", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const newState = processMultipleTicks(state, 5);

  expect(newState.totalTicks).toBe(5);
  expect(newState.pet?.growth.ageTicks).toBe(5);
});

test("processMultipleTicks handles 0 ticks", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 10 });
  const newState = processMultipleTicks(state, 0);

  expect(newState.totalTicks).toBe(10);
  expect(newState.pet?.growth.ageTicks).toBe(0);
});

test("processMultipleTicks applies cumulative stat decay", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
  });
  const state = createTestGameState({ pet });
  const newState = processMultipleTicks(state, 10);

  // After 10 ticks, stats should have decayed significantly more than 1 tick
  const singleTickState = processGameTick(
    createTestGameState({
      pet: createTestPet({
        careStats: {
          satiety: 40_000,
          hydration: 40_000,
          happiness: 40_000,
        },
      }),
    }),
  );

  expect(newState.pet?.careStats.satiety).toBeLessThan(
    singleTickState.pet?.careStats.satiety ?? 0,
  );
});

// Tests for processOfflineCatchup

test("processOfflineCatchup processes correct number of ticks", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 100, 500);

  expect(result.ticksProcessed).toBe(100);
  expect(result.wasCapped).toBe(false);
  expect(result.state.pet?.growth.ageTicks).toBe(100);
});

test("processOfflineCatchup caps ticks at max", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 1000, 500);

  expect(result.ticksProcessed).toBe(500);
  expect(result.wasCapped).toBe(true);
  expect(result.state.pet?.growth.ageTicks).toBe(500);
});

test("processOfflineCatchup sets wasCapped correctly when under cap", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 50, 100);

  expect(result.wasCapped).toBe(false);
});

test("processOfflineCatchup sets wasCapped correctly when at exact cap", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 100, 100);

  expect(result.wasCapped).toBe(false);
});

test("processOfflineCatchup updates totalTicks correctly", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 50 });
  const result = processOfflineCatchup(state, 30, 100);

  expect(result.state.totalTicks).toBe(80);
});

test("processOfflineCatchup updates lastSaveTime", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, lastSaveTime: 0, totalTicks: 0 });
  const result = processOfflineCatchup(state, 5, 100);

  expect(result.state.lastSaveTime).toBeGreaterThan(0);
});

test("processOfflineCatchup handles state with no pet", () => {
  const state = createTestGameState({ pet: null, totalTicks: 10 });
  const result = processOfflineCatchup(state, 5, 100);

  expect(result.ticksProcessed).toBe(5);
  expect(result.state.totalTicks).toBe(15);
  expect(result.state.pet).toBeNull();
});

// Tests for offline report maxStats

test("processOfflineCatchup report includes maxStats for valid pet", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 10, 100);

  expect(result.report.maxStats).not.toBeNull();
  expect(result.report.maxStats?.care.satiety).toBeGreaterThan(0);
  expect(result.report.maxStats?.care.hydration).toBeGreaterThan(0);
  expect(result.report.maxStats?.care.happiness).toBeGreaterThan(0);
  expect(result.report.maxStats?.energy).toBeGreaterThan(0);
  expect(result.report.maxStats?.careLife).toBeGreaterThan(0);
});

test("processOfflineCatchup report maxStats is null when no pet", () => {
  const state = createTestGameState({ pet: null, totalTicks: 0 });
  const result = processOfflineCatchup(state, 10, 100);

  expect(result.report.maxStats).toBeNull();
});

test("processOfflineCatchup report maxStats reflects growth stage", () => {
  const babyPet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const adultPet = createTestPet({
    growth: {
      stage: "adult",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 1_000_000,
    },
  });

  const babyState = createTestGameState({ pet: babyPet, totalTicks: 0 });
  const adultState = createTestGameState({ pet: adultPet, totalTicks: 0 });

  const babyResult = processOfflineCatchup(babyState, 1, 100);
  const adultResult = processOfflineCatchup(adultState, 1, 100);

  expect(adultResult.report.maxStats?.care.satiety).toBeGreaterThan(
    babyResult.report.maxStats?.care.satiety ?? 0,
  );
  expect(adultResult.report.maxStats?.energy).toBeGreaterThan(
    babyResult.report.maxStats?.energy ?? 0,
  );
});

test("processOfflineCatchup report includes beforeStats and afterStats", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
    energyStats: {
      energy: 40_000,
    },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 10, 100);

  expect(result.report.beforeStats).not.toBeNull();
  expect(result.report.afterStats).not.toBeNull();
  expect(result.report.beforeStats?.satiety).toBe(40_000);
  // After processing, stats should have decayed
  expect(result.report.afterStats?.satiety).toBeLessThan(40_000);
});

test("processOfflineCatchup calculates elapsedMs from ticks when not provided", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 10, 100);

  // 10 ticks * 30_000ms per tick = 300_000ms
  expect(result.report.elapsedMs).toBe(300_000);
});

test("processOfflineCatchup uses provided elapsedMs", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 10, 100, 500_000);

  expect(result.report.elapsedMs).toBe(500_000);
});

// Tests for daily reset functionality

test("processGameTick triggers daily reset when crossing midnight", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);

  const pet = createTestPet({
    sleep: {
      isSleeping: false,
      sleepTicksToday: 100,
      sleepStartTime: null,
    },
  });
  const state = createTestGameState({
    pet,
    lastDailyReset: yesterday.getTime(),
  });

  const now = Date.now();
  const newState = processGameTick(state, now);

  // Daily sleep counter should be reset
  expect(newState.pet?.sleep.sleepTicksToday).toBe(0);
});

test("processGameTick does not reset when already reset today", () => {
  const { getMidnightTimestamp } = require("./time");
  const now = Date.now();
  const todayMidnight = getMidnightTimestamp(now);

  const pet = createTestPet({
    sleep: {
      isSleeping: false,
      sleepTicksToday: 100,
      sleepStartTime: null,
    },
  });
  const state = createTestGameState({
    pet,
    lastDailyReset: todayMidnight,
  });

  const newState = processGameTick(state, now);

  // Daily sleep counter should NOT be reset
  expect(newState.pet?.sleep.sleepTicksToday).toBe(100);
});

test("processGameTick preserves other pet properties during daily reset", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);

  const pet = createTestPet({
    careStats: {
      satiety: 50_000,
      hydration: 40_000,
      happiness: 30_000,
    },
    sleep: {
      isSleeping: false,
      sleepTicksToday: 100,
      sleepStartTime: null,
    },
  });
  const state = createTestGameState({
    pet,
    lastDailyReset: yesterday.getTime(),
  });

  const now = Date.now();
  const newState = processGameTick(state, now);

  // Care stats should still be processed (decayed)
  expect(newState.pet?.careStats.satiety).toBeLessThan(50_000);
  // But sleep counter should be reset
  expect(newState.pet?.sleep.sleepTicksToday).toBe(0);
});

test("processMultipleTicks triggers daily resets during offline progression", () => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const TICK_DURATION_MS = 30_000;

  // Set up state from 3 days ago
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(12, 0, 0, 0);

  const pet = createTestPet({
    sleep: {
      isSleeping: false,
      sleepTicksToday: 100,
      sleepStartTime: null,
    },
  });
  const state = createTestGameState({
    pet,
    lastSaveTime: threeDaysAgo.getTime(),
    lastDailyReset: threeDaysAgo.getTime() - MS_PER_DAY, // Reset was day before that
  });

  // Process ticks spanning 3 days
  const ticksFor3Days = Math.floor((3 * MS_PER_DAY) / TICK_DURATION_MS);
  const newState = processMultipleTicks(
    state,
    ticksFor3Days,
    threeDaysAgo.getTime(),
  );

  // Sleep counter should be reset (we crossed multiple midnights)
  expect(newState.pet?.sleep.sleepTicksToday).toBe(0);
});

test("processGameTick handles state with no pet during daily reset", () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);

  const state = createTestGameState({
    pet: null,
    lastDailyReset: yesterday.getTime(),
  });

  const now = Date.now();
  const newState = processGameTick(state, now);

  // Should update lastDailyReset without error
  expect(newState.pet).toBeNull();
  // lastDailyReset should be updated to today's midnight
  const { getMidnightTimestamp } = require("./time");
  expect(newState.lastDailyReset).toBe(getMidnightTimestamp(now));
});

test("processGameTick updates quest progress when training completes", () => {
  const { ActivityState } = require("@/game/types/constants");
  const { QuestState } = require("@/game/types/quest");

  const pet = createTestPet({
    activityState: ActivityState.Training,
    activeTraining: {
      facilityId: "strength_gym",
      sessionType: "basic",
      ticksRemaining: 1, // Will complete on this tick
      durationTicks: 10,
      startTick: 0,
      energyCost: 0,
    },
  });

  const state = createTestGameState({
    pet,
    quests: [
      {
        questId: "daily_training_session",
        state: QuestState.Active,
        objectiveProgress: {},
      },
    ],
  });

  const newState = processGameTick(state);

  // Training should be complete
  expect(newState.pet?.activeTraining).toBeUndefined();
  // Quest progress should be updated
  expect(newState.quests[0]?.objectiveProgress.complete_training).toBe(1);
});

test("processGameTick updates quest progress when exploration completes", () => {
  const { ActivityState } = require("@/game/types/constants");
  const { QuestState } = require("@/game/types/quest");

  const pet = createTestPet({
    activityState: ActivityState.Exploring,
    activeExploration: {
      locationId: "meadow",
      activityType: "forage",
      forageTableId: "meadow_forage",
      ticksRemaining: 1, // Will complete on this tick
      durationTicks: 10,
      startTick: 0,
      energyCost: 0,
    },
  });

  const state = createTestGameState({
    pet,
    player: {
      ...createInitialGameState().player,
      currentLocationId: "meadow",
    },
    quests: [
      {
        questId: "daily_forager",
        state: QuestState.Active,
        objectiveProgress: {},
      },
    ],
  });

  const newState = processGameTick(state);

  // Exploration should be complete
  expect(newState.pet?.activeExploration).toBeUndefined();
  // Quest progress should be updated for foraging
  expect(newState.quests[0]?.objectiveProgress.forage_once).toBe(1);
});

// Tests for exploration result collection in offline catchup

test("processOfflineCatchup collects exploration result when exploration completes", () => {
  const { ActivityState } = require("@/game/types/constants");

  const pet = createTestPet({
    activityState: ActivityState.Exploring,
    activeExploration: {
      locationId: "meadow",
      activityType: "forage",
      forageTableId: "meadow_forage",
      ticksRemaining: 3, // Will complete on tick 3
      durationTicks: 10,
      startTick: 0,
      energyCost: 0,
    },
  });

  const state = createTestGameState({
    pet,
    player: {
      ...createInitialGameState().player,
      currentLocationId: "meadow",
    },
    totalTicks: 0,
  });

  const result = processOfflineCatchup(state, 10, 100);

  // Should have collected at least one exploration result
  expect(result.report.explorationResults.length).toBeGreaterThan(0);
  // The result should have the correct location name
  expect(result.report.explorationResults[0]?.locationName).toBe(
    "Sunny Meadow",
  );
});

test("processOfflineCatchup has empty explorationResults when no exploration completes", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 10, 100);

  // No exploration was active, so no results
  expect(result.report.explorationResults).toEqual([]);
});

test("processOfflineCatchup collects exploration result for in-progress exploration", () => {
  const { ActivityState } = require("@/game/types/constants");

  // Exploration that was already in progress before going offline
  // with only 2 ticks remaining
  const pet = createTestPet({
    activityState: ActivityState.Exploring,
    activeExploration: {
      locationId: "meadow",
      activityType: "forage",
      forageTableId: "meadow_forage",
      ticksRemaining: 2,
      durationTicks: 100, // Long duration, but only 2 ticks left
      startTick: 0,
      energyCost: 0,
    },
  });

  const state = createTestGameState({
    pet,
    player: {
      ...createInitialGameState().player,
      currentLocationId: "meadow",
    },
    totalTicks: 0,
  });

  const result = processOfflineCatchup(state, 5, 100);

  // Exploration should have completed and been collected
  expect(result.report.explorationResults.length).toBe(1);
  expect(result.report.explorationResults[0]?.locationName).toBe(
    "Sunny Meadow",
  );
  // Pet should no longer be exploring
  expect(result.state.pet?.activeExploration).toBeUndefined();
});
