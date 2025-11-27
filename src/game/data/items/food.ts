/**
 * Food item definitions that restore Satiety.
 */

import { toMicro } from "@/game/types/common";
import type { FoodItem } from "@/game/types/item";

/**
 * Basic food items available from the start.
 *
 * Poop acceleration is measured in ticks.
 * This implementation extends the spec: different foods have varying acceleration effects
 * (30-120 ticks) rather than a uniform 60 ticks, allowing for more strategic food choices.
 *
 * Use FOOD_ITEMS.KIBBLE.id to get the item ID "food_kibble".
 */
export const FOOD_ITEMS = {
  KIBBLE: {
    id: "food_kibble",
    name: "Kibble",
    description: "Basic pet food. Filling but not very exciting.",
    category: "food",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    icon: "🥣",
    satietyRestore: toMicro(15),
    poopAcceleration: 30, // Light meal: 15 minutes
  },
  APPLE: {
    id: "food_apple",
    name: "Apple",
    description: "A crisp, fresh apple. Healthy and tasty!",
    category: "food",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 8,
    icon: "🍎",
    satietyRestore: toMicro(20),
    poopAcceleration: 60, // Standard meal: 30 minutes
  },
  MEAT: {
    id: "food_meat",
    name: "Cooked Meat",
    description: "Savory cooked meat. Very satisfying!",
    category: "food",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 15,
    icon: "🍖",
    satietyRestore: toMicro(35),
    poopAcceleration: 90, // Heavy meal: 45 minutes
  },
  FISH: {
    id: "food_fish",
    name: "Grilled Fish",
    description: "Delicious grilled fish. A protein-rich meal.",
    category: "food",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 18,
    icon: "🐟",
    satietyRestore: toMicro(30),
    poopAcceleration: 60, // Standard meal: 30 minutes
  },
  CAKE: {
    id: "food_cake",
    name: "Cake Slice",
    description: "A sweet treat! Very filling but a bit indulgent.",
    category: "food",
    rarity: "rare",
    stackable: true,
    maxStack: 20,
    sellValue: 25,
    icon: "🍰",
    satietyRestore: toMicro(50),
    poopAcceleration: 120, // Indulgent meal: 60 minutes
  },
  BERRIES: {
    id: "food_berries",
    name: "Mixed Berries",
    description: "A handful of fresh forest berries. Light and nutritious.",
    category: "food",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 6,
    icon: "🫐",
    satietyRestore: toMicro(12),
    poopAcceleration: 20, // Very light: 10 minutes
  },
  MUSHROOM: {
    id: "food_mushroom",
    name: "Forest Mushroom",
    description: "An earthy mushroom from the woods. Surprisingly filling.",
    category: "food",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 12,
    icon: "🍄",
    satietyRestore: toMicro(25),
    poopAcceleration: 45, // Light meal: 22.5 minutes
  },
  STEAK: {
    id: "food_steak",
    name: "Premium Steak",
    description: "A perfectly cooked premium steak. Exquisite!",
    category: "food",
    rarity: "rare",
    stackable: true,
    maxStack: 20,
    sellValue: 40,
    icon: "🥩",
    satietyRestore: toMicro(60),
    poopAcceleration: 100, // Heavy meal: 50 minutes
  },
  HONEY: {
    id: "food_honey",
    name: "Wild Honey",
    description: "Sweet golden honey harvested from wild bees.",
    category: "food",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 20,
    icon: "🍯",
    satietyRestore: toMicro(18),
    poopAcceleration: 30, // Light: 15 minutes
  },
  FEAST: {
    id: "food_feast",
    name: "Grand Feast",
    description:
      "A legendary meal fit for royalty. Completely satisfies hunger.",
    category: "food",
    rarity: "epic",
    stackable: true,
    maxStack: 5,
    sellValue: 100,
    icon: "🍱",
    satietyRestore: toMicro(100),
    poopAcceleration: 180, // Massive meal: 90 minutes
  },
} as const satisfies Record<string, FoodItem>;

/** Array of all food items for iteration. */
export const FOOD_ITEMS_LIST: readonly FoodItem[] = Object.values(FOOD_ITEMS);

/**
 * Get a food item by ID.
 */
export function getFoodItemById(id: string): FoodItem | undefined {
  return FOOD_ITEMS_LIST.find((item) => item.id === id);
}
