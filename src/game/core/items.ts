/**
 * Item usage logic for consuming food, drinks, cleaning items, and toys.
 */

import { checkActivityIdle } from "@/game/core/activityGating";
import { removePoop } from "@/game/core/care/poop";
import { hasItem, removeItem } from "@/game/core/inventory";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { getItemById } from "@/game/data/items";
import { ItemMessages } from "@/game/data/messages";
import type { GameState, InventoryItem } from "@/game/types/gameState";
import {
  isCleaningItem,
  isDrinkItem,
  isFoodItem,
  isToyItem,
} from "@/game/types/item";

/**
 * Result of using an item.
 */
export interface UseItemResult {
  success: boolean;
  state: GameState;
  message: string;
}

/**
 * Calculate max care stats for current pet.
 */
function getMaxCareStats(state: GameState): {
  satiety: number;
  hydration: number;
  happiness: number;
} {
  if (!state.pet) return { satiety: 0, hydration: 0, happiness: 0 };
  const maxStats = calculatePetMaxStats(state.pet);
  return maxStats?.care ?? { satiety: 0, hydration: 0, happiness: 0 };
}

/**
 * Calculate max energy for current pet.
 */
function getMaxEnergy(state: GameState): number {
  if (!state.pet) return 0;
  const maxStats = calculatePetMaxStats(state.pet);
  return maxStats?.energy ?? 0;
}

/**
 * Use a food item to restore satiety.
 */
export function useFoodItem(state: GameState, itemId: string): UseItemResult {
  // Check if pet exists
  if (!state.pet) {
    return { success: false, state, message: ItemMessages.noPetToFeed };
  }

  // Check if pet is idle (not sleeping, training, exploring, or battling)
  const gatingCheck = checkActivityIdle(state.pet, "feed");
  if (!gatingCheck.allowed) {
    return { success: false, state, message: gatingCheck.message };
  }

  // Check if item exists and is food
  const itemDef = getItemById(itemId);
  if (!itemDef || !isFoodItem(itemDef)) {
    return { success: false, state, message: ItemMessages.invalidFoodItem };
  }

  // Check if player has the item
  if (!hasItem(state.player.inventory, itemId)) {
    return {
      success: false,
      state,
      message: ItemMessages.notInInventory(itemDef.name),
    };
  }

  // Calculate new satiety (clamped to max)
  const maxCareStats = getMaxCareStats(state);
  const newSatiety = Math.min(
    state.pet.careStats.satiety + itemDef.satietyRestore,
    maxCareStats.satiety,
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
    message: ItemMessages.fed(itemDef.name),
  };
}

/**
 * Use a drink item to restore hydration (and optionally energy).
 */
export function useDrinkItem(state: GameState, itemId: string): UseItemResult {
  // Check if pet exists
  if (!state.pet) {
    return { success: false, state, message: ItemMessages.noPetToWater };
  }

  // Check if pet is idle (not sleeping, training, exploring, or battling)
  const gatingCheck = checkActivityIdle(state.pet, "give water");
  if (!gatingCheck.allowed) {
    return { success: false, state, message: gatingCheck.message };
  }

  // Check if item exists and is drink
  const itemDef = getItemById(itemId);
  if (!itemDef || !isDrinkItem(itemDef)) {
    return { success: false, state, message: ItemMessages.invalidDrinkItem };
  }

  // Check if player has the item
  if (!hasItem(state.player.inventory, itemId)) {
    return {
      success: false,
      state,
      message: ItemMessages.notInInventory(itemDef.name),
    };
  }

  // Calculate new hydration (clamped to max)
  const maxCareStats = getMaxCareStats(state);
  const newHydration = Math.min(
    state.pet.careStats.hydration + itemDef.hydrationRestore,
    maxCareStats.hydration,
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
        ...state.pet.energyStats,
        energy: newEnergy,
      },
    },
  };

  return {
    success: true,
    state: newState,
    message: ItemMessages.gaveDrink(itemDef.name),
  };
}

/**
 * Use a cleaning item to remove poop.
 */
export function useCleaningItem(
  state: GameState,
  itemId: string,
): UseItemResult {
  // Check if pet exists
  if (!state.pet) {
    return { success: false, state, message: ItemMessages.noPetToClean };
  }

  // Check if pet is idle (not sleeping, training, exploring, or battling)
  const gatingCheck = checkActivityIdle(state.pet, "clean");
  if (!gatingCheck.allowed) {
    return { success: false, state, message: gatingCheck.message };
  }

  // Check if item exists and is cleaning
  const itemDef = getItemById(itemId);
  if (!itemDef || !isCleaningItem(itemDef)) {
    return { success: false, state, message: ItemMessages.invalidCleaningItem };
  }

  // Check if player has the item
  if (!hasItem(state.player.inventory, itemId)) {
    return {
      success: false,
      state,
      message: ItemMessages.notInInventory(itemDef.name),
    };
  }

  // Check if there's poop to clean
  if (state.pet.poop.count === 0) {
    return { success: false, state, message: ItemMessages.nothingToClean };
  }

  // Calculate new poop count
  const newPoopCount = removePoop(state.pet.poop.count, itemDef.poopRemoved);

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
      poop: {
        ...state.pet.poop,
        count: newPoopCount,
      },
    },
  };

  const cleaned = state.pet.poop.count - newPoopCount;
  return {
    success: true,
    state: newState,
    message: ItemMessages.cleaned(cleaned, itemDef.name),
  };
}

/**
 * Find a toy inventory item by item ID with positive durability.
 */
function findToyInventoryItem(
  inventory: InventoryItem[],
  itemId: string,
): { item: InventoryItem; index: number } | undefined {
  const index = inventory.findIndex(
    (item) =>
      item.itemId === itemId &&
      item.currentDurability !== null &&
      item.currentDurability > 0,
  );
  if (index === -1) return undefined;
  const item = inventory[index];
  if (!item) return undefined;
  return { item, index };
}

/**
 * Use a toy item to restore happiness. Reduces durability by 1.
 * Destroys the toy when durability reaches 0.
 */
export function useToyItem(state: GameState, itemId: string): UseItemResult {
  // Check if pet exists
  if (!state.pet) {
    return { success: false, state, message: ItemMessages.noPetToPlay };
  }

  // Check if pet is idle (not sleeping, training, exploring, or battling)
  const gatingCheck = checkActivityIdle(state.pet, "play");
  if (!gatingCheck.allowed) {
    return { success: false, state, message: gatingCheck.message };
  }

  // Check if item exists and is a toy
  const itemDef = getItemById(itemId);
  if (!itemDef || !isToyItem(itemDef)) {
    return { success: false, state, message: ItemMessages.invalidToyItem };
  }

  // Find the toy in inventory (with durability)
  const toyResult = findToyInventoryItem(state.player.inventory.items, itemId);
  if (!toyResult) {
    return {
      success: false,
      state,
      message: ItemMessages.notInInventory(itemDef.name),
    };
  }

  const { item: toyItem, index: toyIndex } = toyResult;
  // findToyInventoryItem guarantees currentDurability is non-null and > 0
  if (toyItem.currentDurability === null) {
    return {
      success: false,
      state,
      message: ItemMessages.corruptedDurability(itemDef.name),
    };
  }
  const currentDurability = toyItem.currentDurability;

  // Calculate new happiness (clamped to max)
  const maxCareStats = getMaxCareStats(state);
  const newHappiness = Math.min(
    state.pet.careStats.happiness + itemDef.happinessRestore,
    maxCareStats.happiness,
  );

  // Calculate new durability
  const newDurability = currentDurability - 1;

  // Update inventory: either reduce durability or remove toy if broken
  const newItems = [...state.player.inventory.items];
  if (newDurability <= 0) {
    // Toy is destroyed
    newItems.splice(toyIndex, 1);
  } else {
    // Update durability
    newItems[toyIndex] = {
      ...toyItem,
      currentDurability: newDurability,
    };
  }

  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: { items: newItems },
    },
    pet: {
      ...state.pet,
      careStats: {
        ...state.pet.careStats,
        happiness: newHappiness,
      },
    },
  };

  return {
    success: true,
    state: newState,
    message: ItemMessages.playedWith(itemDef.name, newDurability <= 0),
  };
}
