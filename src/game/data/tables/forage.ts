/**
 * Forage tables defining item drops per location.
 */

import type { Rarity } from "@/game/types/constants";
import {
  DRINK_ITEMS,
  EQUIPMENT_ITEMS,
  FOOD_ITEMS,
  MATERIAL_ITEMS,
  MEDICINE_ITEMS,
  TOY_ITEMS,
} from "../items";

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
      itemId: FOOD_ITEMS.APPLE.id,
      baseDropRate: 0.4,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: DRINK_ITEMS.WATER.id,
      baseDropRate: 0.3,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: FOOD_ITEMS.KIBBLE.id,
      baseDropRate: 0.25,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: TOY_ITEMS.BALL.id,
      baseDropRate: 0.1,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 1],
    },
    {
      itemId: FOOD_ITEMS.MEAT.id,
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
      itemId: FOOD_ITEMS.APPLE.id,
      baseDropRate: 0.3,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: DRINK_ITEMS.JUICE.id,
      baseDropRate: 0.2,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: FOOD_ITEMS.FISH.id,
      baseDropRate: 0.15,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: FOOD_ITEMS.MEAT.id,
      baseDropRate: 0.12,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 2],
    },
    {
      itemId: TOY_ITEMS.PLUSH.id,
      baseDropRate: 0.08,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 1],
    },
    {
      itemId: FOOD_ITEMS.CAKE.id,
      baseDropRate: 0.05,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 1],
    },
    {
      itemId: MATERIAL_ITEMS.WOOD.id,
      baseDropRate: 0.35,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      baseDropRate: 0.25,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
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
      itemId: DRINK_ITEMS.COCONUT.id,
      baseDropRate: 0.25,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: FOOD_ITEMS.FISH.id,
      baseDropRate: 0.35,
      rarity: "uncommon",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: DRINK_ITEMS.WATER.id,
      baseDropRate: 0.3,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 3],
    },
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      baseDropRate: 0.2,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      baseDropRate: 0.15,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: TOY_ITEMS.FRISBEE.id,
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
      itemId: MATERIAL_ITEMS.STONE.id,
      baseDropRate: 0.4,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [2, 4],
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      baseDropRate: 0.25,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 2],
    },
    {
      itemId: FOOD_ITEMS.STEAK.id,
      baseDropRate: 0.1,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 1],
    },
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      baseDropRate: 0.15,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 2],
    },
    {
      itemId: MEDICINE_ITEMS.ANTIDOTE.id,
      baseDropRate: 0.08,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 1],
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
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
      itemId: MATERIAL_ITEMS.STONE.id,
      baseDropRate: 0.35,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [2, 4],
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      baseDropRate: 0.15,
      rarity: "rare",
      minSkillLevel: 2,
      quantity: [1, 2],
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      baseDropRate: 0.2,
      rarity: "uncommon",
      minSkillLevel: 1,
      quantity: [1, 3],
    },
    {
      itemId: MEDICINE_ITEMS.POTION.id,
      baseDropRate: 0.1,
      rarity: "common",
      minSkillLevel: 0,
      quantity: [1, 2],
    },
    {
      itemId: DRINK_ITEMS.MINERAL_WATER.id,
      baseDropRate: 0.12,
      rarity: "rare",
      minSkillLevel: 2,
      quantity: [1, 1],
    },
    {
      itemId: EQUIPMENT_ITEMS.LUCKY_CHARM.id,
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
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      baseDropRate: 0.3,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 3],
    },
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      baseDropRate: 0.1,
      rarity: "epic",
      minSkillLevel: 5,
      quantity: [1, 1],
    },
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      baseDropRate: 0.25,
      rarity: "uncommon",
      minSkillLevel: 2,
      quantity: [1, 3],
    },
    {
      itemId: MEDICINE_ITEMS.SUPER_POTION.id,
      baseDropRate: 0.08,
      rarity: "rare",
      minSkillLevel: 3,
      quantity: [1, 1],
    },
    {
      itemId: FOOD_ITEMS.FEAST.id,
      baseDropRate: 0.03,
      rarity: "epic",
      minSkillLevel: 5,
      quantity: [1, 1],
    },
    {
      itemId: EQUIPMENT_ITEMS.HUNTERS_EYE.id,
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
