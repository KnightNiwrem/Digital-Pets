/**
 * Single tick processing logic.
 */

import { applyCareLifeChange } from "@/game/core/care/careLife";
import { applyCareDecay } from "@/game/core/care/careStats";
import { processPoopTick } from "@/game/core/care/poop";
import { applyEnergyRegen } from "@/game/core/energy";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { processSleepTick } from "@/game/core/sleep";
import type { Pet } from "@/game/types/pet";

/**
 * Process a single tick for a pet.
 * Returns a new pet object with updated state.
 *
 * Processing order:
 * 1. Care Life drain/recovery
 * 2. Energy regeneration
 * 3. Poop generation check
 * 4. Care stat decay
 * 5. Sleep timer progress
 * 6. Growth stage time
 * 7. Activity timers (placeholder for now)
 */
export function processPetTick(pet: Pet): Pet {
  const maxStats = calculatePetMaxStats(pet);
  const maxCareStat = maxStats?.careStatMax ?? 0;
  const maxEnergy = maxStats?.energyMax ?? 0;

  // 1. Care Life drain/recovery (evaluated on current care stat state)
  const newCareLife = applyCareLifeChange(pet, maxCareStat);

  // 2. Energy regeneration
  const newEnergy = applyEnergyRegen(
    pet.energyStats.energy,
    maxEnergy,
    pet.sleep.isSleeping,
  );

  // 3. Poop generation check
  const newPoop = processPoopTick(pet);

  // 4. Care stat decay
  const newCareStats = applyCareDecay(pet);

  // 5. Sleep timer progress
  const newSleep = processSleepTick(pet.sleep);

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
    poop: newPoop,
    sleep: newSleep,
  };
}
