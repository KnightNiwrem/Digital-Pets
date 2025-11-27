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

/**
 * Maximum ticks to process for offline catch-up (7 days).
 */
export const MAX_OFFLINE_TICKS: Tick = TICKS_PER_DAY * 7;

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
 * Calculate offline ticks with the 7-day cap.
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
  const startMidnight = getMidnightTimestamp(fromTime);
  const endMidnight = getMidnightTimestamp(toTime);
  // Calculate the number of days between the two midnights
  const msDiff = endMidnight - startMidnight;
  const daysDiff = Math.floor(msDiff / (24 * 60 * 60 * 1000));
  // If from is before its midnight and to is after its midnight, we have at least one reset
  return fromTime < startMidnight + 24 * 60 * 60 * 1000 ? daysDiff : daysDiff;
}
