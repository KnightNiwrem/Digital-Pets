/**
 * Game state types for overall game and player state.
 */

import type { BattleState } from "@/game/core/battle/battle";
import type { ExplorationResult, TrainingResult } from "./activity";
import type { Tick, Timestamp } from "./common";
import type { Pet } from "./pet";
import type { QuestProgress } from "./quest";
import { createInitialSkills, type PlayerSkills } from "./skill";

/**
 * Active battle state stored in game state.
 * Includes the full battle state for persistence across page refreshes.
 */
export interface ActiveBattle {
  /** Enemy species ID */
  enemySpeciesId: string;
  /** Enemy level */
  enemyLevel: number;
  /** Full battle state for resuming battle */
  battleState: BattleState;
}

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
  /** Player skills */
  skills: PlayerSkills;
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
  /** Last training result (for UI notification, cleared after display) */
  lastTrainingResult?: TrainingResult & { facilityName: string };
  /**
   * Active battle (if in combat).
   * Persisted to allow resuming battle after page refresh.
   */
  activeBattle?: ActiveBattle;
  /**
   * Timestamp of the last daily reset.
   * Used to track when to reset daily counters like sleepTicksToday.
   * Per spec (time-mechanics.md): Daily reset occurs at midnight local time.
   */
  lastDailyReset: Timestamp;
}

/**
 * Current save version for compatibility checks.
 */
export const CURRENT_SAVE_VERSION = 1;

/**
 * Create an empty initial game state.
 */
export function createInitialGameState(): GameState {
  const currentTime = Date.now();
  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: currentTime,
    totalTicks: 0,
    pet: null,
    player: {
      inventory: { items: [] },
      currency: { coins: 0 },
      currentLocationId: "home",
      skills: createInitialSkills(),
    },
    quests: [],
    isInitialized: false,
    lastDailyReset: currentTime,
  };
}
