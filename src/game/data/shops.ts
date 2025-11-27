/**
 * Shop data definitions for merchant NPCs.
 */

import type { Shop, ShopItem } from "@/game/types/shop";
import { CLEANING_ITEMS, DRINK_ITEMS, FOOD_ITEMS, TOY_ITEMS } from "./items";

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
 * All shops indexed by ID.
 */
export const shops: Record<string, Shop> = {
  [willowbrookShop.id]: willowbrookShop,
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
