/**
 * Tests for sleep state transitions.
 */

import { expect, test } from "bun:test";
import { ActivityState, GrowthStage } from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";
import {
  createDefaultBattleStats,
  createDefaultResistances,
} from "@/game/types/stats";
import {
  canPerformCareActions,
  processSleepTick,
  putToSleep,
  wakeUp,
} from "./sleep";

function createTestPet(isSleeping: boolean): Pet {
  return {
    identity: {
      id: "test-pet",
      name: "Test Pet",
      speciesId: "slime",
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
    resistances: createDefaultResistances(),
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
  };
}

test("putToSleep succeeds when pet is awake", () => {
  const pet = createTestPet(false);
  const result = putToSleep(pet);

  expect(result.success).toBe(true);
  expect(result.sleep.isSleeping).toBe(true);
  expect(result.sleep.sleepStartTime).not.toBeNull();
  expect(result.message).toBe("Pet is now sleeping.");
});

test("putToSleep fails when pet is already sleeping", () => {
  const pet = createTestPet(true);
  const result = putToSleep(pet);

  expect(result.success).toBe(false);
  expect(result.message).toBe("Pet is already sleeping.");
});

test("wakeUp succeeds when pet is sleeping", () => {
  const pet = createTestPet(true);
  const result = wakeUp(pet);

  expect(result.success).toBe(true);
  expect(result.sleep.isSleeping).toBe(false);
  expect(result.sleep.sleepStartTime).toBeNull();
  expect(result.message).toBe("Pet is now awake.");
});

test("wakeUp fails when pet is already awake", () => {
  const pet = createTestPet(false);
  const result = wakeUp(pet);

  expect(result.success).toBe(false);
  expect(result.message).toBe("Pet is already awake.");
});

test("processSleepTick accumulates sleep time when sleeping", () => {
  const sleep = {
    isSleeping: true,
    sleepStartTime: Date.now(),
    sleepTicksToday: 10,
  };
  const result = processSleepTick(sleep);

  expect(result.sleepTicksToday).toBe(11);
  expect(result.isSleeping).toBe(true);
});

test("processSleepTick does not accumulate when awake", () => {
  const sleep = {
    isSleeping: false,
    sleepStartTime: null,
    sleepTicksToday: 10,
  };
  const result = processSleepTick(sleep);

  expect(result.sleepTicksToday).toBe(10);
});

test("canPerformCareActions returns false when sleeping", () => {
  const pet = createTestPet(true);
  expect(canPerformCareActions(pet)).toBe(false);
});

test("canPerformCareActions returns true when awake", () => {
  const pet = createTestPet(false);
  expect(canPerformCareActions(pet)).toBe(true);
});
