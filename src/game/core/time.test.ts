/**
 * Tests for time utilities.
 */

import { expect, test } from "bun:test";
import {
  calculateCappedOfflineTicks,
  calculateElapsedTicks,
  MAX_OFFLINE_TICKS,
  msUntilNextTick,
} from "./time";

test("calculateElapsedTicks returns 0 for same timestamp", () => {
  const time = Date.now();
  expect(calculateElapsedTicks(time, time)).toBe(0);
});

test("calculateElapsedTicks returns 1 for 30 seconds", () => {
  const time = Date.now();
  expect(calculateElapsedTicks(time, time + 30_000)).toBe(1);
});

test("calculateElapsedTicks returns 2 for 60 seconds", () => {
  const time = Date.now();
  expect(calculateElapsedTicks(time, time + 60_000)).toBe(2);
});

test("calculateElapsedTicks returns 120 for 1 hour", () => {
  const time = Date.now();
  expect(calculateElapsedTicks(time, time + 60 * 60 * 1000)).toBe(120);
});

test("calculateElapsedTicks returns 0 for negative elapsed time", () => {
  const time = Date.now();
  expect(calculateElapsedTicks(time, time - 30_000)).toBe(0);
});

test("calculateCappedOfflineTicks caps at 7 days", () => {
  const time = Date.now();
  const tenDays = 10 * 24 * 60 * 60 * 1000;
  expect(calculateCappedOfflineTicks(time, time + tenDays)).toBe(
    MAX_OFFLINE_TICKS,
  );
});

test("calculateCappedOfflineTicks returns actual ticks when under cap", () => {
  const time = Date.now();
  const oneHour = 60 * 60 * 1000;
  expect(calculateCappedOfflineTicks(time, time + oneHour)).toBe(120);
});

test("msUntilNextTick returns correct remaining time", () => {
  const time = 30_000; // Exactly at a tick boundary
  expect(msUntilNextTick(time)).toBe(30_000);
});

test("msUntilNextTick returns remaining time mid-tick", () => {
  const time = 15_000; // Halfway through a tick
  expect(msUntilNextTick(time)).toBe(15_000);
});
