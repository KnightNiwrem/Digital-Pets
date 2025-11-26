/**
 * Persistence module for save/load game state to localStorage.
 */

import {
  CURRENT_SAVE_VERSION,
  createInitialGameState,
  type GameState,
} from "@/game/types";
import { createInitialSkills } from "@/game/types/skill";

const STORAGE_KEY = "digital_pets_save";

/**
 * Result of a load operation.
 */
export type LoadResult =
  | { success: true; state: GameState }
  | { success: false; error: string };

/**
 * Save game state to localStorage.
 * Updates lastSaveTime before saving.
 */
export function saveGame(state: GameState): boolean {
  try {
    const stateToSave: GameState = {
      ...state,
      lastSaveTime: Date.now(),
    };
    const serialized = JSON.stringify(stateToSave);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error("Failed to save game:", error);
    return false;
  }
}

/**
 * Load game state from localStorage.
 * Returns initial state if no save exists.
 */
export function loadGame(): LoadResult {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);

    if (!serialized) {
      return { success: true, state: createInitialGameState() };
    }

    const parsed = JSON.parse(serialized) as GameState;

    // Migrate old saves to include skills
    if (!parsed.player.skills) {
      parsed.player.skills = createInitialSkills();
    }

    // Version check for future migrations
    if (parsed.version !== CURRENT_SAVE_VERSION) {
      // In the future, handle migrations here
      console.warn(
        `Save version mismatch: ${parsed.version} vs ${CURRENT_SAVE_VERSION}`,
      );
    }

    return { success: true, state: parsed };
  } catch (error) {
    console.error("Failed to load game:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if a save exists.
 */
export function hasSave(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Delete the saved game.
 */
export function deleteSave(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to delete save:", error);
    return false;
  }
}

/**
 * Export save data as a JSON string for backup.
 */
export function exportSave(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to export save:", error);
    return null;
  }
}

/**
 * Import save data from a JSON string.
 */
export function importSave(data: string): LoadResult {
  try {
    const parsed = JSON.parse(data) as GameState;

    // Basic validation
    if (typeof parsed.version !== "number") {
      return { success: false, error: "Invalid save data: missing version" };
    }

    localStorage.setItem(STORAGE_KEY, data);
    return { success: true, state: parsed };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}
