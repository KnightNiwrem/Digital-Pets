/**
 * Tests for sleep state actions.
 */

import { expect, test } from "bun:test";
import { createDefaultBonusMaxStats } from "@/game/core/petStats";
import { createDefaultBattleStats } from "@/game/testing/createTestPet";
import { setupTimeFreezing } from "@/game/testing/time";
import { ActivityState, GrowthStage } from "@/game/types/constants";
import type { GameState } from "@/game/types/gameState";
import { createInitialSkills } from "@/game/types/skill";
import { createDefaultResistances } from "@/game/types/stats";
import { sleepPet, wakePet } from "./sleep";

setupTimeFreezing();

function createTestGameState(isSleeping: boolean): GameState {
  return {
    version: 1,
    lastSaveTime: Date.now(),
    lastDailyReset: Date.now(),
    lastWeeklyReset: Date.now(),
    totalTicks: 0,
    pet: {
      identity: {
        id: "test-pet",
        name: "Test Pet",
        speciesId: "florabit",
      },
      growth: {
        stage: GrowthStage.Baby,
        substage: 1,
        birthTime: Date.now(),
        ageTicks: 0,
      },
      careStats: {
        satiety: 50_000,
        hydration: 50_000,
        happiness: 50_000,
      },
      energyStats: {
        energy: 25_000,
      },
      careLifeStats: {
        careLife: 72_000,
      },
      battleStats: createDefaultBattleStats(),
      trainedBattleStats: createDefaultBattleStats(),
      resistances: createDefaultResistances(),
      bonusMaxStats: createDefaultBonusMaxStats(),
      poop: {
        count: 0,
        ticksUntilNext: 480,
      },
      sleep: {
        isSleeping,
        sleepStartTime: isSleeping ? Date.now() : null,
        sleepTicksToday: 0,
      },
      activityState: isSleeping ? ActivityState.Sleeping : ActivityState.Idle,
    },
    player: {
      inventory: { items: [] },
      currency: { coins: 0 },
      currentLocationId: "home",
      skills: createInitialSkills(),
    },
    quests: [],
    isInitialized: true,
    pendingEvents: [],
    pendingNotifications: [],
  };
}

function createEmptyGameState(): GameState {
  return {
    version: 1,
    lastSaveTime: Date.now(),
    lastDailyReset: Date.now(),
    lastWeeklyReset: Date.now(),
    totalTicks: 0,
    pet: null,
    player: {
      inventory: { items: [] },
      currency: { coins: 0 },
      currentLocationId: "home",
      skills: createInitialSkills(),
    },
    quests: [],
    isInitialized: true,
    pendingEvents: [],
    pendingNotifications: [],
  };
}

test("sleepPet succeeds when pet is awake", () => {
  const state = createTestGameState(false);
  const result = sleepPet(state);

  expect(result.success).toBe(true);
  expect(result.state.pet?.sleep.isSleeping).toBe(true);
  expect(result.state.pet?.activityState).toBe(ActivityState.Sleeping);
  expect(result.message).toBe("Pet is now sleeping.");
});

test("sleepPet fails when pet is already sleeping", () => {
  const state = createTestGameState(true);
  const result = sleepPet(state);

  expect(result.success).toBe(false);
  expect(result.state.pet?.sleep.isSleeping).toBe(true);
  expect(result.message).toBe("Pet is already sleeping.");
});

test("sleepPet fails when no pet exists", () => {
  const state = createEmptyGameState();
  const result = sleepPet(state);

  expect(result.success).toBe(false);
  expect(result.state.pet).toBeNull();
  expect(result.message).toBe("No pet to put to sleep.");
});

test("sleepPet does not change activityState on failure", () => {
  const state = createTestGameState(true);
  const result = sleepPet(state);

  expect(result.success).toBe(false);
  expect(result.state.pet?.activityState).toBe(ActivityState.Sleeping);
});

test("wakePet succeeds when pet is sleeping", () => {
  const state = createTestGameState(true);
  const result = wakePet(state);

  expect(result.success).toBe(true);
  expect(result.state.pet?.sleep.isSleeping).toBe(false);
  expect(result.state.pet?.activityState).toBe(ActivityState.Idle);
  expect(result.message).toBe("Pet is now awake.");
});

test("wakePet fails when pet is already awake", () => {
  const state = createTestGameState(false);
  const result = wakePet(state);

  expect(result.success).toBe(false);
  expect(result.state.pet?.sleep.isSleeping).toBe(false);
  expect(result.message).toBe("Pet is already awake.");
});

test("wakePet fails when no pet exists", () => {
  const state = createEmptyGameState();
  const result = wakePet(state);

  expect(result.success).toBe(false);
  expect(result.state.pet).toBeNull();
  expect(result.message).toBe("No pet to wake up.");
});

test("wakePet does not change activityState on failure", () => {
  const state = createTestGameState(false);
  const result = wakePet(state);

  expect(result.success).toBe(false);
  expect(result.state.pet?.activityState).toBe(ActivityState.Idle);
});

test("sleepPet preserves other state properties", () => {
  const state = createTestGameState(false);
  state.player.currency.coins = 100;
  state.totalTicks = 50;

  const result = sleepPet(state);

  expect(result.state.player.currency.coins).toBe(100);
  expect(result.state.totalTicks).toBe(50);
  expect(result.state.pet?.careStats.satiety).toBe(50_000);
});

test("wakePet preserves other state properties", () => {
  const state = createTestGameState(true);
  state.player.currency.coins = 100;
  state.totalTicks = 50;

  const result = wakePet(state);

  expect(result.state.player.currency.coins).toBe(100);
  expect(result.state.totalTicks).toBe(50);
  expect(result.state.pet?.careStats.satiety).toBe(50_000);
});
