/**
 * Single tick processing logic.
 */

import { applyCareLifeChange } from "@/game/core/care/careLife";
import { applyCareDecay } from "@/game/core/care/careStats";
import { processPoopTick } from "@/game/core/care/poop";
import { applyEnergyRegen } from "@/game/core/energy";
import { processGrowthTick } from "@/game/core/growth";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { processSleepTick } from "@/game/core/sleep";
import {
  applyTrainingCompletion,
  processTrainingTick,
} from "@/game/core/training";
import { ActivityState } from "@/game/types/constants";
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
 * 7. Activity timers (training, etc.)
 */
export function processPetTick(pet: Pet): Pet {
  const maxStats = calculatePetMaxStats(pet);

  // Get minimum care max for backwards compatibility with functions expecting single value
  const minCareMax = maxStats
    ? Math.min(
        maxStats.care.satiety,
        maxStats.care.hydration,
        maxStats.care.happiness,
      )
    : 0;
  const maxEnergy = maxStats?.energy ?? 0;

  // 1. Care Life drain/recovery (evaluated on current care stat state)
  const newCareLife = applyCareLifeChange(pet, minCareMax);

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

  // 6. Growth stage time accumulation and stage transitions
  const growthResult = processGrowthTick(pet);

  // 7. Process training timer
  let updatedPet: Pet = {
    ...pet,
    growth: growthResult.growth,
    battleStats: growthResult.battleStats,
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

  // Process active training
  if (
    updatedPet.activityState === ActivityState.Training &&
    updatedPet.activeTraining
  ) {
    const newTraining = processTrainingTick(updatedPet.activeTraining);

    if (newTraining === null) {
      // Training completed - apply stat gains
      updatedPet = applyTrainingCompletion(updatedPet);
    } else {
      updatedPet = {
        ...updatedPet,
        activeTraining: newTraining,
      };
    }
  }

  return updatedPet;
}
