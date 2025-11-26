/**
 * Initial state creation for new games.
 */

import { createDefaultStarterPet } from "@/game/data/starting";
import { CURRENT_SAVE_VERSION, type GameState, type Pet } from "@/game/types";
import type { Inventory, InventoryItem } from "@/game/types/gameState";

/**
 * Starting inventory items for new players.
 */
const STARTING_ITEMS: readonly InventoryItem[] = [
  { itemId: "food_kibble", quantity: 10, currentDurability: null },
  { itemId: "food_apple", quantity: 5, currentDurability: null },
  { itemId: "drink_water", quantity: 10, currentDurability: null },
  { itemId: "drink_juice", quantity: 5, currentDurability: null },
] as const;

/**
 * Create starting inventory for new players.
 */
function createStartingInventory(): Inventory {
  return { items: [...STARTING_ITEMS] };
}

/**
 * Create initial game state with a default starter pet.
 * Used when starting a new game with default settings.
 */
export function createInitialGameStateWithPet(): GameState {
  const pet = createDefaultStarterPet();

  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    totalTicks: 0,
    pet,
    player: {
      inventory: createStartingInventory(),
      currency: { coins: 100 },
      currentLocationId: "home",
    },
    quests: [],
    isInitialized: true,
  };
}

/**
 * Create game state with a custom pet.
 */
export function createGameStateWithPet(pet: Pet): GameState {
  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    totalTicks: 0,
    pet,
    player: {
      inventory: createStartingInventory(),
      currency: { coins: 100 },
      currentLocationId: "home",
    },
    quests: [],
    isInitialized: true,
  };
}
