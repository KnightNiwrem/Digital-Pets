/**
 * Tests for sleep state transitions.
 */

import { expect, test } from "bun:test";
import {
  createSleepingTestPet,
  createTestPet,
} from "@/game/testing/createTestPet";
import {
  canPerformCareActions,
  processSleepTick,
  putToSleep,
  wakeUp,
} from "./sleep";

test("putToSleep succeeds when pet is awake", () => {
  const pet = createTestPet();
  const result = putToSleep(pet);

  expect(result.success).toBe(true);
  expect(result.sleep.isSleeping).toBe(true);
  expect(result.sleep.sleepStartTime).not.toBeNull();
  expect(result.message).toBe("Pet is now sleeping.");
});

test("putToSleep fails when pet is already sleeping", () => {
  const pet = createSleepingTestPet();
  const result = putToSleep(pet);

  expect(result.success).toBe(false);
  expect(result.message).toBe("Pet is already sleeping.");
});

test("wakeUp succeeds when pet is sleeping", () => {
  const pet = createSleepingTestPet();
  const result = wakeUp(pet);

  expect(result.success).toBe(true);
  expect(result.sleep.isSleeping).toBe(false);
  expect(result.sleep.sleepStartTime).toBeNull();
  expect(result.message).toBe("Pet is now awake.");
});

test("wakeUp fails when pet is already awake", () => {
  const pet = createTestPet();
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
  const pet = createSleepingTestPet();
  expect(canPerformCareActions(pet)).toBe(false);
});

test("canPerformCareActions returns true when awake", () => {
  const pet = createTestPet();
  expect(canPerformCareActions(pet)).toBe(true);
});
