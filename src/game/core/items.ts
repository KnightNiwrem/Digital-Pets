/**
 * Item usage logic for consuming food and drinks.
 */

import { hasItem, removeItem } from "@/game/core/inventory";
import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getItemById } from "@/game/data/items";
import { getSpeciesById } from "@/game/data/species";
import type { GameState } from "@/game/types/gameState";
import { isDrinkItem, isFoodItem } from "@/game/types/item";

/**
 * Result of using an item.
 */
export interface UseItemResult {
  success: boolean;
  state: GameState;
  message: string;
}

/**
 * Calculate max care stat for current pet.
 */
function getMaxCareStat(state: GameState): number {
  if (!state.pet) return 0;

  const species = getSpeciesById(state.pet.identity.speciesId);
  const stageDef = GROWTH_STAGE_DEFINITIONS[state.pet.growth.stage];
  const careCapMultiplier = species?.careCapMultiplier ?? 1.0;

  return Math.floor(stageDef.baseCareStatMax * careCapMultiplier);
}

/**
 * Calculate max energy for current pet.
 */
function getMaxEnergy(state: GameState): number {
  if (!state.pet) return 0;

  const species = getSpeciesById(state.pet.identity.speciesId);
  const stageDef = GROWTH_STAGE_DEFINITIONS[state.pet.growth.stage];
  // Use careCapMultiplier for energy as well (species don't have separate energyCapMultiplier)
  const careCapMultiplier = species?.careCapMultiplier ?? 1.0;

  return Math.floor(stageDef.baseEnergyMax * careCapMultiplier);
}

/**
 * Use a food item to restore satiety.
 */
export function useFoodItem(state: GameState, itemId: string): UseItemResult {
  // Check if pet exists
  if (!state.pet) {
    return { success: false, state, message: "No pet to feed!" };
  }

  // Check if pet is sleeping
  if (state.pet.sleep.isSleeping) {
    return { success: false, state, message: "Can't feed a sleeping pet!" };
  }

  // Check if item exists and is food
  const itemDef = getItemById(itemId);
  if (!itemDef || !isFoodItem(itemDef)) {
    return { success: false, state, message: "Invalid food item!" };
  }

  // Check if player has the item
  if (!hasItem(state.player.inventory, itemId)) {
    return {
      success: false,
      state,
      message: `No ${itemDef.name} in inventory!`,
    };
  }

  // Calculate new satiety (clamped to max)
  const maxCareStat = getMaxCareStat(state);
  const newSatiety = Math.min(
    state.pet.careStats.satiety + itemDef.satietyRestore,
    maxCareStat,
  );

  // Calculate new poop timer (apply acceleration if applicable)
  let newTicksUntilNext = state.pet.poop.ticksUntilNext;
  if (itemDef.poopAcceleration && itemDef.poopAcceleration > 0) {
    newTicksUntilNext = Math.max(
      0,
      newTicksUntilNext - itemDef.poopAcceleration,
    );
  }

  // Remove item and update pet
  const newInventory = removeItem(state.player.inventory, itemId, 1);

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
    },
    pet: {
      ...state.pet,
      careStats: {
        ...state.pet.careStats,
        satiety: newSatiety,
      },
      poop: {
        ...state.pet.poop,
        ticksUntilNext: newTicksUntilNext,
      },
    },
  };

  return {
    success: true,
    state: newState,
    message: `Fed ${itemDef.name}!`,
  };
}

/**
 * Use a drink item to restore hydration (and optionally energy).
 */
export function useDrinkItem(state: GameState, itemId: string): UseItemResult {
  // Check if pet exists
  if (!state.pet) {
    return { success: false, state, message: "No pet to give water!" };
  }

  // Check if pet is sleeping
  if (state.pet.sleep.isSleeping) {
    return {
      success: false,
      state,
      message: "Can't give water to a sleeping pet!",
    };
  }

  // Check if item exists and is drink
  const itemDef = getItemById(itemId);
  if (!itemDef || !isDrinkItem(itemDef)) {
    return { success: false, state, message: "Invalid drink item!" };
  }

  // Check if player has the item
  if (!hasItem(state.player.inventory, itemId)) {
    return {
      success: false,
      state,
      message: `No ${itemDef.name} in inventory!`,
    };
  }

  // Calculate new hydration (clamped to max)
  const maxCareStat = getMaxCareStat(state);
  const newHydration = Math.min(
    state.pet.careStats.hydration + itemDef.hydrationRestore,
    maxCareStat,
  );

  // Calculate new energy if drink provides it
  let newEnergy = state.pet.energyStats.energy;
  if (itemDef.energyRestore) {
    const maxEnergy = getMaxEnergy(state);
    newEnergy = Math.min(newEnergy + itemDef.energyRestore, maxEnergy);
  }

  // Remove item and update pet
  const newInventory = removeItem(state.player.inventory, itemId, 1);

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
    },
    pet: {
      ...state.pet,
      careStats: {
        ...state.pet.careStats,
        hydration: newHydration,
      },
      energyStats: {
        energy: newEnergy,
      },
    },
  };

  return {
    success: true,
    state: newState,
    message: `Gave ${itemDef.name}!`,
  };
}
