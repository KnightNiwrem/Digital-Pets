/**
 * Item type definitions for consumable and usable items.
 */

import type { MicroValue } from "./common";
import type { ItemCategory, Rarity } from "./constants";

/**
 * Base properties shared by all items.
 */
export interface BaseItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Item description */
  description: string;
  /** Item category */
  category: ItemCategory;
  /** Rarity tier */
  rarity: Rarity;
  /** Whether item stacks */
  stackable: boolean;
  /** Maximum stack size (if stackable) */
  maxStack: number;
  /** Currency when sold */
  sellValue: number;
  /** Emoji icon for display */
  icon: string;
}

/**
 * Food item that restores Satiety.
 */
export interface FoodItem extends BaseItem {
  category: "food";
  /** Micro-satiety restored on use */
  satietyRestore: MicroValue;
  /** Ticks reduced from next poop timer (optional) */
  poopAcceleration?: number;
}

/**
 * Drink item that restores Hydration.
 */
export interface DrinkItem extends BaseItem {
  category: "drink";
  /** Micro-hydration restored on use */
  hydrationRestore: MicroValue;
  /** Micro-energy restored on use (optional) */
  energyRestore?: MicroValue;
}

/**
 * Toy item that restores Happiness with durability.
 */
export interface ToyItem extends BaseItem {
  category: "toy";
  stackable: false;
  /** Micro-happiness restored per use */
  happinessRestore: MicroValue;
  /** Total uses before destroyed */
  maxDurability: number;
}

/**
 * Cleaning item that removes poop.
 */
export interface CleaningItem extends BaseItem {
  category: "cleaning";
  /** Amount of poop removed per use */
  poopRemoved: number;
}

/**
 * Medicine item that heals HP or cures status effects.
 */
export interface MedicineItem extends BaseItem {
  category: "medicine";
  /** HP restored (if healing) */
  healAmount?: number;
  /** Status effects cured (array of status IDs) */
  cureStatus?: string[];
}

/**
 * Battle consumable that provides temporary combat buffs.
 */
export interface BattleItem extends BaseItem {
  category: "battle";
  /** Which stat is affected */
  statModifier: string;
  /** Percentage bonus (e.g., 10 for +10%) */
  modifierValue: number;
  /** Number of turns the effect lasts */
  duration: number;
}

/**
 * Equipment slot types.
 */
export type EquipmentSlot = "accessory" | "charm";

/**
 * Equipment item that provides passive bonuses.
 */
export interface EquipmentItem extends BaseItem {
  category: "equipment";
  stackable: false;
  /** Equipment slot */
  slot: EquipmentSlot;
  /** Effect description */
  effect: string;
  /** Stat bonuses provided */
  statBonuses: Partial<Record<string, number>>;
  /** Maximum durability */
  maxDurability: number;
  /** What activity degrades durability */
  degradeActivity: "battle" | "exploration" | "training";
}

/**
 * Material item for crafting.
 */
export interface MaterialItem extends BaseItem {
  category: "material";
  /** Crafting tags for recipe matching */
  craftingTags: string[];
}

/**
 * Union of all consumable item types for care.
 */
export type CareItem = FoodItem | DrinkItem | ToyItem | CleaningItem;

/**
 * Union of all item types.
 */
export type Item =
  | CareItem
  | MedicineItem
  | BattleItem
  | EquipmentItem
  | MaterialItem;

/**
 * Type guard for food items.
 */
export function isFoodItem(item: Item): item is FoodItem {
  return item.category === "food";
}

/**
 * Type guard for drink items.
 */
export function isDrinkItem(item: Item): item is DrinkItem {
  return item.category === "drink";
}

/**
 * Type guard for toy items.
 */
export function isToyItem(item: Item): item is ToyItem {
  return item.category === "toy";
}

/**
 * Type guard for cleaning items.
 */
export function isCleaningItem(item: Item): item is CleaningItem {
  return item.category === "cleaning";
}

/**
 * Type guard for medicine items.
 */
export function isMedicineItem(item: Item): item is MedicineItem {
  return item.category === "medicine";
}

/**
 * Type guard for battle items.
 */
export function isBattleItem(item: Item): item is BattleItem {
  return item.category === "battle";
}

/**
 * Type guard for equipment items.
 */
export function isEquipmentItem(item: Item): item is EquipmentItem {
  return item.category === "equipment";
}

/**
 * Type guard for material items.
 */
export function isMaterialItem(item: Item): item is MaterialItem {
  return item.category === "material";
}
