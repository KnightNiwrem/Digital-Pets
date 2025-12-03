/**
 * Care stat decay logic per tick.
 */

import { calculatePetMaxStats, type PetMaxStats } from "@/game/core/petStats";
import type { Pet } from "@/game/types/pet";
import {
  CARE_DECAY_AWAKE,
  CARE_DECAY_SLEEPING,
  POOP_HAPPINESS_MULTIPLIERS,
} from "./constants";

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
 *
 * @param pet - The pet to apply decay to
 * @param precomputedMaxStats - Optional pre-computed max stats to avoid recalculation.
 *   If not provided, max stats will be calculated from the pet.
 */
export function applyCareDecay(
  pet: Pet,
  precomputedMaxStats?: PetMaxStats | null,
): Pet["careStats"] {
  const decayRate = pet.sleep.isSleeping
    ? CARE_DECAY_SLEEPING
    : CARE_DECAY_AWAKE;
  const poopMultiplier = getPoopHappinessMultiplier(pet.poop.count);

  // Use pre-computed max stats if provided, otherwise calculate
  const maxStats = precomputedMaxStats ?? calculatePetMaxStats(pet);
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
