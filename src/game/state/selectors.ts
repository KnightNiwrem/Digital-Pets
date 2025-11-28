/**
 * Selectors for deriving values from game state.
 */

import { getNextStage } from "@/game/core/growth";
import { calculatePetMaxStats } from "@/game/core/petStats";
import {
  getNextSpeciesStage,
  getSpeciesStageStats,
  getStageProgress,
  getTicksUntilNextStageTransition,
} from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { GameState, Pet } from "@/game/types";
import type { Tick } from "@/game/types/common";
import {
  formatTicksAsTime,
  TICKS_PER_DAY,
  toDisplay,
  toDisplayCare,
} from "@/game/types/common";
import {
  type CareThreshold,
  type GrowthStage,
  getCareThreshold,
} from "@/game/types/constants";
import type { Species, SpeciesGrowthStageStats } from "@/game/types/species";

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
  stageStats: SpeciesGrowthStageStats;
}

function getPetContext(state: GameState): PetContext | null {
  const pet = state.pet;
  if (!pet) return null;

  const species = getSpeciesById(pet.identity.speciesId);
  if (!species) return null;

  const stageStats = getSpeciesStageStats(
    pet.identity.speciesId,
    pet.growth.ageTicks,
  );
  if (!stageStats) return null;

  return { pet, species, stageStats };
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

  const satiety = toDisplayCare(pet.careStats.satiety);
  const hydration = toDisplayCare(pet.careStats.hydration);
  const happiness = toDisplayCare(pet.careStats.happiness);
  const satietyMax = toDisplayCare(maxStats.care.satiety);
  const hydrationMax = toDisplayCare(maxStats.care.hydration);
  const happinessMax = toDisplayCare(maxStats.care.happiness);

  const satietyPercent =
    satietyMax > 0 ? Math.round((satiety / satietyMax) * 100) : 0;
  const hydrationPercent =
    hydrationMax > 0 ? Math.round((hydration / hydrationMax) * 100) : 0;
  const happinessPercent =
    happinessMax > 0 ? Math.round((happiness / happinessMax) * 100) : 0;

  return {
    satiety,
    hydration,
    happiness,
    satietyMax,
    hydrationMax,
    happinessMax,
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
  const max = toDisplay(maxStats.energy);

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

  const { pet, species, stageStats } = ctx;

  // Count substages with the same stage name to determine substage count
  const substageCount = species.growthStages.filter(
    (gs) => gs.stage === stageStats.stage,
  ).length;

  // Convert age in ticks to days
  const ageDays = Math.floor(pet.growth.ageTicks / TICKS_PER_DAY);

  return {
    name: pet.identity.name,
    speciesName: species.name,
    speciesEmoji: species.emoji,
    stage: stageStats.name,
    stageId: pet.growth.stage,
    substage: pet.growth.substage,
    substageCount,
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

  const { pet, species, stageStats } = ctx;
  const { stage, substage, ageTicks } = pet.growth;

  // Count substages with the same stage name
  const substageCount = species.growthStages.filter(
    (gs) => gs.stage === stageStats.stage,
  ).length;

  const nextStageId = getNextStage(stage);

  const ticksUntilNextStage = getTicksUntilNextStageTransition(
    pet.identity.speciesId,
    ageTicks,
  );

  // Calculate ticks until next substage (only if next transition is a substage, not a main stage)
  let ticksUntilNextSubstage: Tick | null = null;
  const nextSpeciesStage = getNextSpeciesStage(
    pet.identity.speciesId,
    ageTicks,
  );
  if (nextSpeciesStage && nextSpeciesStage.stage === stageStats.stage) {
    // Next transition is a substage within the same main stage
    ticksUntilNextSubstage = nextSpeciesStage.minAgeTicks - ageTicks;
  }

  const ageDays = Math.floor(ageTicks / TICKS_PER_DAY);

  // Find the next stage name - use the display name directly from the stage stats
  let nextStageName: string | null = null;
  if (nextStageId) {
    const nextStageStats = species.growthStages.find(
      (gs) => gs.stage === nextStageId,
    );
    if (nextStageStats) {
      nextStageName = nextStageStats.name;
    }
  }

  return {
    currentStage: stageStats.name,
    currentStageId: stage,
    nextStage: nextStageName,
    substage,
    substageCount,
    stageProgressPercent: getStageProgress(pet.identity.speciesId, ageTicks),
    ticksUntilNextStage,
    timeUntilNextStage:
      ticksUntilNextStage !== null
        ? formatTicksAsTime(ticksUntilNextStage)
        : null,
    ticksUntilNextSubstage,
    timeUntilNextSubstage:
      ticksUntilNextSubstage !== null
        ? formatTicksAsTime(ticksUntilNextSubstage)
        : null,
    ageDays,
    ageTicks,
  };
}
