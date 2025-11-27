/**
 * Care system exports.
 */

// Care life functions
export { applyCareLifeChange, calculateCareLifeChange } from "./careLife";

// Care stats functions
export { applyCareDecay, getPoopHappinessMultiplier } from "./careStats";
// Constants
export {
  // Care decay
  CARE_DECAY_AWAKE,
  CARE_DECAY_SLEEPING,
  // Care life
  CARE_LIFE_DRAIN_1_STAT,
  CARE_LIFE_DRAIN_2_STATS,
  CARE_LIFE_DRAIN_3_STATS,
  CARE_LIFE_DRAIN_POOP,
  CARE_LIFE_RECOVERY_ABOVE_50,
  CARE_LIFE_RECOVERY_ABOVE_75,
  CARE_LIFE_RECOVERY_AT_100,
  // Energy
  ENERGY_REGEN_AWAKE,
  ENERGY_REGEN_SLEEPING,
  // Time caps
  MAX_OFFLINE_CARE_TICKS,
  MAX_POOP_COUNT,
  POOP_ACCELERATION_BASE,
  POOP_CARE_LIFE_DRAIN_THRESHOLD,
  POOP_HAPPINESS_MULTIPLIERS,
  // Poop system
  POOP_INTERVAL_AWAKE,
  POOP_INTERVAL_SLEEPING,
} from "./constants";

// Poop functions
export { getInitialPoopTimer, processPoopTick, removePoop } from "./poop";
