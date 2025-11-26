/**
 * Combined item database with lookup functions.
 */

import type { DrinkItem, FoodItem, Item } from "@/game/types/item";
import { DRINK_ITEMS, getDrinkItemById } from "./drinks";
import { FOOD_ITEMS, getFoodItemById } from "./food";

/**
 * All items in the game.
 */
export const ALL_ITEMS: readonly Item[] = [
  ...FOOD_ITEMS,
  ...DRINK_ITEMS,
] as const;

/**
 * Get any item by ID.
 */
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}

/**
 * Get items by category.
 */
export function getItemsByCategory<T extends Item>(
  category: T["category"],
): T[] {
  return ALL_ITEMS.filter((item) => item.category === category) as T[];
}

/**
 * Get all food items.
 */
export function getAllFoodItems(): FoodItem[] {
  return [...FOOD_ITEMS];
}

/**
 * Get all drink items.
 */
export function getAllDrinkItems(): DrinkItem[] {
  return [...DRINK_ITEMS];
}

// Re-export individual lookup functions
export { getDrinkItemById, getFoodItemById };

// Re-export item arrays
export { DRINK_ITEMS, FOOD_ITEMS };
