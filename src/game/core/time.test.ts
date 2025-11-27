/**
 * Tests for time utilities.
 */

import { expect, test } from "bun:test";
import { formatTicksAsTime } from "@/game/types/common";
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

// formatTicksAsTime tests
test("formatTicksAsTime formats 0 ticks", () => {
  expect(formatTicksAsTime(0)).toBe("0m");
});

test("formatTicksAsTime formats 1 tick (less than a minute)", () => {
  expect(formatTicksAsTime(1)).toBe("0m");
});

test("formatTicksAsTime formats minutes", () => {
  expect(formatTicksAsTime(2)).toBe("1m"); // 2 ticks = 60 seconds = 1 minute
});

test("formatTicksAsTime formats hours", () => {
  expect(formatTicksAsTime(120)).toBe("1h"); // 120 ticks = 1 hour
});

test("formatTicksAsTime formats hours and minutes", () => {
  expect(formatTicksAsTime(150)).toBe("1h 15m"); // 150 ticks = 1h 15m
});

test("formatTicksAsTime formats days", () => {
  expect(formatTicksAsTime(2880)).toBe("1d"); // 2880 ticks = 1 day
});

test("formatTicksAsTime formats days and hours", () => {
  expect(formatTicksAsTime(3000)).toBe("1d 1h"); // 1 day + 1 hour
});

test("formatTicksAsTime formats days and minutes (no hours)", () => {
  // 1 day + 30 minutes = 2880 + 1 tick = 2881 ticks (but that's only 30 seconds)
  // 1 day + 30 minutes = 2880 + 1 tick won't give 30 minutes
  // 30 minutes = 60 ticks, so 1 day + 30 min = 2880 + 60 = 2940 ticks
  expect(formatTicksAsTime(2940)).toBe("1d 30m"); // 1 day + 30 minutes
});
