/**
 * Care system exports.
 */

// Care life functions and types
export {
  applyCareLifeChange,
  calculateCareLifeChange,
  type MaxCareStats,
} from "./careLife";

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
  // Poop system
  MAX_POOP_COUNT,
  POOP_ACCELERATION_BASE,
  POOP_CARE_LIFE_DRAIN_THRESHOLD,
  POOP_DECAY_AWAKE,
  POOP_DECAY_SLEEPING,
  POOP_HAPPINESS_MULTIPLIERS,
  POOP_MICRO_THRESHOLD,
} from "./constants";

// Poop functions
export { getInitialPoopTimer, processPoopTick, removePoop } from "./poop";
