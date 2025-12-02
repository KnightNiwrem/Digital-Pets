/**
 * Food item definitions that restore Satiety.
 */

import { toMicro } from "@/game/types/common";
import { ItemCategory, Rarity } from "@/game/types/constants";
import type { FoodItem } from "@/game/types/item";
import { MAX_STACK_BY_RARITY, POOP_ACCELERATION } from "./constants";

/**
 * Basic food items available from the start.
 *
 * Poop acceleration is measured in micro-units (applied directly to the poop timer).
 * With POOP_MICRO_THRESHOLD = 960, divide by 2 to get equivalent ticks when awake.
 * This implementation extends the spec: different foods have varying acceleration effects
 * allowing for more strategic food choices.
 *
 * Use FOOD_ITEMS.KIBBLE.id to get the item ID "food_kibble".
 */
export const FOOD_ITEMS = {
  KIBBLE: {
    id: "food_kibble",
    name: "Kibble",
    description: "Basic pet food. Filling but not very exciting.",
    category: ItemCategory.Food,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 5,
    icon: "🥣",
    satietyRestore: toMicro(15),
    poopAcceleration: POOP_ACCELERATION.LIGHT,
  },
  APPLE: {
    id: "food_apple",
    name: "Apple",
    description: "A crisp, fresh apple. Healthy and tasty!",
    category: ItemCategory.Food,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 8,
    icon: "🍎",
    satietyRestore: toMicro(20),
    poopAcceleration: POOP_ACCELERATION.STANDARD,
  },
  MEAT: {
    id: "food_meat",
    name: "Cooked Meat",
    description: "Savory cooked meat. Very satisfying!",
    category: ItemCategory.Food,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 15,
    icon: "🍖",
    satietyRestore: toMicro(35),
    poopAcceleration: POOP_ACCELERATION.HEAVY,
  },
  FISH: {
    id: "food_fish",
    name: "Grilled Fish",
    description: "Delicious grilled fish. A protein-rich meal.",
    category: ItemCategory.Food,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 18,
    icon: "🐟",
    satietyRestore: toMicro(30),
    poopAcceleration: POOP_ACCELERATION.STANDARD,
  },
  CAKE: {
    id: "food_cake",
    name: "Cake Slice",
    description: "A sweet treat! Very filling but a bit indulgent.",
    category: ItemCategory.Food,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare,
    sellValue: 25,
    icon: "🍰",
    satietyRestore: toMicro(50),
    poopAcceleration: POOP_ACCELERATION.INDULGENT,
  },
  BERRIES: {
    id: "food_berries",
    name: "Mixed Berries",
    description: "A handful of fresh forest berries. Light and nutritious.",
    category: ItemCategory.Food,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 6,
    icon: "🫐",
    satietyRestore: toMicro(12),
    poopAcceleration: POOP_ACCELERATION.VERY_LIGHT,
  },
  MUSHROOM: {
    id: "food_mushroom",
    name: "Forest Mushroom",
    description: "An earthy mushroom from the woods. Surprisingly filling.",
    category: ItemCategory.Food,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 12,
    icon: "🍄",
    satietyRestore: toMicro(25),
    poopAcceleration: POOP_ACCELERATION.LIGHT_MEDIUM,
  },
  STEAK: {
    id: "food_steak",
    name: "Premium Steak",
    description: "A perfectly cooked premium steak. Exquisite!",
    category: ItemCategory.Food,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare,
    sellValue: 40,
    icon: "🥩",
    satietyRestore: toMicro(60),
    poopAcceleration: POOP_ACCELERATION.VERY_HEAVY,
  },
  HONEY: {
    id: "food_honey",
    name: "Wild Honey",
    description: "Sweet golden honey harvested from wild bees.",
    category: ItemCategory.Food,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 20,
    icon: "🍯",
    satietyRestore: toMicro(18),
    poopAcceleration: POOP_ACCELERATION.LIGHT,
  },
  FEAST: {
    id: "food_feast",
    name: "Grand Feast",
    description:
      "A legendary meal fit for royalty. Completely satisfies hunger.",
    category: ItemCategory.Food,
    rarity: Rarity.Epic,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.epic,
    sellValue: 100,
    icon: "🍱",
    satietyRestore: toMicro(100),
    poopAcceleration: POOP_ACCELERATION.MASSIVE,
  },
} as const satisfies Record<string, FoodItem>;

/** Array of all food items for iteration. */
export const FOOD_ITEMS_LIST: readonly FoodItem[] = Object.values(FOOD_ITEMS);
