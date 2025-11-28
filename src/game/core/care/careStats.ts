/**
 * Care stat decay logic per tick.
 */

import { calculatePetMaxStats } from "@/game/core/petStats";
import type { Pet } from "@/game/types/pet";
import {
  CARE_DECAY_AWAKE,
  CARE_DECAY_SLEEPING,
  POOP_HAPPINESS_MULTIPLIERS,
} from "./constants";

// Re-export constants for backwards compatibility with tests
export { CARE_DECAY_AWAKE, CARE_DECAY_SLEEPING };

/**
 * Get the happiness decay multiplier based on poop count.
 */
export function getPoopHappinessMultiplier(poopCount: number): number {
  for (const [threshold, multiplier] of POOP_HAPPINESS_MULTIPLIERS) {
    if (poopCount >= threshold) {
      return multiplier;
    }
  }
  return 1.0;
}

/**
 * Apply care stat decay for a single tick.
 * Returns the updated care stats (new object, does not mutate).
 */
export function applyCareDecay(pet: Pet): Pet["careStats"] {
  const decayRate = pet.sleep.isSleeping
    ? CARE_DECAY_SLEEPING
    : CARE_DECAY_AWAKE;
  const poopMultiplier = getPoopHappinessMultiplier(pet.poop.count);

  // Use centralized max stat calculation
  const maxStats = calculatePetMaxStats(pet);
  const maxSatiety = maxStats?.care.satiety ?? 0;
  const maxHydration = maxStats?.care.hydration ?? 0;
  const maxHappiness = maxStats?.care.happiness ?? 0;

  // Calculate new values with decay
  const newSatiety = Math.max(0, pet.careStats.satiety - decayRate);
  const newHydration = Math.max(0, pet.careStats.hydration - decayRate);
  const happinessDecay = Math.floor(decayRate * poopMultiplier);
  const newHappiness = Math.max(0, pet.careStats.happiness - happinessDecay);

  return {
    satiety: Math.min(newSatiety, maxSatiety),
    hydration: Math.min(newHydration, maxHydration),
    happiness: Math.min(newHappiness, maxHappiness),
  };
}
