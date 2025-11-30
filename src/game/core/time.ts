/**
 * Time utilities for game tick calculations.
 */

import type { Tick, Timestamp } from "@/game/types/common";
import {
  msToTicks,
  now,
  TICK_DURATION_MS,
  TICKS_PER_DAY,
} from "@/game/types/common";

/** Milliseconds per day */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Milliseconds per week */
export const MS_PER_WEEK = 7 * MS_PER_DAY;

/**
 * Maximum ticks to process for offline catch-up (30 days).
 * This cap applies universally to all offline processing (care, growth, training, etc.)
 * to prevent extreme scenarios while still allowing for pet death by neglect.
 */
export const MAX_OFFLINE_TICKS: Tick = TICKS_PER_DAY * 30;

/**
 * Calculate elapsed ticks between two timestamps.
 */
export function calculateElapsedTicks(
  lastSaveTime: Timestamp,
  currentTime: Timestamp = now(),
): Tick {
  const elapsedMs = currentTime - lastSaveTime;
  if (elapsedMs < 0) return 0;
  return msToTicks(elapsedMs);
}

/**
 * Calculate offline ticks with the 30-day cap.
 */
export function calculateCappedOfflineTicks(
  lastSaveTime: Timestamp,
  currentTime: Timestamp = now(),
): Tick {
  const elapsed = calculateElapsedTicks(lastSaveTime, currentTime);
  return Math.min(elapsed, MAX_OFFLINE_TICKS);
}

/**
 * Get the next tick timestamp from a given time.
 */
export function getNextTickTime(fromTime: Timestamp = now()): Timestamp {
  const timeSinceLastTick = fromTime % TICK_DURATION_MS;
  return fromTime + (TICK_DURATION_MS - timeSinceLastTick);
}

/**
 * Calculate remaining milliseconds until next tick.
 */
export function msUntilNextTick(currentTime: Timestamp = now()): number {
  const timeSinceLastTick = currentTime % TICK_DURATION_MS;
  return TICK_DURATION_MS - timeSinceLastTick;
}

/**
 * Get the timestamp for midnight (start of day) in local time for a given timestamp.
 */
export function getMidnightTimestamp(timestamp: Timestamp = now()): Timestamp {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Check if a daily reset should occur.
 * Daily reset happens at midnight local time.
 * Per spec (time-mechanics.md): Daily reset | Midnight local time
 */
export function shouldDailyReset(
  lastDailyReset: Timestamp,
  currentTime: Timestamp = now(),
): boolean {
  // Get midnight of the current day
  const todayMidnight = getMidnightTimestamp(currentTime);
  // If last reset was before today's midnight, we need a reset
  return lastDailyReset < todayMidnight;
}

/**
 * Count how many daily resets have occurred between two timestamps.
 * Useful for batch processing offline progression.
 */
export function countDailyResets(
  fromTime: Timestamp,
  toTime: Timestamp = now(),
): number {
  const firstReset = getMidnightTimestamp(fromTime) + MS_PER_DAY;
  if (toTime < firstReset) {
    return 0;
  }
  const lastReset = getMidnightTimestamp(toTime);
  return Math.floor((lastReset - firstReset) / MS_PER_DAY) + 1;
}

/**
 * Get the timestamp for the start of the current week (Monday midnight) in local time.
 */
export function getWeekStartTimestamp(timestamp: Timestamp = now()): Timestamp {
  const date = new Date(timestamp);
  const dayOfWeek = date.getDay();
  // Convert Sunday (0) to 7 for easier calculation, Monday is 1
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setDate(date.getDate() - daysFromMonday);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Check if a weekly reset should occur.
 * Weekly reset happens at Monday midnight local time.
 */
export function shouldWeeklyReset(
  lastWeeklyReset: Timestamp,
  currentTime: Timestamp = now(),
): boolean {
  const thisWeekStart = getWeekStartTimestamp(currentTime);
  return lastWeeklyReset < thisWeekStart;
}

/**
 * Get the next daily reset timestamp (midnight).
 */
export function getNextDailyReset(currentTime: Timestamp = now()): Timestamp {
  return getMidnightTimestamp(currentTime) + MS_PER_DAY;
}

/**
 * Get the next weekly reset timestamp (Monday midnight).
 */
export function getNextWeeklyReset(currentTime: Timestamp = now()): Timestamp {
  return getWeekStartTimestamp(currentTime) + MS_PER_WEEK;
}
