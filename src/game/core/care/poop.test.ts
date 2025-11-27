/**
 * Tests for poop generation and effects logic.
 */

import { expect, test } from "bun:test";
import { createTestPet } from "@/game/testing/createTestPet";
import {
  getInitialPoopTimer,
  MAX_POOP_COUNT,
  POOP_INTERVAL_AWAKE,
  POOP_INTERVAL_SLEEPING,
  processPoopTick,
  removePoop,
} from "./poop";

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
    sleep: { isSleeping: true, sleepStartTime: Date.now(), sleepTicksToday: 0 },
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
