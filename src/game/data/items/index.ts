/**
 * Combined item database with lookup functions.
 */

import type {
  CleaningItem,
  DrinkItem,
  FoodItem,
  Item,
  ToyItem,
} from "@/game/types/item";
import { CLEANING_ITEMS, getCleaningItemById } from "./cleaning";
import { DRINK_ITEMS, getDrinkItemById } from "./drinks";
import { FOOD_ITEMS, getFoodItemById } from "./food";
import { getToyItemById, TOY_ITEMS } from "./toys";

/**
 * All items in the game.
 */
export const ALL_ITEMS: readonly Item[] = [
  ...FOOD_ITEMS,
  ...DRINK_ITEMS,
  ...CLEANING_ITEMS,
  ...TOY_ITEMS,
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

/**
 * Get all cleaning items.
 */
export function getAllCleaningItems(): CleaningItem[] {
  return [...CLEANING_ITEMS];
}

/**
 * Get all toy items.
 */
export function getAllToyItems(): ToyItem[] {
  return [...TOY_ITEMS];
}

// Re-export individual lookup functions
export {
  getCleaningItemById,
  getDrinkItemById,
  getFoodItemById,
  getToyItemById,
};

// Re-export item arrays
export { CLEANING_ITEMS, DRINK_ITEMS, FOOD_ITEMS, TOY_ITEMS };
