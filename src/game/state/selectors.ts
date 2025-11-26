/**
 * Selectors for deriving values from game state.
 */

import {
  GROWTH_STAGE_DEFINITIONS,
  type GrowthStageDefinition,
} from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { GameState, Pet } from "@/game/types";
import { TICKS_PER_DAY, toDisplay } from "@/game/types/common";
import { type CareThreshold, getCareThreshold } from "@/game/types/constants";
import type { Species } from "@/game/types/species";

/**
 * Get the active pet from game state.
 */
export function selectPet(state: GameState): Pet | null {
  return state.pet;
}

/**
 * Get the pet's species data.
 */
export function selectPetSpecies(state: GameState): Species | null {
  const pet = state.pet;
  if (!pet) return null;
  return getSpeciesById(pet.identity.speciesId) ?? null;
}

/**
 * Internal helper to get core pet data needed by multiple selectors.
 */
interface PetContext {
  pet: Pet;
  species: Species;
  stageDef: GrowthStageDefinition;
}

function getPetContext(state: GameState): PetContext | null {
  const pet = state.pet;
  if (!pet) return null;

  const species = getSpeciesById(pet.identity.speciesId);
  if (!species) return null;

  const stageDef = GROWTH_STAGE_DEFINITIONS[pet.growth.stage];
  if (!stageDef) return null;

  return { pet, species, stageDef };
}

/**
 * Care stat display values.
 */
export interface CareStatDisplay {
  satiety: number;
  hydration: number;
  happiness: number;
  satietyMax: number;
  hydrationMax: number;
  happinessMax: number;
  satietyPercent: number;
  hydrationPercent: number;
  happinessPercent: number;
  satietyThreshold: CareThreshold;
  hydrationThreshold: CareThreshold;
  happinessThreshold: CareThreshold;
}

/**
 * Get care stats with display values and percentages.
 */
export function selectCareStats(state: GameState): CareStatDisplay | null {
  const ctx = getPetContext(state);
  if (!ctx) return null;

  const { pet, species, stageDef } = ctx;
  const careMax = Math.floor(
    stageDef.baseCareStatMax * species.careCapMultiplier,
  );

  const satiety = toDisplay(pet.careStats.satiety);
  const hydration = toDisplay(pet.careStats.hydration);
  const happiness = toDisplay(pet.careStats.happiness);
  const max = toDisplay(careMax);

  const satietyPercent = max > 0 ? Math.round((satiety / max) * 100) : 0;
  const hydrationPercent = max > 0 ? Math.round((hydration / max) * 100) : 0;
  const happinessPercent = max > 0 ? Math.round((happiness / max) * 100) : 0;

  return {
    satiety,
    hydration,
    happiness,
    satietyMax: max,
    hydrationMax: max,
    happinessMax: max,
    satietyPercent,
    hydrationPercent,
    happinessPercent,
    satietyThreshold: getCareThreshold(satietyPercent),
    hydrationThreshold: getCareThreshold(hydrationPercent),
    happinessThreshold: getCareThreshold(happinessPercent),
  };
}

/**
 * Energy display values.
 */
export interface EnergyDisplay {
  energy: number;
  energyMax: number;
  energyPercent: number;
}

/**
 * Get energy with display values.
 */
export function selectEnergy(state: GameState): EnergyDisplay | null {
  const ctx = getPetContext(state);
  if (!ctx) return null;

  const { pet, species, stageDef } = ctx;
  const energyMax = Math.floor(
    stageDef.baseEnergyMax * species.careCapMultiplier,
  );

  const energy = toDisplay(pet.energyStats.energy);
  const max = toDisplay(energyMax);

  return {
    energy,
    energyMax: max,
    energyPercent: max > 0 ? Math.round((energy / max) * 100) : 0,
  };
}

/**
 * Pet info display values.
 */
export interface PetInfoDisplay {
  name: string;
  speciesName: string;
  speciesEmoji: string;
  stage: string;
  substage: number;
  ageDays: number;
  isSleeping: boolean;
}

/**
 * Get pet info for display.
 */
export function selectPetInfo(state: GameState): PetInfoDisplay | null {
  const ctx = getPetContext(state);
  if (!ctx) return null;

  const { pet, species, stageDef } = ctx;

  // Convert age in ticks to days
  const ageDays = Math.floor(pet.growth.ageTicks / TICKS_PER_DAY);

  return {
    name: pet.identity.name,
    speciesName: species.name,
    speciesEmoji: species.emoji,
    stage: stageDef.name,
    substage: pet.growth.substage,
    ageDays,
    isSleeping: pet.sleep.isSleeping,
  };
}
