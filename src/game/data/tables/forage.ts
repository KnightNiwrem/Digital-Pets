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
    {
      itemId: "material_wood",
      baseDropRate: 0.35,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: "material_herb",
      baseDropRate: 0.25,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "food_mushroom",
      baseDropRate: 0.2,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 2],
    },
  ],
};

/**
 * Coast forage table - beach area with unique drops.
 */
export const COAST_FORAGE: ForageTable = {
  id: "coast_forage",
  baseDurationTicks: 3,
  baseEnergyCost: 7,
  entries: [
    {
      itemId: "drink_coconut",
      baseDropRate: 0.25,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "food_fish",
      baseDropRate: 0.35,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: "drink_water",
      baseDropRate: 0.3,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: "material_stone",
      baseDropRate: 0.2,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "material_fiber",
      baseDropRate: 0.15,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "toy_frisbee",
      baseDropRate: 0.05,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 1],
    },
  ],
};

/**
 * Highlands forage table - volcanic area with rare materials.
 */
export const HIGHLANDS_FORAGE: ForageTable = {
  id: "highlands_forage",
  baseDurationTicks: 4,
  baseEnergyCost: 12,
  entries: [
    {
      itemId: "material_stone",
      baseDropRate: 0.4,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [2, 4],
    },
    {
      itemId: "material_iron_ore",
      baseDropRate: 0.25,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 2],
    },
    {
      itemId: "food_steak",
      baseDropRate: 0.1,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 1],
    },
    {
      itemId: "material_monster_fang",
      baseDropRate: 0.15,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 2],
    },
    {
      itemId: "medicine_antidote",
      baseDropRate: 0.08,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 1],
    },
    {
      itemId: "material_crystal",
      baseDropRate: 0.05,
      rarity: "rare",
      minSkillLevel: 4,
      quantity: [1, 1],
    },
  ],
};

/**
 * Caves forage table - dungeon with crystals and rare finds.
 */
export const CAVES_FORAGE: ForageTable = {
  id: "caves_forage",
  baseDurationTicks: 4,
  baseEnergyCost: 10,
  entries: [
    {
      itemId: "material_stone",
      baseDropRate: 0.35,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [2, 4],
    },
    {
      itemId: "material_crystal",
      baseDropRate: 0.15,
      rarity: "rare",
      minSkillLevel: 2,
      quantity: [1, 2],
    },
    {
      itemId: "material_iron_ore",
      baseDropRate: 0.2,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 3],
    },
    {
      itemId: "medicine_potion",
      baseDropRate: 0.1,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: "drink_mineral_water",
      baseDropRate: 0.12,
      rarity: "rare",
      minSkillLevel: 2,
      quantity: [1, 1],
    },
    {
      itemId: "equip_lucky_charm",
      baseDropRate: 0.02,
      rarity: "uncommon",
      minSkillLevel: 4,
      quantity: [1, 1],
    },
  ],
};

/**
 * Depths forage table - end-game dungeon with best materials.
 */
export const DEPTHS_FORAGE: ForageTable = {
  id: "depths_forage",
  baseDurationTicks: 5,
  baseEnergyCost: 15,
  entries: [
    {
      itemId: "material_crystal",
      baseDropRate: 0.3,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 3],
    },
    {
      itemId: "material_essence",
      baseDropRate: 0.1,
      rarity: "epic",
      minSkillLevel: 5,
      quantity: [1, 1],
    },
    {
      itemId: "material_monster_fang",
      baseDropRate: 0.25,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 3],
    },
    {
      itemId: "medicine_super_potion",
      baseDropRate: 0.08,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 1],
    },
    {
      itemId: "food_feast",
      baseDropRate: 0.03,
      rarity: "epic",
      minSkillLevel: 5,
      quantity: [1, 1],
    },
    {
      itemId: "equip_hunters_eye",
      baseDropRate: 0.01,
      rarity: "epic",
      minSkillLevel: 6,
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
  coast_forage: COAST_FORAGE,
  highlands_forage: HIGHLANDS_FORAGE,
  caves_forage: CAVES_FORAGE,
  depths_forage: DEPTHS_FORAGE,
};

/**
 * Get a forage table by ID.
 */
export function getForageTable(tableId: string): ForageTable | undefined {
  return FORAGE_TABLES[tableId];
}
