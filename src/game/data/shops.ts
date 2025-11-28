/**
 * Shop data definitions for merchant NPCs.
 */

import type { Shop, ShopItem } from "@/game/types/shop";
import {
  CLEANING_ITEMS,
  DRINK_ITEMS,
  EQUIPMENT_ITEMS,
  FOOD_ITEMS,
  MATERIAL_ITEMS,
  MEDICINE_ITEMS,
  TOY_ITEMS,
} from "./items";

/**
 * Helper to create a shop item entry.
 */
function shopItem(itemId: string, buyPrice: number, stock = -1): ShopItem {
  return { itemId, buyPrice, stock };
}

/**
 * Willowbrook General Store - Mira's shop.
 * Sells basic care supplies at reasonable prices.
 */
export const willowbrookShop: Shop = {
  id: "willowbrook_shop",
  name: "Mira's General Store",
  sellMultiplier: 0.5,
  items: [
    // Food items
    shopItem(FOOD_ITEMS.KIBBLE.id, 10),
    shopItem(FOOD_ITEMS.APPLE.id, 15),
    shopItem(FOOD_ITEMS.MEAT.id, 30),
    shopItem(FOOD_ITEMS.FISH.id, 35),

    // Drink items
    shopItem(DRINK_ITEMS.WATER.id, 5),
    shopItem(DRINK_ITEMS.JUICE.id, 15),
    shopItem(DRINK_ITEMS.MILK.id, 20),
    shopItem(DRINK_ITEMS.TEA.id, 30),

    // Cleaning items
    shopItem(CLEANING_ITEMS.TISSUE.id, 5),
    shopItem(CLEANING_ITEMS.WIPES.id, 15),
    shopItem(CLEANING_ITEMS.SPONGE.id, 30),

    // Toys
    shopItem(TOY_ITEMS.BALL.id, 25),
    shopItem(TOY_ITEMS.ROPE.id, 35),
    shopItem(TOY_ITEMS.PLUSH.id, 60),
  ],
};

/**
 * Ironhaven Smithy - Grom's shop.
 * Sells equipment and crafting materials.
 */
export const ironhavenShop: Shop = {
  id: "ironhaven_shop",
  name: "Grom's Smithy",
  sellMultiplier: 0.6,
  items: [
    // Equipment
    shopItem(EQUIPMENT_ITEMS.IRON_BANGLE.id, 150),
    shopItem(EQUIPMENT_ITEMS.LUCKY_CHARM.id, 200),

    // Materials (buy back from players)
    shopItem(MATERIAL_ITEMS.IRON_ORE.id, 25),
    shopItem(MATERIAL_ITEMS.STONE.id, 10),
    shopItem(MATERIAL_ITEMS.CRYSTAL.id, 75),

    // Medicine
    shopItem(MEDICINE_ITEMS.POTION.id, 30),
    shopItem(MEDICINE_ITEMS.BANDAGE.id, 15),

    // Food for long mining trips
    shopItem(FOOD_ITEMS.STEAK.id, 80),
    shopItem(FOOD_ITEMS.MEAT.id, 35),
  ],
};

/**
 * Tidecrest Fish Market - Marina's shop.
 * Sells seafood and aquatic supplies.
 */
export const tidecrestShop: Shop = {
  id: "tidecrest_shop",
  name: "Marina's Fish Market",
  sellMultiplier: 0.55,
  items: [
    // Seafood
    shopItem(FOOD_ITEMS.FISH.id, 30),
    shopItem(DRINK_ITEMS.COCONUT.id, 25),

    // Drinks
    shopItem(DRINK_ITEMS.WATER.id, 5),
    shopItem(DRINK_ITEMS.JUICE.id, 15),
    shopItem(DRINK_ITEMS.SMOOTHIE.id, 45),

    // Beach toys
    shopItem(TOY_ITEMS.BALL.id, 25),
    shopItem(TOY_ITEMS.FRISBEE.id, 40),

    // Medicine for water activities
    shopItem(MEDICINE_ITEMS.ANTIDOTE.id, 35),
    shopItem(MEDICINE_ITEMS.POTION.id, 30),

    // Cleaning
    shopItem(CLEANING_ITEMS.WIPES.id, 15),
  ],
};

/**
 * Starfall Sanctuary Emporium - Echo's shop.
 * Sells rare and high-quality items.
 */
export const sanctuaryShop: Shop = {
  id: "sanctuary_shop",
  name: "Echo's Emporium",
  sellMultiplier: 0.7,
  items: [
    // High-tier equipment
    shopItem(EQUIPMENT_ITEMS.HUNTERS_EYE.id, 500),
    shopItem(EQUIPMENT_ITEMS.GUARDIANS_PENDANT.id, 400),
    shopItem(EQUIPMENT_ITEMS.LUCKY_CHARM.id, 180),

    // Premium food
    shopItem(FOOD_ITEMS.FEAST.id, 150),
    shopItem(FOOD_ITEMS.CAKE.id, 100),
    shopItem(FOOD_ITEMS.STEAK.id, 75),

    // Premium drinks
    shopItem(DRINK_ITEMS.MINERAL_WATER.id, 60),
    shopItem(DRINK_ITEMS.SMOOTHIE.id, 50),

    // Premium medicine
    shopItem(MEDICINE_ITEMS.SUPER_POTION.id, 80),
    shopItem(MEDICINE_ITEMS.ANTIDOTE.id, 40),

    // Rare materials
    shopItem(MATERIAL_ITEMS.ESSENCE.id, 200),
    shopItem(MATERIAL_ITEMS.CRYSTAL.id, 80),
  ],
};

/**
 * Fern's Traveling Remedies - Herbalist's mobile shop.
 * Sells healing items and herbs.
 */
export const fernTravelingShop: Shop = {
  id: "fern_traveling_shop",
  name: "Fern's Remedies",
  sellMultiplier: 0.5,
  items: [
    // Medicine
    shopItem(MEDICINE_ITEMS.POTION.id, 25),
    shopItem(MEDICINE_ITEMS.SUPER_POTION.id, 70),
    shopItem(MEDICINE_ITEMS.ANTIDOTE.id, 30),
    shopItem(MEDICINE_ITEMS.BANDAGE.id, 12),

    // Herbs and natural items
    shopItem(MATERIAL_ITEMS.HERB.id, 8),
    shopItem(FOOD_ITEMS.APPLE.id, 12),
    shopItem(FOOD_ITEMS.MUSHROOM.id, 20),
    shopItem(FOOD_ITEMS.HONEY.id, 45),

    // Drinks
    shopItem(DRINK_ITEMS.TEA.id, 28),
    shopItem(DRINK_ITEMS.JUICE.id, 15),
  ],
};

/**
 * Shadow Market - Gloom's mysterious shop.
 * Sells rare shadow materials and essence.
 */
export const shadowShop: Shop = {
  id: "shadow_shop",
  name: "Shadow Market",
  sellMultiplier: 0.65,
  items: [
    // Rare materials
    shopItem(MATERIAL_ITEMS.ESSENCE.id, 180),
    shopItem(MATERIAL_ITEMS.CRYSTAL.id, 70),
    shopItem(MATERIAL_ITEMS.MONSTER_FANG.id, 40),

    // Equipment
    shopItem(EQUIPMENT_ITEMS.HUNTERS_EYE.id, 450),

    // High-tier medicine
    shopItem(MEDICINE_ITEMS.SUPER_POTION.id, 75),
    shopItem(MEDICINE_ITEMS.ANTIDOTE.id, 35),

    // Premium food
    shopItem(FOOD_ITEMS.FEAST.id, 140),
    shopItem(FOOD_ITEMS.STEAK.id, 70),
  ],
};

/**
 * All shops indexed by ID.
 */
export const shops: Record<string, Shop> = {
  [willowbrookShop.id]: willowbrookShop,
  [ironhavenShop.id]: ironhavenShop,
  [tidecrestShop.id]: tidecrestShop,
  [sanctuaryShop.id]: sanctuaryShop,
  [fernTravelingShop.id]: fernTravelingShop,
  [shadowShop.id]: shadowShop,
};

/**
 * Get a shop by ID.
 */
export function getShop(shopId: string): Shop | undefined {
  return shops[shopId];
}

/**
 * Get the shop for a specific NPC (by their shopId).
 */
export function getShopForNpc(shopId: string | undefined): Shop | undefined {
  if (!shopId) return undefined;
  return shops[shopId];
}
