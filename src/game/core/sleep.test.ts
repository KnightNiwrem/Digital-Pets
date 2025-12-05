/**
 * Tests for sleep state transitions.
 */

import { expect, test } from "bun:test";
import {
  createSleepingTestPet,
  createTestPet,
} from "@/game/testing/createTestPet";
import { ActivityState } from "@/game/types/constants";
import {
  canPerformCareActions,
  getRemainingMinSleep,
  hasMetSleepRequirement,
  processSleepTick,
  putToSleep,
  resetDailySleep,
  wakeUp,
} from "./sleep";

// Fixed timestamp for deterministic test fixtures
const FROZEN_TIME = 1_733_400_000_000;

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

test("putToSleep fails when pet is training", () => {
  const pet = createTestPet({ activityState: ActivityState.Training });
  const result = putToSleep(pet);

  expect(result.success).toBe(false);
  expect(result.message).toContain("training");
});

test("putToSleep fails when pet is exploring", () => {
  const pet = createTestPet({ activityState: ActivityState.Exploring });
  const result = putToSleep(pet);

  expect(result.success).toBe(false);
  expect(result.message).toContain("exploring");
});

test("putToSleep fails when pet is battling", () => {
  const pet = createTestPet({ activityState: ActivityState.Battling });
  const result = putToSleep(pet);

  expect(result.success).toBe(false);
  expect(result.message).toContain("battling");
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
    sleepStartTime: FROZEN_TIME,
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

// New tests for sleep requirements

test("getRemainingMinSleep returns correct remaining sleep needed", () => {
  const pet = createTestPet({
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 500 },
  });
  // Baby requires 1920 ticks, slept 500, so needs 1420 more
  expect(getRemainingMinSleep(pet)).toBe(1420);
});

test("getRemainingMinSleep returns 0 when requirement met", () => {
  const pet = createTestPet({
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 2000 },
  });
  expect(getRemainingMinSleep(pet)).toBe(0);
});

test("hasMetSleepRequirement returns false when under requirement", () => {
  const pet = createTestPet({
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 500 },
  });
  expect(hasMetSleepRequirement(pet)).toBe(false);
});

test("hasMetSleepRequirement returns true when requirement met", () => {
  const pet = createTestPet({
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 1920 },
  });
  expect(hasMetSleepRequirement(pet)).toBe(true);
});

test("hasMetSleepRequirement returns true when exceeded requirement", () => {
  const pet = createTestPet({
    sleep: { isSleeping: false, sleepStartTime: null, sleepTicksToday: 2500 },
  });
  expect(hasMetSleepRequirement(pet)).toBe(true);
});

test("resetDailySleep resets sleepTicksToday to 0", () => {
  const sleep = {
    isSleeping: true,
    sleepStartTime: FROZEN_TIME,
    sleepTicksToday: 1500,
  };
  const result = resetDailySleep(sleep);

  expect(result.sleepTicksToday).toBe(0);
  expect(result.isSleeping).toBe(true); // Should preserve sleeping state
  expect(result.sleepStartTime).toBe(sleep.sleepStartTime);
});
