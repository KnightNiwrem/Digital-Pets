/**
 * Single tick processing logic.
 */

import { applyCareLifeChange } from "@/game/core/care/careLife";
import { applyCareDecay } from "@/game/core/care/careStats";
import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { Pet } from "@/game/types/pet";

/**
 * Energy regeneration rates per tick (micro-units).
 */
export const ENERGY_REGEN_AWAKE: number = 8;
export const ENERGY_REGEN_SLEEPING: number = 25;

/**
 * Process a single tick for a pet.
 * Returns a new pet object with updated state.
 *
 * Processing order:
 * 1. Care Life drain/recovery
 * 2. Energy regeneration
 * 3. Poop generation check (placeholder for now)
 * 4. Care stat decay
 * 5. Sleep timer progress (placeholder for now)
 * 6. Growth stage time (placeholder for now)
 * 7. Activity timers (placeholder for now)
 */
export function processPetTick(pet: Pet): Pet {
  const species = getSpeciesById(pet.identity.speciesId);
  const stageDef = GROWTH_STAGE_DEFINITIONS[pet.growth.stage];
  const careCapMultiplier = species?.careCapMultiplier ?? 1.0;
  const maxCareStat = Math.floor(stageDef.baseCareStatMax * careCapMultiplier);
  const maxEnergy = Math.floor(stageDef.baseEnergyMax * careCapMultiplier);

  // 1. Care Life drain/recovery (evaluated on current care stat state)
  const newCareLife = applyCareLifeChange(pet, maxCareStat);

  // 2. Energy regeneration
  const energyRegen = pet.sleep.isSleeping
    ? ENERGY_REGEN_SLEEPING
    : ENERGY_REGEN_AWAKE;
  const newEnergy = Math.min(maxEnergy, pet.energyStats.energy + energyRegen);

  // 3. Poop generation check (placeholder - will be implemented in Milestone 4)

  // 4. Care stat decay
  const newCareStats = applyCareDecay(pet);

  // 5. Sleep timer progress (placeholder - will be implemented in Milestone 6)

  // 6. Growth stage time accumulation
  const newAgeTicks = pet.growth.ageTicks + 1;

  // 7. Activity timers (placeholder - will be implemented later)

  return {
    ...pet,
    growth: {
      ...pet.growth,
      ageTicks: newAgeTicks,
    },
    careStats: newCareStats,
    energyStats: {
      energy: newEnergy,
    },
    careLifeStats: {
      careLife: newCareLife,
    },
  };
}
