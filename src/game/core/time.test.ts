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

test("calculateCappedOfflineTicks caps at 30 days", () => {
  const time = Date.now();
  const fortyDays = 40 * 24 * 60 * 60 * 1000;
  expect(calculateCappedOfflineTicks(time, time + fortyDays)).toBe(
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

// Daily reset tests
test("getMidnightTimestamp returns start of day", () => {
  const { getMidnightTimestamp } = require("./time");
  // Create a specific date: 2024-01-15 14:30:00 UTC
  const testDate = new Date("2024-01-15T14:30:00.000Z");
  const midnight = getMidnightTimestamp(testDate.getTime());
  const midnightDate = new Date(midnight);
  expect(midnightDate.getHours()).toBe(0);
  expect(midnightDate.getMinutes()).toBe(0);
  expect(midnightDate.getSeconds()).toBe(0);
  expect(midnightDate.getMilliseconds()).toBe(0);
});

test("shouldDailyReset returns true when last reset was before today midnight", () => {
  const { shouldDailyReset } = require("./time");
  // Last reset was yesterday
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);

  expect(shouldDailyReset(yesterday.getTime(), now.getTime())).toBe(true);
});

test("shouldDailyReset returns false when last reset was today", () => {
  const { shouldDailyReset, getMidnightTimestamp } = require("./time");
  const now = new Date();
  now.setHours(14, 0, 0, 0); // 2 PM today
  const todayMidnight = getMidnightTimestamp(now.getTime());

  expect(shouldDailyReset(todayMidnight, now.getTime())).toBe(false);
});

test("shouldDailyReset returns true across midnight boundary", () => {
  const { shouldDailyReset } = require("./time");
  // Last reset was 11:59 PM yesterday
  const now = new Date();
  const lastReset = new Date(now);
  lastReset.setDate(lastReset.getDate() - 1);
  lastReset.setHours(23, 59, 0, 0);

  // Current time is 12:01 AM today
  now.setHours(0, 1, 0, 0);

  expect(shouldDailyReset(lastReset.getTime(), now.getTime())).toBe(true);
});

// countDailyResets tests
test("countDailyResets returns 0 for same day", () => {
  const { countDailyResets } = require("./time");
  const date = new Date();
  date.setHours(10, 0, 0, 0); // 10 AM
  const fromTime = date.getTime();
  date.setHours(14, 0, 0, 0); // 2 PM same day
  const toTime = date.getTime();

  expect(countDailyResets(fromTime, toTime)).toBe(0);
});

test("countDailyResets returns 1 for consecutive days", () => {
  const { countDailyResets } = require("./time");
  const from = new Date();
  from.setHours(23, 0, 0, 0); // 11 PM Day 1
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  to.setHours(1, 0, 0, 0); // 1 AM Day 2

  expect(countDailyResets(from.getTime(), to.getTime())).toBe(1);
});

test("countDailyResets returns 2 for 3 days apart", () => {
  const { countDailyResets } = require("./time");
  const from = new Date();
  from.setHours(11, 0, 0, 0); // 11 AM Day 1
  const to = new Date(from);
  to.setDate(to.getDate() + 2);
  to.setHours(13, 0, 0, 0); // 1 PM Day 3

  // Resets at Day 2 midnight and Day 3 midnight
  expect(countDailyResets(from.getTime(), to.getTime())).toBe(2);
});

test("countDailyResets handles different times of day", () => {
  const { countDailyResets } = require("./time");
  // Late night to early morning next day
  const from = new Date();
  from.setHours(23, 59, 0, 0); // 11:59 PM
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  to.setHours(0, 1, 0, 0); // 12:01 AM next day

  expect(countDailyResets(from.getTime(), to.getTime())).toBe(1);
});

test("countDailyResets returns correct count for 7 days offline", () => {
  const { countDailyResets } = require("./time");
  const from = new Date();
  from.setHours(12, 0, 0, 0); // Noon Day 1
  const to = new Date(from);
  to.setDate(to.getDate() + 7);
  to.setHours(12, 0, 0, 0); // Noon Day 8

  expect(countDailyResets(from.getTime(), to.getTime())).toBe(7);
});
