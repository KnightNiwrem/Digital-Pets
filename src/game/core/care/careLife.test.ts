/**
 * Tests for care life drain/recovery logic.
 */

import { expect, test } from "bun:test";
import { createTestPet } from "@/game/testing/createTestPet";
import {
  CARE_LIFE_DRAIN_1_STAT,
  CARE_LIFE_DRAIN_2_STATS,
  CARE_LIFE_DRAIN_3_STATS,
  CARE_LIFE_DRAIN_POOP,
  CARE_LIFE_RECOVERY_ABOVE_50,
  CARE_LIFE_RECOVERY_ABOVE_75,
  CARE_LIFE_RECOVERY_AT_100,
  calculateCareLifeChange,
} from "./careLife";

const MAX_CARE_STAT = 50_000; // Baby stage max

test("calculateCareLifeChange drains when 1 stat is at 0", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 0,
      hydration: 40_000,
      happiness: 40_000,
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    -CARE_LIFE_DRAIN_1_STAT,
  );
});

test("calculateCareLifeChange drains when 2 stats are at 0", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 0,
      hydration: 0,
      happiness: 40_000,
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    -CARE_LIFE_DRAIN_2_STATS,
  );
});

test("calculateCareLifeChange drains when 3 stats are at 0", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 0,
      hydration: 0,
      happiness: 0,
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    -CARE_LIFE_DRAIN_3_STATS,
  );
});

test("calculateCareLifeChange adds poop drain when 7+ poop and critical stats", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 0,
      hydration: 40_000,
      happiness: 40_000,
    },
    poop: {
      count: 7,
      ticksUntilNext: 480,
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    -CARE_LIFE_DRAIN_1_STAT - CARE_LIFE_DRAIN_POOP,
  );
});

test("calculateCareLifeChange drains from poop even when stats are okay", () => {
  const pet = createTestPet({
    poop: {
      count: 7,
      ticksUntilNext: 480,
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    -CARE_LIFE_DRAIN_POOP,
  );
});

test("calculateCareLifeChange recovers when all stats above 50%", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 30_000, // 60%
      hydration: 30_000, // 60%
      happiness: 30_000, // 60%
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    CARE_LIFE_RECOVERY_ABOVE_50,
  );
});

test("calculateCareLifeChange recovers faster when all stats above 75%", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 40_000, // 80%
      hydration: 40_000, // 80%
      happiness: 40_000, // 80%
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    CARE_LIFE_RECOVERY_ABOVE_75,
  );
});

test("calculateCareLifeChange recovers fastest when all stats at 100%", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 50_000, // 100%
      hydration: 50_000, // 100%
      happiness: 50_000, // 100%
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(
    CARE_LIFE_RECOVERY_AT_100,
  );
});

test("calculateCareLifeChange returns 0 when stats between 0% and 50%", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 20_000, // 40%
      hydration: 20_000, // 40%
      happiness: 20_000, // 40%
    },
  });

  expect(calculateCareLifeChange(pet, MAX_CARE_STAT)).toBe(0);
});

test("calculateCareLifeChange handles maxCareStat of 0", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
  });

  // Should return 0 (no recovery) when maxCareStat is 0 to avoid division by zero
  expect(calculateCareLifeChange(pet, 0)).toBe(0);
});
