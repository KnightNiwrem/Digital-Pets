/**
 * Selectors for deriving values from game state.
 */

import {
  formatTicksDuration,
  getNextStage,
  getStageProgressPercent,
  getTicksUntilNextStage,
  getTicksUntilNextSubstage,
} from "@/game/core/growth";
import { calculatePetMaxStats } from "@/game/core/petStats";
import {
  GROWTH_STAGE_DEFINITIONS,
  type GrowthStageDefinition,
} from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { GameState, Pet } from "@/game/types";
import type { Tick } from "@/game/types/common";
import { TICKS_PER_DAY, toDisplay } from "@/game/types/common";
import {
  type CareThreshold,
  type GrowthStage,
  getCareThreshold,
} from "@/game/types/constants";
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

  const { pet } = ctx;
  const maxStats = calculatePetMaxStats(pet);
  if (!maxStats) return null;

  const satiety = toDisplay(pet.careStats.satiety);
  const hydration = toDisplay(pet.careStats.hydration);
  const happiness = toDisplay(pet.careStats.happiness);
  const max = toDisplay(maxStats.careStatMax);

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

  const { pet } = ctx;
  const maxStats = calculatePetMaxStats(pet);
  if (!maxStats) return null;

  const energy = toDisplay(pet.energyStats.energy);
  const max = toDisplay(maxStats.energyMax);

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
  stageId: GrowthStage;
  substage: number;
  substageCount: number;
  ageDays: number;
  isSleeping: boolean;
}

/**
 * Growth progress display values.
 */
export interface GrowthProgressDisplay {
  /** Current stage name */
  currentStage: string;
  /** Current stage ID */
  currentStageId: GrowthStage;
  /** Next stage name (null if adult) */
  nextStage: string | null;
  /** Current substage number */
  substage: number;
  /** Total substages in current stage */
  substageCount: number;
  /** Progress percentage toward next stage (0-100) */
  stageProgressPercent: number;
  /** Ticks until next stage (null if adult) */
  ticksUntilNextStage: Tick | null;
  /** Formatted time until next stage */
  timeUntilNextStage: string | null;
  /** Ticks until next substage (null if at max substage) */
  ticksUntilNextSubstage: Tick | null;
  /** Formatted time until next substage */
  timeUntilNextSubstage: string | null;
  /** Total age in days */
  ageDays: number;
  /** Total age in ticks */
  ageTicks: Tick;
}

/**
 * Poop display values.
 */
export interface PoopDisplay {
  count: number;
}

/**
 * Get poop info for display.
 */
export function selectPoop(state: GameState): PoopDisplay | null {
  const pet = state.pet;
  if (!pet) return null;

  return {
    count: pet.poop.count,
  };
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
    stageId: pet.growth.stage,
    substage: pet.growth.substage,
    substageCount: stageDef.substageCount,
    ageDays,
    isSleeping: pet.sleep.isSleeping,
  };
}

/**
 * Get growth progress for display.
 */
export function selectGrowthProgress(
  state: GameState,
): GrowthProgressDisplay | null {
  const ctx = getPetContext(state);
  if (!ctx) return null;

  const { pet, stageDef } = ctx;
  const { stage, substage, ageTicks } = pet.growth;

  const nextStageId = getNextStage(stage);
  const nextStageDef = nextStageId
    ? GROWTH_STAGE_DEFINITIONS[nextStageId]
    : null;

  const ticksUntilNextStage = getTicksUntilNextStage(stage, ageTicks);
  const ticksUntilNextSubstage = getTicksUntilNextSubstage(
    stage,
    substage,
    ageTicks,
  );

  const ageDays = Math.floor(ageTicks / TICKS_PER_DAY);

  return {
    currentStage: stageDef.name,
    currentStageId: stage,
    nextStage: nextStageDef?.name ?? null,
    substage,
    substageCount: stageDef.substageCount,
    stageProgressPercent: getStageProgressPercent(stage, ageTicks),
    ticksUntilNextStage,
    timeUntilNextStage:
      ticksUntilNextStage !== null
        ? formatTicksDuration(ticksUntilNextStage)
        : null,
    ticksUntilNextSubstage,
    timeUntilNextSubstage:
      ticksUntilNextSubstage !== null
        ? formatTicksDuration(ticksUntilNextSubstage)
        : null,
    ageDays,
    ageTicks,
  };
}
