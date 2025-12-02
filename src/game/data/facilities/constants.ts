/**
 * Training facility constants for session configuration.
 */

import { TICKS_PER_HOUR } from "@/game/types/common";

/**
 * Training session configuration constants.
 * These define the energy costs, stat gains, and durations for each session type.
 */
export const TRAINING_SESSION_CONFIG = {
  /**
   * Basic training session - light workout for beginners.
   */
  BASIC: {
    DURATION_HOURS: 1,
    DURATION_TICKS: TICKS_PER_HOUR,
    ENERGY_COST: 10,
    PRIMARY_STAT_GAIN: 1,
    SECONDARY_STAT_GAIN: 0,
  },
  /**
   * Intensive training session - moderate workout requiring child stage.
   */
  INTENSIVE: {
    DURATION_HOURS: 2,
    DURATION_TICKS: TICKS_PER_HOUR * 2,
    ENERGY_COST: 25,
    PRIMARY_STAT_GAIN: 3,
    SECONDARY_STAT_GAIN: 1,
  },
  /**
   * Advanced training session - elite workout requiring teen stage.
   */
  ADVANCED: {
    DURATION_HOURS: 4,
    DURATION_TICKS: TICKS_PER_HOUR * 4,
    ENERGY_COST: 50,
    PRIMARY_STAT_GAIN: 6,
    SECONDARY_STAT_GAIN: 2,
  },
} as const;
