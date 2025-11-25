/**
 * Starting data for new game and pet creation.
 */

import {
  type BattleStats,
  createPetId,
  type DamageResistances,
  type GrowthStage,
  type Pet,
} from "@/game/types";
import { GROWTH_STAGE_DEFINITIONS } from "./growthStages";
import { getSpeciesById } from "./species";

/**
 * Default starting species ID.
 */
export const DEFAULT_STARTING_SPECIES = "florabit";

/**
 * Default starting growth stage.
 */
export const DEFAULT_STARTING_STAGE: GrowthStage = "baby";

/**
 * Create a new pet with the given name and species.
 */
export function createNewPet(name: string, speciesId: string): Pet {
  const species = getSpeciesById(speciesId);
  if (!species) {
    throw new Error(`Unknown species: ${speciesId}`);
  }

  const stage = DEFAULT_STARTING_STAGE;
  const stageDef = GROWTH_STAGE_DEFINITIONS[stage];

  // Calculate actual care stat max based on species multiplier
  const actualCareMax = Math.floor(
    stageDef.baseCareStatMax * species.careCapMultiplier,
  );
  const actualEnergyMax = Math.floor(
    stageDef.baseEnergyMax * species.careCapMultiplier,
  );

  // Start with full stats
  const now = Date.now();

  return {
    identity: {
      id: createPetId(),
      name,
      speciesId,
    },
    growth: {
      stage,
      substage: 1,
      birthTime: now,
      ageTicks: 0,
    },
    careStats: {
      satiety: actualCareMax,
      hydration: actualCareMax,
      happiness: actualCareMax,
    },
    energyStats: {
      energy: actualEnergyMax,
    },
    careLifeStats: {
      careLife: stageDef.careLifeMax,
    },
    battleStats: { ...species.baseStats } as BattleStats,
    resistances: { ...species.resistances } as DamageResistances,
    poop: {
      count: 0,
      ticksUntilNext: 480, // 4 hours until first poop
    },
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: 0,
    },
    activityState: "idle",
  };
}

/**
 * Create a default starter pet for testing.
 */
export function createDefaultStarterPet(): Pet {
  return createNewPet("Buddy", DEFAULT_STARTING_SPECIES);
}
