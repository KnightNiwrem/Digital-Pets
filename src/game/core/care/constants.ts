/**
 * Centralized constants for the care system.
 *
 * Per spec (care-system.md, training.md):
 * All time-based mechanics operate on game ticks (30 seconds each).
 */

import type { MicroValue, Tick } from "@/game/types/common";

// =============================================================================
// Percentage Constants
// =============================================================================

/**
 * Maximum percentage value for progress calculations.
 */
export const MAX_PERCENTAGE = 100;

// =============================================================================
// Care Stat Decay Rates
// =============================================================================

/**
 * Care stat decay rates per tick (micro-units).
 * Per spec (care-system.md):
 * - Awake: -50 per tick → -6000 micro/hour = -6 display/hour
 * - Sleeping: -25 per tick → -3000 micro/hour = -3 display/hour
 */
export const CARE_DECAY_AWAKE: MicroValue = 50;
export const CARE_DECAY_SLEEPING: MicroValue = 25;

// =============================================================================
// Poop System
// =============================================================================

/**
 * Poop generation uses a micro-threshold system with different decay rates.
 * This allows mid-cycle state changes (awake<->sleeping) to properly adjust timing.
 *
 * Per spec (care-system.md):
 * - Awake: poop every 480 ticks (4 hours)
 * - Sleeping: poop every 960 ticks (8 hours)
 *
 * Implementation:
 * - POOP_MICRO_THRESHOLD = 960 (chosen as LCM-friendly value)
 * - POOP_DECAY_AWAKE = 2 (960 / 480 = 2, so 480 ticks to generate)
 * - POOP_DECAY_SLEEPING = 1 (960 / 960 = 1, so 960 ticks to generate)
 */
export const POOP_MICRO_THRESHOLD: Tick = 960;
export const POOP_DECAY_AWAKE: Tick = 2;
export const POOP_DECAY_SLEEPING: Tick = 1;

/**
 * Base poop acceleration value in micro-units.
 * Per spec (care-system.md): 60 ticks (30 minutes) standard = 120 micro-units.
 * Item poop acceleration values are in micro-units and applied directly to the timer.
 */
export const POOP_ACCELERATION_BASE: Tick = 120;

/**
 * Maximum poop count (cap from time mechanics).
 * Per spec (time-mechanics.md): 50 poop max.
 */
export const MAX_POOP_COUNT = 50;

/**
 * Poop happiness decay multipliers.
 * Per spec (care-system.md):
 * - 0-2 poop: ×1 (normal)
 * - 3-4 poop: ×1.5
 * - 5-6 poop: ×2
 * - 7+ poop: ×3, Care Life drains faster
 */
export const POOP_HAPPINESS_MULTIPLIERS: readonly [number, number][] = [
  [7, 3.0], // 7+ poop: ×3
  [5, 2.0], // 5-6 poop: ×2
  [3, 1.5], // 3-4 poop: ×1.5
  [0, 1.0], // 0-2 poop: ×1 (normal)
];

/**
 * Poop count threshold for additional care life drain.
 */
export const POOP_CARE_LIFE_DRAIN_THRESHOLD = 7;

// =============================================================================
// Care Life Drain/Recovery
// =============================================================================

/**
 * Care life drain rates per tick when care stats are at 0.
 * Per spec (care-system.md):
 * - 1 stat at 0: -8 per tick
 * - 2 stats at 0: -25 per tick
 * - 3 stats at 0: -50 per tick
 */
export const CARE_LIFE_DRAIN_1_STAT: MicroValue = 8;
export const CARE_LIFE_DRAIN_2_STATS: MicroValue = 25;
export const CARE_LIFE_DRAIN_3_STATS: MicroValue = 50;

/**
 * Additional care life drain when poop count is 7+.
 * Per spec (care-system.md): -8 per tick.
 */
export const CARE_LIFE_DRAIN_POOP: MicroValue = 8;

/**
 * Care life recovery rates per tick when care stats are healthy.
 * Per spec (care-system.md):
 * - All stats > 50% max: +8 per tick
 * - All stats > 75% max: +16 per tick
 * - All stats = 100% max: +25 per tick
 */
export const CARE_LIFE_RECOVERY_ABOVE_50: MicroValue = 8;
export const CARE_LIFE_RECOVERY_ABOVE_75: MicroValue = 16;
export const CARE_LIFE_RECOVERY_AT_100: MicroValue = 25;

/**
 * Care stat thresholds for care life recovery (percentages).
 */
export const CARE_LIFE_RECOVERY_THRESHOLD_100 = 100;
export const CARE_LIFE_RECOVERY_THRESHOLD_75 = 75;
export const CARE_LIFE_RECOVERY_THRESHOLD_50 = 50;

// =============================================================================
// Energy Regeneration
// =============================================================================

/**
 * Energy regeneration rates per tick (micro-units).
 * Per spec (training.md):
 * - Awake: +40 per tick → ~4800 micro/hour = ~4.8 display/hour
 * - Sleeping: +120 per tick → ~14400 micro/hour = ~14.4 display/hour
 */
export const ENERGY_REGEN_AWAKE: MicroValue = 40;
export const ENERGY_REGEN_SLEEPING: MicroValue = 120;
