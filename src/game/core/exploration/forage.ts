/**
 * Foraging exploration logic.
 */

import { checkActivityRequirements } from "@/game/core/activityGating";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { getLocation } from "@/game/data/locations";
import { type ForageTable, getForageTable } from "@/game/data/tables/forage";
import type {
  ActiveExploration,
  ExplorationDrop,
  ExplorationResult,
} from "@/game/types/activity";
import { ExplorationActivityType } from "@/game/types/activity";
import { type Tick, toMicro } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import { FacilityType, LocationType } from "@/game/types/location";
import type { Pet } from "@/game/types/pet";

/**
 * Skill bonus multiplier per level (5% multiplicative bonus).
 */
const SKILL_BONUS_PER_LEVEL = 0.05;

/**
 * Check if a pet can start foraging at the current location.
 */
export function canStartForaging(
  pet: Pet,
  currentLocationId: string,
): { canForage: boolean; message: string } {
  // Get location first (needed for energy cost check)
  const location = getLocation(currentLocationId);
  if (!location) {
    return { canForage: false, message: "Location not found." };
  }

  // Check if location is a wild area
  if (location.type !== LocationType.Wild) {
    return {
      canForage: false,
      message: "Can only forage in wild areas.",
    };
  }

  // Check if location has forage zone facility
  if (!location.facilities.includes(FacilityType.ForageZone)) {
    return {
      canForage: false,
      message: "This location has no forage zone.",
    };
  }

  // Check if location has a forage table
  if (!location.forageTableId) {
    return {
      canForage: false,
      message: "Nothing to forage at this location.",
    };
  }

  // Get forage table
  const forageTable = getForageTable(location.forageTableId);
  if (!forageTable) {
    return {
      canForage: false,
      message: "Forage data not found.",
    };
  }

  // Check activity state and energy requirements
  const gatingCheck = checkActivityRequirements(
    pet,
    "forage",
    forageTable.baseEnergyCost,
    ActivityState.Exploring,
  );
  if (!gatingCheck.allowed) {
    return { canForage: false, message: gatingCheck.message };
  }

  return { canForage: true, message: "Ready to forage!" };
}

/**
 * Start a foraging session.
 * Returns the updated pet state or null if foraging cannot start.
 */
export function startForaging(
  pet: Pet,
  currentLocationId: string,
  currentTick: Tick,
): { success: boolean; pet: Pet; message: string } {
  const check = canStartForaging(pet, currentLocationId);
  if (!check.canForage) {
    return { success: false, pet, message: check.message };
  }

  // canStartForaging already validated these exist, so we safely narrow the types
  const location = getLocation(currentLocationId);
  if (!location || !location.forageTableId) {
    return { success: false, pet, message: "Location not found." };
  }

  const forageTable = getForageTable(location.forageTableId);
  if (!forageTable) {
    return { success: false, pet, message: "Forage data not found." };
  }

  const activeExploration: ActiveExploration = {
    activityType: ExplorationActivityType.Forage,
    locationId: currentLocationId,
    forageTableId: location.forageTableId,
    startTick: currentTick,
    durationTicks: forageTable.baseDurationTicks,
    ticksRemaining: forageTable.baseDurationTicks,
    energyCost: toMicro(forageTable.baseEnergyCost),
  };

  const newEnergy =
    pet.energyStats.energy - toMicro(forageTable.baseEnergyCost);

  return {
    success: true,
    pet: {
      ...pet,
      activityState: ActivityState.Exploring,
      activeExploration,
      energyStats: {
        energy: Math.max(0, newEnergy),
      },
    },
    message: `Started foraging at ${location.name}!`,
  };
}

/**
 * Process one tick of exploration progress.
 * Returns updated ActiveExploration or null if exploration completed.
 */
export function processExplorationTick(
  exploration: ActiveExploration,
): ActiveExploration | null {
  const newTicksRemaining = exploration.ticksRemaining - 1;

  if (newTicksRemaining <= 0) {
    return null; // Exploration completed
  }

  return {
    ...exploration,
    ticksRemaining: newTicksRemaining,
  };
}

/**
 * Calculate drops from a forage table.
 * Uses a simple random drop system based on drop rates.
 */
export function calculateForageDrops(
  forageTable: ForageTable,
  playerSkillLevel = 1,
): ExplorationDrop[] {
  const drops: ExplorationDrop[] = [];

  for (const entry of forageTable.entries) {
    // Skip if player skill is too low
    if (playerSkillLevel < entry.minSkillLevel) {
      continue;
    }

    // Calculate effective drop rate with multiplicative skill bonus
    // Level 1 gives 0 bonus, each level above 1 gives 5% bonus
    const skillBonus = (playerSkillLevel - 1) * SKILL_BONUS_PER_LEVEL;
    const effectiveRate = Math.min(1, entry.baseDropRate * (1 + skillBonus));

    // Roll for drop
    if (Math.random() < effectiveRate) {
      // Calculate quantity
      const [minQty, maxQty] = entry.quantity;
      const quantity =
        minQty === maxQty
          ? minQty
          : Math.floor(Math.random() * (maxQty - minQty + 1)) + minQty;

      drops.push({
        itemId: entry.itemId,
        quantity,
      });
    }
  }

  return drops;
}

/**
 * Complete a foraging session and calculate drops.
 */
export function completeForaging(
  pet: Pet,
  foragingSkillLevel = 1,
): ExplorationResult {
  if (!pet.activeExploration) {
    return {
      success: false,
      message: "No active exploration to complete.",
      itemsFound: [],
    };
  }

  const { forageTableId } = pet.activeExploration;
  const forageTable = getForageTable(forageTableId);

  if (!forageTable) {
    return {
      success: false,
      message: "Forage data not found.",
      itemsFound: [],
    };
  }

  // Calculate drops using skill level
  const itemsFound = calculateForageDrops(forageTable, foragingSkillLevel);

  if (itemsFound.length === 0) {
    return {
      success: true,
      message: "Foraging complete, but you didn't find anything this time.",
      itemsFound: [],
    };
  }

  const itemCount = itemsFound.reduce((sum, drop) => sum + drop.quantity, 0);
  return {
    success: true,
    message: `Foraging complete! Found ${itemCount} item${itemCount !== 1 ? "s" : ""}.`,
    itemsFound,
  };
}

/**
 * Apply exploration completion to pet state.
 * Returns the updated pet with exploration cleared.
 */
export function applyExplorationCompletion(
  pet: Pet,
  foragingSkillLevel = 1,
): {
  pet: Pet;
  result: ExplorationResult;
} {
  const result = completeForaging(pet, foragingSkillLevel);

  return {
    pet: {
      ...pet,
      activityState: ActivityState.Idle,
      activeExploration: undefined,
    },
    result,
  };
}

/**
 * Cancel an active exploration session.
 * Energy is refunded to the pet.
 */
export function cancelExploration(pet: Pet): {
  success: boolean;
  pet: Pet;
  message: string;
  energyRefunded: number;
} {
  if (!pet.activeExploration) {
    return {
      success: false,
      pet,
      message: "No exploration session to cancel.",
      energyRefunded: 0,
    };
  }

  const energyRefunded = pet.activeExploration.energyCost;
  const maxStats = calculatePetMaxStats(pet);
  const maxEnergy = maxStats?.energy ?? 0;

  return {
    success: true,
    pet: {
      ...pet,
      activityState: ActivityState.Idle,
      activeExploration: undefined,
      energyStats: {
        energy: Math.min(pet.energyStats.energy + energyRefunded, maxEnergy),
      },
    },
    message: "Exploration cancelled. Energy has been refunded.",
    energyRefunded,
  };
}

/**
 * Get exploration progress as a percentage.
 */
export function getExplorationProgress(exploration: ActiveExploration): number {
  if (exploration.durationTicks === 0) {
    return 100; // Instant completion
  }
  const elapsed = exploration.durationTicks - exploration.ticksRemaining;
  return Math.round((elapsed / exploration.durationTicks) * 100);
}

/**
 * Get forage info for a location.
 */
export function getLocationForageInfo(
  locationId: string,
): ForageTable | undefined {
  const location = getLocation(locationId);
  if (!location?.forageTableId) return undefined;
  return getForageTable(location.forageTableId);
}
