/**
 * Common types used throughout the game.
 * These represent fundamental units and measurements.
 */

/**
 * Micro-unit values for precise integer arithmetic.
 * Display value = floor(microValue / 1000)
 *
 * Used for: Satiety, Hydration, Happiness, Energy, Care Life
 */
export type MicroValue = number;

/**
 * Conversion ratio from micro-units to display units.
 */
export const MICRO_RATIO = 1000;

/**
 * Convert a micro-value to its display value.
 */
export function toDisplay(microValue: MicroValue): number {
  return Math.floor(microValue / MICRO_RATIO);
}

/**
 * Convert a display value to its micro-value.
 */
export function toMicro(displayValue: number): MicroValue {
  return displayValue * MICRO_RATIO;
}

/**
 * Unix timestamp in milliseconds.
 */
export type Timestamp = number;

/**
 * Game tick count. One tick = 30 seconds.
 *
 * Conversion reference:
 * - 1 minute = 2 ticks
 * - 1 hour = 120 ticks
 * - 1 day = 2880 ticks
 */
export type Tick = number;

/**
 * Duration of one game tick in milliseconds.
 */
export const TICK_DURATION_MS = 30_000;

/**
 * Ticks per hour (120).
 */
export const TICKS_PER_HOUR = 120;

/**
 * Ticks per day (2880).
 */
export const TICKS_PER_DAY = 2880;

/**
 * Ticks per month (86,400 = 30 days).
 * Used for adult substage duration.
 */
export const TICKS_PER_MONTH = 86_400;

/**
 * Convert milliseconds to ticks.
 */
export function msToTicks(ms: number): Tick {
  return Math.floor(ms / TICK_DURATION_MS);
}

/**
 * Convert ticks to milliseconds.
 */
export function ticksToMs(ticks: Tick): number {
  return ticks * TICK_DURATION_MS;
}

/**
 * Get the current timestamp.
 */
export function now(): Timestamp {
  return Date.now();
}

/**
 * Format ticks as a human-readable time string.
 */
export function formatTicksAsTime(ticks: Tick): string {
  const totalMinutes = Math.floor((ticks * TICK_DURATION_MS) / (1000 * 60));
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
