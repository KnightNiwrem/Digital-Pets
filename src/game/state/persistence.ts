/**
 * Persistence module for save/load game state to localStorage.
 */

import {
  CURRENT_SAVE_VERSION,
  createInitialGameState,
  type GameState,
} from "@/game/types";

const STORAGE_KEY = "digital_pets_save";

/**
 * Validation error for malformed save data.
 */
export class SaveValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SaveValidationError";
  }
}

/**
 * Validate that an unknown value is a valid GameState structure.
 * Performs runtime checks on required fields and types.
 */
export function validateGameState(value: unknown): value is GameState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check required top-level fields exist with correct types
  if (typeof obj.version !== "number") return false;
  if (typeof obj.lastSaveTime !== "number") return false;
  if (typeof obj.totalTicks !== "number") return false;
  if (typeof obj.isInitialized !== "boolean") return false;
  if (typeof obj.lastDailyReset !== "number") return false;
  if (typeof obj.lastWeeklyReset !== "number") return false;

  // Pet can be null or an object with required structure
  if (obj.pet !== null) {
    if (typeof obj.pet !== "object") return false;
    const pet = obj.pet as Record<string, unknown>;
    if (typeof pet.identity !== "object" || pet.identity === null) return false;
    if (typeof pet.growth !== "object" || pet.growth === null) return false;
    if (typeof pet.careStats !== "object" || pet.careStats === null)
      return false;
    if (typeof pet.energyStats !== "object" || pet.energyStats === null)
      return false;
  }

  // Player state must exist with required structure
  if (typeof obj.player !== "object" || obj.player === null) return false;
  const player = obj.player as Record<string, unknown>;
  if (typeof player.inventory !== "object" || player.inventory === null)
    return false;
  if (typeof player.currency !== "object" || player.currency === null)
    return false;
  if (typeof player.currentLocationId !== "string") return false;
  if (typeof player.skills !== "object" || player.skills === null) return false;

  // Quests must be an array
  if (!Array.isArray(obj.quests)) return false;

  // pendingEvents must be an array (or undefined, will be initialized)
  if (obj.pendingEvents !== undefined && !Array.isArray(obj.pendingEvents)) {
    return false;
  }

  return true;
}

/**
 * Result of a load operation.
 */
export type LoadResult =
  | { success: true; state: GameState }
  | { success: false; error: string };

/**
 * Save game state to localStorage.
 * Updates lastSaveTime before saving.
 * Excludes transient pendingEvents from the saved state.
 */
export function saveGame(state: GameState): boolean {
  try {
    const stateToSave: GameState = {
      ...state,
      pendingEvents: [],
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
 * Initializes pendingEvents to empty array (not persisted).
 */
export function loadGame(): LoadResult {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);

    if (!serialized) {
      return { success: true, state: createInitialGameState() };
    }

    const parsed: unknown = JSON.parse(serialized);

    // Validate the parsed data structure
    if (!validateGameState(parsed)) {
      return {
        success: false,
        error: "Invalid save data structure",
      };
    }

    // Version check for future migrations
    if (parsed.version !== CURRENT_SAVE_VERSION) {
      // In the future, handle migrations here
      console.warn(
        `Save version mismatch: ${parsed.version} vs ${CURRENT_SAVE_VERSION}`,
      );
    }

    // Ensure pendingEvents is initialized (not persisted)
    const stateWithEvents: GameState = {
      ...parsed,
      pendingEvents: parsed.pendingEvents ?? [],
    };

    return { success: true, state: stateWithEvents };
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
    const parsed: unknown = JSON.parse(data);

    // Validate the parsed data structure
    if (!validateGameState(parsed)) {
      return { success: false, error: "Invalid save data structure" };
    }

    localStorage.setItem(STORAGE_KEY, data);

    // Ensure pendingEvents is initialized (not persisted)
    const stateWithEvents: GameState = {
      ...parsed,
      pendingEvents: parsed.pendingEvents ?? [],
    };

    return { success: true, state: stateWithEvents };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid JSON",
    };
  }
}
