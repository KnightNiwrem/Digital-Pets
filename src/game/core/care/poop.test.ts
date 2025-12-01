/**
 * Tests for poop generation and effects logic.
 *
 * The poop system uses a decay-rate approach:
 * - Timer starts at POOP_MICRO_THRESHOLD (960)
 * - Awake: decays by 2 per tick (960/2 = 480 ticks to poop)
 * - Sleeping: decays by 1 per tick (960/1 = 960 ticks to poop)
 *
 * This ensures mid-cycle state changes properly adjust timing.
 */

import { expect, test } from "bun:test";
import { createTestPet } from "@/game/testing/createTestPet";
import {
  MAX_POOP_COUNT,
  POOP_DECAY_AWAKE,
  POOP_DECAY_SLEEPING,
  POOP_MICRO_THRESHOLD,
} from "./constants";
import { getInitialPoopTimer, processPoopTick, removePoop } from "./poop";

test("getInitialPoopTimer returns micro threshold", () => {
  expect(getInitialPoopTimer()).toBe(POOP_MICRO_THRESHOLD);
});

test("processPoopTick decrements timer by awake decay rate when awake", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: 100 },
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 0 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(0);
  expect(result.ticksUntilNext).toBe(100 - POOP_DECAY_AWAKE);
});

test("processPoopTick decrements timer by sleeping decay rate when asleep", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: 100 },
    sleep: { isSleeping: true, sleepStartTime: Date.now(), sleepTicksToday: 0 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(0);
  expect(result.ticksUntilNext).toBe(100 - POOP_DECAY_SLEEPING);
});

test("processPoopTick generates poop when timer reaches 0 while awake", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: POOP_DECAY_AWAKE },
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 0 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(1);
  expect(result.ticksUntilNext).toBe(POOP_MICRO_THRESHOLD);
});

test("processPoopTick generates poop when timer reaches 0 while sleeping", () => {
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: POOP_DECAY_SLEEPING },
    sleep: { isSleeping: true, sleepStartTime: Date.now(), sleepTicksToday: 0 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(1);
  expect(result.ticksUntilNext).toBe(POOP_MICRO_THRESHOLD);
});

test("processPoopTick carries over remainder when generating poop", () => {
  // Timer at 3, awake decay is 2, so after tick: 3-2=1, not 0, no poop yet
  // Timer at 2, awake decay is 2, so after tick: 2-2=0, poop generated
  const pet = createTestPet({
    poop: { count: 0, ticksUntilNext: 3 },
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 0 },
  });

  // First tick: 3-2=1, no poop
  const result1 = processPoopTick(pet);
  expect(result1.count).toBe(0);
  expect(result1.ticksUntilNext).toBe(1);

  // Second tick with timer at 1: 1-2=-1, poop generated with remainder carried
  const pet2 = createTestPet({
    poop: { count: 0, ticksUntilNext: 1 },
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 0 },
  });
  const result2 = processPoopTick(pet2);
  expect(result2.count).toBe(1);
  expect(result2.ticksUntilNext).toBe(POOP_MICRO_THRESHOLD - 1); // Carried over 1 unit
});

test("processPoopTick caps poop count at MAX_POOP_COUNT", () => {
  const pet = createTestPet({
    poop: { count: MAX_POOP_COUNT, ticksUntilNext: POOP_DECAY_AWAKE },
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 0 },
  });

  const result = processPoopTick(pet);

  expect(result.count).toBe(MAX_POOP_COUNT);
});

test("mid-cycle sleep extends remaining time proportionally", () => {
  // Start awake with 480 ticks worth of decay remaining (half way at 480 micro-units)
  // If we sleep now, remaining 480 units / 1 decay = 480 more ticks
  // vs if awake: 480 / 2 = 240 more ticks
  const timerMidway = POOP_MICRO_THRESHOLD / 2; // 480

  const petAwake = createTestPet({
    poop: { count: 0, ticksUntilNext: timerMidway },
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 0 },
  });

  const petSleeping = createTestPet({
    poop: { count: 0, ticksUntilNext: timerMidway },
    sleep: { isSleeping: true, sleepStartTime: Date.now(), sleepTicksToday: 0 },
  });

  // After one tick awake: 480 - 2 = 478
  const resultAwake = processPoopTick(petAwake);
  expect(resultAwake.ticksUntilNext).toBe(timerMidway - POOP_DECAY_AWAKE);

  // After one tick sleeping: 480 - 1 = 479
  const resultSleeping = processPoopTick(petSleeping);
  expect(resultSleeping.ticksUntilNext).toBe(timerMidway - POOP_DECAY_SLEEPING);

  // Sleeping decay is half the rate, so timer decreases slower
  expect(resultSleeping.ticksUntilNext).toBeGreaterThan(
    resultAwake.ticksUntilNext,
  );
});

test("removePoop reduces count correctly", () => {
  expect(removePoop(5, 2)).toBe(3);
  expect(removePoop(3, 1)).toBe(2);
});

test("removePoop does not go below 0", () => {
  expect(removePoop(2, 5)).toBe(0);
  expect(removePoop(0, 1)).toBe(0);
});
