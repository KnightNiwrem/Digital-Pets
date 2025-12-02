/**
 * Cleaning item definitions that remove poop.
 */

import { ItemCategory, Rarity } from "@/game/types/constants";
import type { CleaningItem } from "@/game/types/item";
import { MAX_STACK_BY_RARITY } from "./constants";

/**
 * Cleaning items for removing poop.
 *
 * Use CLEANING_ITEMS.TISSUE.id to get the item ID "cleaning_tissue".
 */
export const CLEANING_ITEMS = {
  TISSUE: {
    id: "cleaning_tissue",
    name: "Tissue Pack",
    description: "Basic disposable tissues. Removes a small amount of poop.",
    category: ItemCategory.Cleaning,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 3,
    icon: "🧻",
    poopRemoved: 1,
  },
  WIPES: {
    id: "cleaning_wipes",
    name: "Wet Wipes",
    description: "Moist cleaning wipes. More effective than tissues.",
    category: ItemCategory.Cleaning,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 8,
    icon: "🧴",
    poopRemoved: 2,
  },
  SPONGE: {
    id: "cleaning_sponge",
    name: "Cleaning Sponge",
    description: "A sturdy sponge for thorough cleaning.",
    category: ItemCategory.Cleaning,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare,
    sellValue: 15,
    icon: "🧽",
    poopRemoved: 3,
  },
  VACUUM: {
    id: "cleaning_vacuum",
    name: "Mini Vacuum",
    description: "A portable vacuum cleaner. Cleans up large messes quickly!",
    category: ItemCategory.Cleaning,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.epic + 5,
    sellValue: 50,
    icon: "🔌",
    poopRemoved: 5,
  },
  BRUSH: {
    id: "cleaning_brush",
    name: "Cleaning Brush",
    description: "A sturdy brush for scrubbing away messes.",
    category: ItemCategory.Cleaning,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare,
    sellValue: 12,
    icon: "🧹",
    poopRemoved: 2,
  },
  SPRAY: {
    id: "cleaning_spray",
    name: "Cleaning Spray",
    description: "A powerful cleaning spray. Very effective!",
    category: ItemCategory.Cleaning,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare,
    sellValue: 35,
    icon: "🧴",
    poopRemoved: 4,
  },
} as const satisfies Record<string, CleaningItem>;

/** Array of all cleaning items for iteration. */
export const CLEANING_ITEMS_LIST: readonly CleaningItem[] =
  Object.values(CLEANING_ITEMS);
