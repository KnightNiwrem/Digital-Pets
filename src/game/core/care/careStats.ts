/**
 * Care stat decay logic per tick.
 */

import { calculatePetMaxStats } from "@/game/core/petStats";
import type { MicroValue } from "@/game/types/common";
import type { Pet } from "@/game/types/pet";

/**
 * Care stat decay rates per tick (micro-units).
 */
export const CARE_DECAY_AWAKE: MicroValue = 50;
export const CARE_DECAY_SLEEPING: MicroValue = 25;

/**
 * Poop multipliers for happiness decay.
 */
const POOP_HAPPINESS_MULTIPLIERS: readonly [number, number][] = [
  [7, 3.0], // 7+ poop: ×3
  [5, 2.0], // 5-6 poop: ×2
  [3, 1.5], // 3-4 poop: ×1.5
  [0, 1.0], // 0-2 poop: ×1 (normal)
];

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
  const maxCareStat = maxStats?.careStatMax ?? 0;

  // Calculate new values with decay
  const newSatiety = Math.max(0, pet.careStats.satiety - decayRate);
  const newHydration = Math.max(0, pet.careStats.hydration - decayRate);
  const happinessDecay = Math.floor(decayRate * poopMultiplier);
  const newHappiness = Math.max(0, pet.careStats.happiness - happinessDecay);

  return {
    satiety: Math.min(newSatiety, maxCareStat),
    hydration: Math.min(newHydration, maxCareStat),
    happiness: Math.min(newHappiness, maxCareStat),
  };
}
