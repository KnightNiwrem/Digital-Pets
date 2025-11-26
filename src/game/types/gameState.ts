/**
 * Game state types for overall game and player state.
 */

import type { ExplorationResult } from "./activity";
import type { Tick, Timestamp } from "./common";
import type { Pet } from "./pet";

/**
 * Inventory item instance with quantity or durability.
 */
export interface InventoryItem {
  /** Item definition ID */
  itemId: string;
  /** Quantity (for stackable items) */
  quantity: number;
  /** Current durability (for durability-based items, null for stackable) */
  currentDurability: number | null;
}

/**
 * Player inventory state.
 */
export interface Inventory {
  /** Items currently carried by the player */
  items: InventoryItem[];
}

/**
 * Player currency.
 */
export interface Currency {
  /** Primary currency amount */
  coins: number;
}

/**
 * Player state including inventory and resources.
 */
export interface PlayerState {
  /** Player's inventory */
  inventory: Inventory;
  /** Player's currency */
  currency: Currency;
  /** Current location ID */
  currentLocationId: string;
}

/**
 * Quest progress tracking.
 */
export interface QuestProgress {
  /** Quest ID */
  questId: string;
  /** Current objective index */
  currentObjective: number;
  /** Progress data for current objective */
  objectiveProgress: Record<string, number>;
  /** Whether the quest is completed */
  isCompleted: boolean;
}

/**
 * Complete game state.
 */
export interface GameState {
  /** Version for save compatibility */
  version: number;
  /** Timestamp of last save */
  lastSaveTime: Timestamp;
  /** Total ticks processed since game start */
  totalTicks: Tick;
  /** The player's active pet (null if no pet yet) */
  pet: Pet | null;
  /** Player state (inventory, currency, location) */
  player: PlayerState;
  /** Active and completed quest progress */
  quests: QuestProgress[];
  /** Whether the game has been initialized */
  isInitialized: boolean;
  /** Last exploration result (for UI notification, cleared after display) */
  lastExplorationResult?: ExplorationResult & { locationName: string };
}

/**
 * Current save version for compatibility checks.
 */
export const CURRENT_SAVE_VERSION = 1;

/**
 * Create an empty initial game state.
 */
export function createInitialGameState(): GameState {
  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    totalTicks: 0,
    pet: null,
    player: {
      inventory: { items: [] },
      currency: { coins: 0 },
      currentLocationId: "home",
    },
    quests: [],
    isInitialized: false,
  };
}
