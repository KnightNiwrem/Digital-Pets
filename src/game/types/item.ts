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
 * Union of all consumable item types for care.
 */
export type CareItem = FoodItem | DrinkItem | ToyItem | CleaningItem;

/**
 * Union of all item types.
 */
export type Item = CareItem;

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
