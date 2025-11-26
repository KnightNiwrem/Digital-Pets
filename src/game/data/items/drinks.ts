/**
 * Drink item definitions that restore Hydration.
 */

import { toMicro } from "@/game/types/common";
import type { DrinkItem } from "@/game/types/item";

/**
 * Basic drink items available from the start.
 */
export const DRINK_ITEMS: readonly DrinkItem[] = [
  {
    id: "drink_water",
    name: "Water",
    description: "Pure, refreshing water. Essential for life.",
    category: "drink",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 3,
    icon: "💧",
    hydrationRestore: toMicro(20),
  },
  {
    id: "drink_juice",
    name: "Fruit Juice",
    description: "Sweet and refreshing fruit juice.",
    category: "drink",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 8,
    icon: "🧃",
    hydrationRestore: toMicro(25),
  },
  {
    id: "drink_milk",
    name: "Milk",
    description: "Creamy, nutritious milk. Good for growing pets!",
    category: "drink",
    rarity: "common",
    stackable: true,
    maxStack: 50,
    sellValue: 10,
    icon: "🥛",
    hydrationRestore: toMicro(30),
  },
  {
    id: "drink_tea",
    name: "Herbal Tea",
    description: "A warm, soothing herbal tea. Calms the soul.",
    category: "drink",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 15,
    icon: "🍵",
    hydrationRestore: toMicro(35),
  },
  {
    id: "drink_energy",
    name: "Energy Drink",
    description: "A powerful energy drink. Hydrates and energizes!",
    category: "drink",
    rarity: "rare",
    stackable: true,
    maxStack: 20,
    sellValue: 30,
    icon: "⚡",
    hydrationRestore: toMicro(25),
    energyRestore: toMicro(20),
  },
] as const;

/**
 * Get a drink item by ID.
 */
export function getDrinkItemById(id: string): DrinkItem | undefined {
  return DRINK_ITEMS.find((item) => item.id === id);
}
