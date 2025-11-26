/**
 * Encounter generation for exploration.
 */

import { getLocation } from "@/game/data/locations";
import {
  type EncounterEntry,
  EncounterType,
  getEncounterTable,
} from "@/game/data/tables/encounters";
import type { GrowthStage } from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";
import { type Combatant, createWildCombatant } from "../battle/battle";

/**
 * Scaling divisor for wild pet level calculation.
 */
const LEVEL_SCALING_DIVISOR = 5;

/**
 * Result of an encounter roll.
 */
export interface EncounterResult {
  /** Whether an encounter occurred */
  hasEncounter: boolean;
  /** Type of encounter if one occurred */
  encounterType?: EncounterType;
  /** Wild combatant for battle encounters */
  wildCombatant?: Combatant;
  /** Level of the encountered pet */
  level?: number;
  /** Species ID of the encountered pet */
  speciesId?: string;
}

/**
 * Calculate wild pet level based on location and player pet.
 */
export function calculateWildLevel(
  locationId: string,
  playerPetLevel: number,
): number {
  const location = getLocation(locationId);
  if (!location) {
    return 1;
  }

  const baseLevel = location.levelMin ?? 1;
  const maxLevel = location.levelMax ?? 10;

  // Add scaling factor based on player level
  const scalingFactor = Math.floor(playerPetLevel / LEVEL_SCALING_DIVISOR);

  // Random offset within level range
  const range = maxLevel - baseLevel;
  const randomOffset = Math.floor(Math.random() * (range + 1));

  return Math.max(1, baseLevel + randomOffset + scalingFactor);
}

/**
 * Get approximate player pet level from stats.
 * Uses average of battle stats as a proxy for level.
 */
export function getApproximatePetLevel(pet: Pet): number {
  const stats = pet.battleStats;
  const avgStat =
    (stats.strength +
      stats.endurance +
      stats.agility +
      stats.precision +
      stats.fortitude +
      stats.cunning) /
    6;
  return Math.max(1, Math.floor(avgStat / 2));
}

/**
 * Check if an encounter entry is available for the pet's stage.
 */
function isEncounterAvailable(
  entry: EncounterEntry,
  petStage: GrowthStage,
): boolean {
  if (!entry.minStage) {
    return true;
  }

  const stageOrder = ["baby", "child", "teen", "youngAdult", "adult"];
  const petStageIndex = stageOrder.indexOf(petStage);
  const requiredIndex = stageOrder.indexOf(entry.minStage);

  return petStageIndex >= requiredIndex;
}

/**
 * Roll for an encounter at a location.
 */
export function rollEncounter(locationId: string, pet: Pet): EncounterResult {
  const location = getLocation(locationId);
  if (!location?.encounterTableId) {
    return { hasEncounter: false };
  }

  const encounterTable = getEncounterTable(location.encounterTableId);
  if (!encounterTable) {
    return { hasEncounter: false };
  }

  // Roll for whether any encounter happens
  if (Math.random() > encounterTable.baseEncounterChance) {
    return { hasEncounter: false };
  }

  // Filter available encounters
  const availableEntries = encounterTable.entries.filter((entry) =>
    isEncounterAvailable(entry, pet.growth.stage),
  );

  if (availableEntries.length === 0) {
    return { hasEncounter: false };
  }

  // Roll for specific encounter
  const roll = Math.random();
  let cumulativeProbability = 0;

  for (const entry of availableEntries) {
    cumulativeProbability += entry.probability;
    if (roll <= cumulativeProbability) {
      return generateEncounter(entry, locationId, pet);
    }
  }

  // Fallback to first available
  const firstEntry = availableEntries[0];
  if (!firstEntry) {
    return { hasEncounter: false };
  }
  return generateEncounter(firstEntry, locationId, pet);
}

/**
 * Generate an encounter from an entry.
 */
function generateEncounter(
  entry: EncounterEntry,
  locationId: string,
  pet: Pet,
): EncounterResult {
  if (entry.encounterType === EncounterType.WildBattle) {
    const playerLevel = getApproximatePetLevel(pet);
    const wildLevel = calculateWildLevel(locationId, playerLevel);

    // Apply level offset from entry
    const [minOffset, maxOffset] = entry.levelOffset;
    const offset =
      minOffset + Math.floor(Math.random() * (maxOffset - minOffset + 1));
    const finalLevel = Math.max(1, wildLevel + offset);

    // Pick random species from entry
    const speciesIndex = Math.floor(Math.random() * entry.speciesIds.length);
    const speciesId = entry.speciesIds[speciesIndex];

    if (!speciesId) {
      return { hasEncounter: false };
    }

    const wildCombatant = createWildCombatant(speciesId, finalLevel);

    return {
      hasEncounter: true,
      encounterType: EncounterType.WildBattle,
      wildCombatant,
      level: finalLevel,
      speciesId,
    };
  }

  return { hasEncounter: false };
}

/**
 * Force an encounter for testing/specific triggers.
 */
export function forceEncounter(locationId: string, pet: Pet): EncounterResult {
  const location = getLocation(locationId);
  if (!location?.encounterTableId) {
    return { hasEncounter: false };
  }

  const encounterTable = getEncounterTable(location.encounterTableId);
  if (!encounterTable || encounterTable.entries.length === 0) {
    return { hasEncounter: false };
  }

  // Get first available entry
  const availableEntries = encounterTable.entries.filter((entry) =>
    isEncounterAvailable(entry, pet.growth.stage),
  );

  if (availableEntries.length === 0) {
    return { hasEncounter: false };
  }

  const firstEntry = availableEntries[0];
  if (!firstEntry) {
    return { hasEncounter: false };
  }
  return generateEncounter(firstEntry, locationId, pet);
}
