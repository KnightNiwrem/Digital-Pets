/**
 * Utilities for calculating pet stats based on growth stage and species.
 */

import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { MicroValue } from "@/game/types/common";
import type { GrowthStage } from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";

/**
 * Maximum stat values for a pet based on growth stage and species.
 */
export interface PetMaxStats {
  /** Maximum care stat value (satiety, hydration, happiness) */
  careStatMax: MicroValue;
  /** Maximum energy value */
  energyMax: MicroValue;
}

/**
 * Calculate the maximum stats for a given species and growth stage.
 * Returns null if the species is invalid.
 */
export function calculateMaxStats(
  speciesId: string,
  stage: GrowthStage,
): PetMaxStats | null {
  const species = getSpeciesById(speciesId);
  if (!species) return null;

  const stageDef = GROWTH_STAGE_DEFINITIONS[stage];
  if (!stageDef) return null;

  return {
    careStatMax: Math.floor(
      stageDef.baseCareStatMax * species.careCapMultiplier,
    ),
    energyMax: Math.floor(stageDef.baseEnergyMax * species.careCapMultiplier),
  };
}

/**
 * Calculate the maximum stats for a pet based on their growth stage and species.
 * Returns null if the pet's species or growth stage is invalid.
 */
export function calculatePetMaxStats(pet: Pet): PetMaxStats | null {
  return calculateMaxStats(pet.identity.speciesId, pet.growth.stage);
}
