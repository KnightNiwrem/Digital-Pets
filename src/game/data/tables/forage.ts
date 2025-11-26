/**
 * Forage tables defining item drops per location.
 */

import type { Rarity } from "@/game/types/constants";

/**
 * A single entry in a forage table.
 */
export interface ForageEntry {
  /** Item ID that can drop */
  itemId: string;
  /** Base drop rate (0.0 to 1.0) */
  baseDropRate: number;
  /** Item rarity tier */
  rarity: Rarity;
  /** Minimum Foraging skill required (0 = no requirement) */
  minSkillLevel: number;
  /** Quantity range [min, max] */
  quantity: [number, number];
}

/**
 * A complete forage table for a location.
 */
export interface ForageTable {
  /** Table ID matching location.forageTableId */
  id: string;
  /** Base duration in ticks for foraging at this location */
  baseDurationTicks: number;
  /** Base energy cost in display units */
  baseEnergyCost: number;
  /** Items available to forage */
  entries: ForageEntry[];
}

/**
 * Meadow forage table - beginner area with common items.
 */
export const MEADOW_FORAGE: ForageTable = {
  id: "meadow_forage",
  baseDurationTicks: 2,
  baseEnergyCost: 5,
  entries: [
    {
      itemId: "food_apple",
      baseDropRate: 0.4,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "drink_water",
      baseDropRate: 0.3,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "food_kibble",
      baseDropRate: 0.25,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: "toy_ball",
      baseDropRate: 0.1,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 1],
    },
    {
      itemId: "food_meat",
      baseDropRate: 0.08,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 1],
    },
  ],
};

/**
 * Woods forage table - intermediate area with better rewards.
 */
export const WOODS_FORAGE: ForageTable = {
  id: "woods_forage",
  baseDurationTicks: 3,
  baseEnergyCost: 8,
  entries: [
    {
      itemId: "food_apple",
      baseDropRate: 0.3,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: "drink_juice",
      baseDropRate: 0.2,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "food_fish",
      baseDropRate: 0.15,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "food_meat",
      baseDropRate: 0.12,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 2],
    },
    {
      itemId: "toy_plush",
      baseDropRate: 0.08,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 1],
    },
    {
      itemId: "food_cake",
      baseDropRate: 0.05,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 1],
    },
  ],
};

/**
 * All forage tables indexed by ID.
 */
export const FORAGE_TABLES: Record<string, ForageTable> = {
  meadow_forage: MEADOW_FORAGE,
  woods_forage: WOODS_FORAGE,
};

/**
 * Get a forage table by ID.
 */
export function getForageTable(tableId: string): ForageTable | undefined {
  return FORAGE_TABLES[tableId];
}
