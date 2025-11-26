/**
 * Cleaning item definitions that remove poop.
 */

import type { CleaningItem } from "@/game/types/item";

/**
 * Cleaning items for removing poop.
 */
export const CLEANING_ITEMS: readonly CleaningItem[] = [
  {
    id: "cleaning_tissue",
    name: "Tissue Pack",
    description: "Basic disposable tissues. Removes a small amount of poop.",
    category: "cleaning",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 3,
    icon: "🧻",
    poopRemoved: 1,
  },
  {
    id: "cleaning_wipes",
    name: "Wet Wipes",
    description: "Moist cleaning wipes. More effective than tissues.",
    category: "cleaning",
    rarity: "common",
    stackable: true,
    maxStack: 50,
    sellValue: 8,
    icon: "🧴",
    poopRemoved: 2,
  },
  {
    id: "cleaning_sponge",
    name: "Cleaning Sponge",
    description: "A sturdy sponge for thorough cleaning.",
    category: "cleaning",
    rarity: "uncommon",
    stackable: true,
    maxStack: 30,
    sellValue: 15,
    icon: "🧽",
    poopRemoved: 3,
  },
  {
    id: "cleaning_vacuum",
    name: "Mini Vacuum",
    description: "A portable vacuum cleaner. Cleans up large messes quickly!",
    category: "cleaning",
    rarity: "rare",
    stackable: true,
    maxStack: 10,
    sellValue: 50,
    icon: "🔌",
    poopRemoved: 5,
  },
] as const;

/**
 * Get a cleaning item by ID.
 */
export function getCleaningItemById(id: string): CleaningItem | undefined {
  return CLEANING_ITEMS.find((item) => item.id === id);
}
