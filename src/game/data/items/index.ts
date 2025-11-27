/**
 * Combined item database with lookup functions.
 */

import type {
  BattleItem,
  CleaningItem,
  DrinkItem,
  EquipmentItem,
  FoodItem,
  Item,
  MaterialItem,
  MedicineItem,
  ToyItem,
} from "@/game/types/item";
import { BATTLE_ITEMS, getBattleItemById } from "./battle";
import { CLEANING_ITEMS, getCleaningItemById } from "./cleaning";
import { DRINK_ITEMS, getDrinkItemById } from "./drinks";
import { EQUIPMENT_ITEMS, getEquipmentItemById } from "./equipment";
import { FOOD_ITEMS, getFoodItemById } from "./food";
import { getMaterialItemById, MATERIAL_ITEMS } from "./materials";
import { getMedicineItemById, MEDICINE_ITEMS } from "./medicine";
import { getToyItemById, TOY_ITEMS } from "./toys";

/**
 * All items in the game.
 */
export const ALL_ITEMS: readonly Item[] = [
  ...FOOD_ITEMS,
  ...DRINK_ITEMS,
  ...CLEANING_ITEMS,
  ...TOY_ITEMS,
  ...MEDICINE_ITEMS,
  ...BATTLE_ITEMS,
  ...EQUIPMENT_ITEMS,
  ...MATERIAL_ITEMS,
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

/**
 * Get all medicine items.
 */
export function getAllMedicineItems(): MedicineItem[] {
  return [...MEDICINE_ITEMS];
}

/**
 * Get all battle items.
 */
export function getAllBattleItems(): BattleItem[] {
  return [...BATTLE_ITEMS];
}

/**
 * Get all equipment items.
 */
export function getAllEquipmentItems(): EquipmentItem[] {
  return [...EQUIPMENT_ITEMS];
}

/**
 * Get all material items.
 */
export function getAllMaterialItems(): MaterialItem[] {
  return [...MATERIAL_ITEMS];
}

// Re-export individual lookup functions
export {
  getBattleItemById,
  getCleaningItemById,
  getDrinkItemById,
  getEquipmentItemById,
  getFoodItemById,
  getMaterialItemById,
  getMedicineItemById,
  getToyItemById,
};

// Re-export item arrays
export {
  BATTLE_ITEMS,
  CLEANING_ITEMS,
  DRINK_ITEMS,
  EQUIPMENT_ITEMS,
  FOOD_ITEMS,
  MATERIAL_ITEMS,
  MEDICINE_ITEMS,
  TOY_ITEMS,
};
