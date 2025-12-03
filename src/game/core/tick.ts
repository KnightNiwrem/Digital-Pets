/**
 * Single tick processing logic.
 */

import {
  applyCareLifeChange,
  type MaxCareStats,
} from "@/game/core/care/careLife";
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
  // Calculate max stats once per tick to avoid redundant recalculations
  const maxStats = calculatePetMaxStats(pet);

  // Get max care stats for proper percentage calculations
  const maxCareStats: MaxCareStats = maxStats
    ? {
        satiety: maxStats.care.satiety,
        hydration: maxStats.care.hydration,
        happiness: maxStats.care.happiness,
      }
    : { satiety: 0, hydration: 0, happiness: 0 };
  const maxEnergy = maxStats?.energy ?? 0;
  const maxCareLife = maxStats?.careLife ?? 0;

  // 1. Care Life drain/recovery (evaluated on current care stat state)
  const newCareLife = applyCareLifeChange(pet, maxCareStats, maxCareLife);

  // 2. Energy regeneration
  const newEnergy = applyEnergyRegen(
    pet.energyStats.energy,
    maxEnergy,
    pet.sleep.isSleeping,
  );

  // 3. Poop generation check
  const newPoop = processPoopTick(pet);

  // 4. Care stat decay (use pre-computed max stats for efficiency)
  const newCareStats = applyCareDecay(pet, maxStats);

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
