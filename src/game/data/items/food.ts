/**
 * Food item definitions that restore Satiety.
 */

import { toMicro } from "@/game/types/common";
import type { FoodItem } from "@/game/types/item";

/**
 * Basic food items available from the start.
 */
export const FOOD_ITEMS: readonly FoodItem[] = [
  {
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
    poopAcceleration: 0,
  },
  {
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
    poopAcceleration: 1,
  },
  {
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
    poopAcceleration: 2,
  },
  {
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
    poopAcceleration: 1,
  },
  {
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
    poopAcceleration: 3,
  },
] as const;

/**
 * Get a food item by ID.
 */
export function getFoodItemById(id: string): FoodItem | undefined {
  return FOOD_ITEMS.find((item) => item.id === id);
}
