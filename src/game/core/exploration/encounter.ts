/**
 * Encounter generation for exploration.
 */

import { getLocation } from "@/game/data/locations";
import {
  type EncounterEntry,
  EncounterType,
  getEncounterTable,
} from "@/game/data/tables/encounters";
import { GROWTH_STAGE_ORDER, type GrowthStage } from "@/game/types/constants";
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
 * Check if an encounter entry is available for the pet's stage and activity.
 * @param entry - The encounter entry to check
 * @param petStage - The pet's current growth stage
 * @param activityId - The activity being performed (optional, filters by activityIds)
 */
function isEncounterAvailable(
  entry: EncounterEntry,
  petStage: GrowthStage,
  activityId?: string,
): boolean {
  // Check growth stage requirement
  if (entry.minStage) {
    const petStageIndex = GROWTH_STAGE_ORDER.indexOf(petStage);
    const requiredIndex = GROWTH_STAGE_ORDER.indexOf(entry.minStage);
    if (petStageIndex < requiredIndex) {
      return false;
    }
  }

  // Check activity filter - if activityIds is defined, only allow matching activities
  if (activityId && entry.activityIds && entry.activityIds.length > 0) {
    if (!entry.activityIds.includes(activityId)) {
      return false;
    }
  }

  return true;
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
    // Wild battles require speciesIds and levelOffset
    if (!entry.speciesIds || !entry.levelOffset) {
      return { hasEncounter: false };
    }

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
 * @param locationId - Location where the encounter occurs
 * @param pet - The pet exploring
 * @param activityId - Optional activity ID to filter encounters
 */
export function forceEncounter(
  locationId: string,
  pet: Pet,
  activityId?: string,
): EncounterResult {
  const location = getLocation(locationId);
  if (!location?.encounterTableId) {
    return { hasEncounter: false };
  }

  const encounterTable = getEncounterTable(location.encounterTableId);
  if (!encounterTable || encounterTable.entries.length === 0) {
    return { hasEncounter: false };
  }

  // Get first available entry filtered by stage and activity
  const availableEntries = encounterTable.entries.filter((entry) =>
    isEncounterAvailable(entry, pet.growth.stage, activityId),
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

/**
 * Roll for an encounter during exploration.
 * Uses the activity's encounter chance and location's encounter table.
 *
 * @param locationId - Location where exploration is occurring
 * @param pet - The pet exploring
 * @param activityId - The activity being performed
 * @param encounterChance - Base probability of triggering an encounter (0.0 to 1.0)
 * @returns EncounterResult with hasEncounter=true if an encounter occurred
 */
export function rollForEncounter(
  locationId: string,
  pet: Pet,
  activityId: string,
  encounterChance: number,
): EncounterResult {
  // First check if encounter triggers based on activity's encounter chance
  if (Math.random() >= encounterChance) {
    return { hasEncounter: false };
  }

  const location = getLocation(locationId);
  if (!location?.encounterTableId) {
    return { hasEncounter: false };
  }

  const encounterTable = getEncounterTable(location.encounterTableId);
  if (!encounterTable || encounterTable.entries.length === 0) {
    return { hasEncounter: false };
  }

  // Filter entries by stage and activity, then select based on probability
  const availableEntries = encounterTable.entries.filter((entry) =>
    isEncounterAvailable(entry, pet.growth.stage, activityId),
  );

  if (availableEntries.length === 0) {
    return { hasEncounter: false };
  }

  // Normalize probabilities and select an entry
  const totalProbability = availableEntries.reduce(
    (sum, entry) => sum + entry.probability,
    0,
  );

  if (totalProbability <= 0) {
    return { hasEncounter: false };
  }

  let roll = Math.random() * totalProbability;
  let selectedEntry: EncounterEntry | undefined;

  for (const entry of availableEntries) {
    roll -= entry.probability;
    if (roll <= 0) {
      selectedEntry = entry;
      break;
    }
  }

  if (!selectedEntry) {
    selectedEntry = availableEntries[availableEntries.length - 1];
  }

  if (!selectedEntry) {
    return { hasEncounter: false };
  }

  return generateEncounter(selectedEntry, locationId, pet);
}
