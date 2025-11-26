/**
 * Tests for poop generation and effects logic.
 */

import { expect, test } from "bun:test";
import { now } from "@/game/types/common";
import type { Pet } from "@/game/types/pet";
import {
  createDefaultBattleStats,
  createDefaultResistances,
} from "@/game/types/stats";
import {
  getInitialPoopTimer,
  MAX_POOP_COUNT,
  POOP_INTERVAL_AWAKE,
  POOP_INTERVAL_SLEEPING,
  processPoopTick,
  removePoop,
} from "./poop";

// Helper to create a minimal pet for testing
function createTestPet(overrides: Partial<Pet> = {}): Pet {
  return {
    identity: {
      id: "test-pet",
      name: "Test Pet",
      speciesId: "species_blob",
    },
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: now(),
      ageTicks: 0,
    },
    careStats: {
      satiety: 50000,
      hydration: 50000,
      happiness: 50000,
    },
    energyStats: {
      energy: 50000,
    },
    careLifeStats: {
      careLife: 72000,
    },
    battleStats: createDefaultBattleStats(),
    resistances: createDefaultResistances(),
    poop: {
      count: 0,
      ticksUntilNext: POOP_INTERVAL_AWAKE,
    },
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: 0,
    },
    activityState: "idle",
    ...overrides,
  };
}

test("getInitialPoopTimer returns awake interval", () => {
  expect(getInitialPoopTimer()).toBe(POOP_INTERVAL_AWAKE);
});

test("processPoopTick decrements timer when not ready", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: 100 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(0);
  expect(result.ticksUntilNext).toBe(99);
});

test("processPoopTick generates poop when timer reaches 0", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: 1 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(1);
  expect(result.ticksUntilNext).toBe(POOP_INTERVAL_AWAKE);
});

test("processPoopTick uses sleeping interval when pet is asleep", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: 1 },
    sleep: { isSleeping: true, sleepStartTime: now(), sleepTicksToday: 0 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(1);
  expect(result.ticksUntilNext).toBe(POOP_INTERVAL_SLEEPING);
});

test("processPoopTick caps poop count at MAX_POOP_COUNT", () => {
  const pet = createTestPet({
    poop: { count: MAX_POOP_COUNT, ticksUntilNext: 1 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(MAX_POOP_COUNT);
});

test("removePoop reduces count correctly", () => {
  expect(removePoop(5, 2)).toBe(3);
  expect(removePoop(3, 1)).toBe(2);
});

test("removePoop does not go below 0", () => {
  expect(removePoop(2, 5)).toBe(0);
  expect(removePoop(0, 1)).toBe(0);
});
