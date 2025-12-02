/**
 * Combined item database with lookup functions.
 */

import type { Item } from "@/game/types/item";
import { BATTLE_ITEMS, BATTLE_ITEMS_LIST } from "./battle";
import { CLEANING_ITEMS, CLEANING_ITEMS_LIST } from "./cleaning";
import { MAX_STACK_BY_RARITY, POOP_ACCELERATION } from "./constants";
import { DRINK_ITEMS, DRINK_ITEMS_LIST } from "./drinks";
import { EQUIPMENT_ITEMS, EQUIPMENT_ITEMS_LIST } from "./equipment";
import { FOOD_ITEMS, FOOD_ITEMS_LIST } from "./food";
import { MATERIAL_ITEMS, MATERIAL_ITEMS_LIST } from "./materials";
import { MEDICINE_ITEMS, MEDICINE_ITEMS_LIST } from "./medicine";
import { TOY_ITEMS, TOY_ITEMS_LIST } from "./toys";

/**
 * All items in the game.
 */
export const ALL_ITEMS: readonly Item[] = [
  ...FOOD_ITEMS_LIST,
  ...DRINK_ITEMS_LIST,
  ...CLEANING_ITEMS_LIST,
  ...TOY_ITEMS_LIST,
  ...MEDICINE_ITEMS_LIST,
  ...BATTLE_ITEMS_LIST,
  ...EQUIPMENT_ITEMS_LIST,
  ...MATERIAL_ITEMS_LIST,
] as const;

/**
 * Get any item by ID.
 */
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}

// Re-export item objects (enum-like access via FOOD_ITEMS.KIBBLE.id)
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

// Re-export item constants (used by food.ts for rarity-based stacks and poop acceleration)
export { MAX_STACK_BY_RARITY, POOP_ACCELERATION };

// Re-export item arrays for iteration
export {
  BATTLE_ITEMS_LIST,
  CLEANING_ITEMS_LIST,
  DRINK_ITEMS_LIST,
  EQUIPMENT_ITEMS_LIST,
  FOOD_ITEMS_LIST,
  MATERIAL_ITEMS_LIST,
  MEDICINE_ITEMS_LIST,
  TOY_ITEMS_LIST,
};
