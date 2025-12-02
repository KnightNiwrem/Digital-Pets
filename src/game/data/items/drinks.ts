/**
 * Drink item definitions that restore Hydration.
 */

import { toMicro } from "@/game/types/common";
import { ItemCategory, Rarity } from "@/game/types/constants";
import type { DrinkItem } from "@/game/types/item";

/**
 * Basic drink items available from the start.
 *
 * Use DRINK_ITEMS.WATER.id to get the item ID "drink_water".
 */
export const DRINK_ITEMS = {
  WATER: {
    id: "drink_water",
    name: "Water",
    description: "Pure, refreshing water. Essential for life.",
    category: ItemCategory.Drink,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: 99,
    sellValue: 3,
    icon: "💧",
    hydrationRestore: toMicro(20),
  },
  JUICE: {
    id: "drink_juice",
    name: "Fruit Juice",
    description: "Sweet and refreshing fruit juice.",
    category: ItemCategory.Drink,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: 99,
    sellValue: 8,
    icon: "🧃",
    hydrationRestore: toMicro(25),
  },
  MILK: {
    id: "drink_milk",
    name: "Milk",
    description: "Creamy, nutritious milk. Good for growing pets!",
    category: ItemCategory.Drink,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: 50,
    sellValue: 10,
    icon: "🥛",
    hydrationRestore: toMicro(30),
  },
  TEA: {
    id: "drink_tea",
    name: "Herbal Tea",
    description: "A warm, soothing herbal tea. Calms the soul.",
    category: ItemCategory.Drink,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: 50,
    sellValue: 15,
    icon: "🍵",
    hydrationRestore: toMicro(35),
  },
  ENERGY: {
    id: "drink_energy",
    name: "Energy Drink",
    description: "A powerful energy drink. Hydrates and energizes!",
    category: ItemCategory.Drink,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: 20,
    sellValue: 30,
    icon: "⚡",
    hydrationRestore: toMicro(25),
    energyRestore: toMicro(20),
  },
  COCONUT: {
    id: "drink_coconut",
    name: "Coconut Water",
    description: "Refreshing natural coconut water. Full of electrolytes.",
    category: ItemCategory.Drink,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: 50,
    sellValue: 12,
    icon: "🥥",
    hydrationRestore: toMicro(28),
  },
  SMOOTHIE: {
    id: "drink_smoothie",
    name: "Berry Smoothie",
    description: "A thick, creamy smoothie packed with berries.",
    category: ItemCategory.Drink,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: 30,
    sellValue: 20,
    icon: "🍹",
    hydrationRestore: toMicro(40),
  },
  MINERAL_WATER: {
    id: "drink_mineral_water",
    name: "Mineral Water",
    description: "Pure spring water rich in minerals. Extra refreshing!",
    category: ItemCategory.Drink,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: 30,
    sellValue: 25,
    icon: "💦",
    hydrationRestore: toMicro(45),
  },
  NECTAR: {
    id: "drink_nectar",
    name: "Flower Nectar",
    description:
      "Sweet nectar collected from rare flowers. Hydrates and restores energy.",
    category: ItemCategory.Drink,
    rarity: Rarity.Epic,
    stackable: true,
    maxStack: 10,
    sellValue: 60,
    icon: "🌸",
    hydrationRestore: toMicro(50),
    energyRestore: toMicro(30),
  },
} as const satisfies Record<string, DrinkItem>;

/** Array of all drink items for iteration. */
export const DRINK_ITEMS_LIST: readonly DrinkItem[] =
  Object.values(DRINK_ITEMS);
