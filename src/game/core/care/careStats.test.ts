/**
 * Tests for care stat decay logic.
 */

import { expect, test } from "bun:test";
import type { Pet } from "@/game/types/pet";
import {
  applyCareDecay,
  CARE_DECAY_AWAKE,
  CARE_DECAY_SLEEPING,
  getPoopHappinessMultiplier,
} from "./careStats";

function createTestPet(overrides: Partial<Pet> = {}): Pet {
  return {
    identity: {
      id: "test_pet",
      name: "Test Pet",
      speciesId: "florabit",
    },
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 0,
    },
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
    energyStats: {
      energy: 40_000,
    },
    careLifeStats: {
      careLife: 72_000,
    },
    battleStats: {
      strength: 10,
      endurance: 10,
      agility: 10,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    },
    resistances: {
      slashing: 0,
      piercing: 0,
      crushing: 0,
      chemical: 0,
      thermal: 0,
      electric: 0,
    },
    poop: {
      count: 0,
      ticksUntilNext: 480,
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

test("getPoopHappinessMultiplier returns 1.0 for 0-2 poop", () => {
  expect(getPoopHappinessMultiplier(0)).toBe(1.0);
  expect(getPoopHappinessMultiplier(1)).toBe(1.0);
  expect(getPoopHappinessMultiplier(2)).toBe(1.0);
});

test("getPoopHappinessMultiplier returns 1.5 for 3-4 poop", () => {
  expect(getPoopHappinessMultiplier(3)).toBe(1.5);
  expect(getPoopHappinessMultiplier(4)).toBe(1.5);
});

test("getPoopHappinessMultiplier returns 2.0 for 5-6 poop", () => {
  expect(getPoopHappinessMultiplier(5)).toBe(2.0);
  expect(getPoopHappinessMultiplier(6)).toBe(2.0);
});

test("getPoopHappinessMultiplier returns 3.0 for 7+ poop", () => {
  expect(getPoopHappinessMultiplier(7)).toBe(3.0);
  expect(getPoopHappinessMultiplier(10)).toBe(3.0);
});

test("applyCareDecay reduces stats by awake decay rate when awake", () => {
  const pet = createTestPet();
  const newStats = applyCareDecay(pet);

  expect(newStats.satiety).toBe(40_000 - CARE_DECAY_AWAKE);
  expect(newStats.hydration).toBe(40_000 - CARE_DECAY_AWAKE);
  expect(newStats.happiness).toBe(40_000 - CARE_DECAY_AWAKE);
});

test("applyCareDecay reduces stats by sleeping decay rate when sleeping", () => {
  const pet = createTestPet({
    sleep: {
      isSleeping: true,
      sleepStartTime: Date.now(),
      sleepTicksToday: 0,
    },
  });
  const newStats = applyCareDecay(pet);

  expect(newStats.satiety).toBe(40_000 - CARE_DECAY_SLEEPING);
  expect(newStats.hydration).toBe(40_000 - CARE_DECAY_SLEEPING);
  expect(newStats.happiness).toBe(40_000 - CARE_DECAY_SLEEPING);
});

test("applyCareDecay applies poop multiplier to happiness", () => {
  const pet = createTestPet({
    poop: {
      count: 7,
      ticksUntilNext: 480,
    },
  });
  const newStats = applyCareDecay(pet);

  // Happiness decay should be multiplied by 3.0
  const expectedHappinessDecay = Math.floor(CARE_DECAY_AWAKE * 3.0);
  expect(newStats.happiness).toBe(40_000 - expectedHappinessDecay);

  // Other stats should not be affected
  expect(newStats.satiety).toBe(40_000 - CARE_DECAY_AWAKE);
  expect(newStats.hydration).toBe(40_000 - CARE_DECAY_AWAKE);
});

test("applyCareDecay does not go below 0", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 10,
      hydration: 10,
      happiness: 10,
    },
  });
  const newStats = applyCareDecay(pet);

  expect(newStats.satiety).toBe(0);
  expect(newStats.hydration).toBe(0);
  expect(newStats.happiness).toBe(0);
});
