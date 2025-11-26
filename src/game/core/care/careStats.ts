/**
 * Care stat decay logic per tick.
 */

import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
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

  const species = getSpeciesById(pet.identity.speciesId);
  const stageDef = GROWTH_STAGE_DEFINITIONS[pet.growth.stage];

  // Calculate actual max for clamping
  const careCapMultiplier = species?.careCapMultiplier ?? 1.0;
  const maxCareStat = Math.floor(stageDef.baseCareStatMax * careCapMultiplier);

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
