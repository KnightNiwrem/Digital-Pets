// Web Storage API wrapper for game persistence

import type { GameState, Result, ValidationResult } from "@/types";
import { GAME_CONSTANTS } from "@/types";

export class GameStorage {
  private static readonly STORAGE_KEYS = {
    GAME_STATE: "digitalPets_gameState",
    SETTINGS: "digitalPets_settings",
    BACKUP_PREFIX: "digitalPets_backup_",
  } as const;

  /**
   * Save the complete game state to localStorage
   */
  static saveGame(gameState: GameState): Result<void> {
    try {
      // Update save metadata
      gameState.metadata.lastSaveTime = Date.now();
      gameState.metadata.saveCount++;

      // Create backup of previous save
      this.createBackup();

      // Serialize and save
      const serialized = JSON.stringify(gameState);
      localStorage.setItem(this.STORAGE_KEYS.GAME_STATE, serialized);

      return { success: true };
    } catch (error) {
      console.error("Failed to save game:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown save error",
      };
    }
  }

  /**
   * Load the game state from localStorage
   */
  static loadGame(): Result<GameState> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEYS.GAME_STATE);

      if (!savedData) {
        return {
          success: false,
          error: "No saved game found",
        };
      }

      const gameState = JSON.parse(savedData) as GameState;

      // Validate the loaded data
      const validation = this.validateGameState(gameState);
      if (!validation.valid) {
        console.warn("Invalid save data:", validation.errors);
        return {
          success: false,
          error: `Invalid save data: ${validation.errors.join(", ")}`,
        };
      }

      return { success: true, data: gameState };
    } catch (error) {
      console.error("Failed to load game:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown load error",
      };
    }
  }

  /**
   * Check if a saved game exists
   */
  static hasExistingSave(): boolean {
    return localStorage.getItem(this.STORAGE_KEYS.GAME_STATE) !== null;
  }

  /**
   * Delete the saved game
   */
  static clearSave(): Result<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.GAME_STATE);
      this.clearBackups();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to clear save",
      };
    }
  }

  /**
   * Get save metadata without loading the full game state
   */
  static getSaveMetadata(): Result<GameState["metadata"]> {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEYS.GAME_STATE);

      if (!savedData) {
        return {
          success: false,
          error: "No saved game found",
        };
      }

      const gameState = JSON.parse(savedData) as GameState;
      return { success: true, data: gameState.metadata };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to read save metadata",
      };
    }
  }

  /**
   * Create a backup of the current save
   */
  private static createBackup(): void {
    try {
      const currentSave = localStorage.getItem(this.STORAGE_KEYS.GAME_STATE);
      if (!currentSave) return;

      const timestamp = Date.now();
      const backupKey = `${this.STORAGE_KEYS.BACKUP_PREFIX}${timestamp}`;
      localStorage.setItem(backupKey, currentSave);

      // Clean up old backups
      this.cleanupOldBackups();
    } catch (error) {
      console.warn("Failed to create backup:", error);
    }
  }

  /**
   * Clean up old backup saves, keeping only the most recent ones
   */
  private static cleanupOldBackups(): void {
    try {
      const backupKeys: string[] = [];

      // Find all backup keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_KEYS.BACKUP_PREFIX)) {
          backupKeys.push(key);
        }
      }

      // Sort by timestamp (newest first)
      backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.replace(this.STORAGE_KEYS.BACKUP_PREFIX, ""));
        const timestampB = parseInt(b.replace(this.STORAGE_KEYS.BACKUP_PREFIX, ""));
        return timestampB - timestampA;
      });

      // Remove excess backups
      const maxBackups = GAME_CONSTANTS.MAX_SAVE_STATES;
      for (let i = maxBackups; i < backupKeys.length; i++) {
        localStorage.removeItem(backupKeys[i]);
      }
    } catch (error) {
      console.warn("Failed to cleanup old backups:", error);
    }
  }

  /**
   * Clear all backup saves
   */
  private static clearBackups(): void {
    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.STORAGE_KEYS.BACKUP_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear backups:", error);
    }
  }

  /**
   * Validate that the loaded game state has the required structure
   */
  private static validateGameState(gameState: unknown): ValidationResult {
    const errors: string[] = [];

    if (!gameState || typeof gameState !== "object") {
      errors.push("Game state is not an object");
      return { valid: false, errors };
    }

    const state = gameState as Record<string, unknown>;

    // Check required top-level properties
    const requiredProperties = [
      "metadata",
      "inventory",
      "world",
      "questLog",
      "playerStats",
      "settings",
      "metrics",
      "gameTime",
    ];

    for (const prop of requiredProperties) {
      if (!(prop in state)) {
        errors.push(`Missing required property: ${prop}`);
      }
    }

    // Validate metadata
    if (state.metadata && typeof state.metadata === "object") {
      const metadata = state.metadata as Record<string, unknown>;
      if (!metadata.version || typeof metadata.version !== "string") {
        errors.push("Invalid or missing metadata.version");
      }
      if (!metadata.lastSaveTime || typeof metadata.lastSaveTime !== "number") {
        errors.push("Invalid or missing metadata.lastSaveTime");
      }
    } else {
      errors.push("Invalid metadata object");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get available storage space information
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    try {
      // Calculate used space
      let totalUsed = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("digitalPets_")) {
          const value = localStorage.getItem(key);
          totalUsed += (key.length + (value?.length || 0)) * 2; // UTF-16 characters
        }
      }

      // Most browsers allow ~5-10MB of localStorage
      const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
      const available = Math.max(0, estimatedLimit - totalUsed);
      const percentage = (totalUsed / estimatedLimit) * 100;

      return {
        used: totalUsed,
        available,
        percentage: Math.min(100, percentage),
      };
    } catch {
      console.warn("Failed to calculate storage info");
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Test if localStorage is available and working
   */
  static isStorageAvailable(): boolean {
    try {
      const testKey = "digitalPets_test";
      const testValue = "test";

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      return retrieved === testValue;
    } catch {
      return false;
    }
  }
}
