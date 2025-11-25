/**
 * Initial state creation for new games.
 */

import { createDefaultStarterPet } from "@/game/data/starting";
import type { GameState, Pet } from "@/game/types";

/**
 * Create initial game state with a default starter pet.
 * Used when starting a new game with default settings.
 */
export function createInitialGameStateWithPet(): GameState {
  const pet = createDefaultStarterPet();

  return {
    version: 1,
    lastSaveTime: Date.now(),
    totalTicks: 0,
    pet,
    player: {
      inventory: { items: [] },
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
    version: 1,
    lastSaveTime: Date.now(),
    totalTicks: 0,
    pet,
    player: {
      inventory: { items: [] },
      currency: { coins: 100 },
      currentLocationId: "home",
    },
    quests: [],
    isInitialized: true,
  };
}
