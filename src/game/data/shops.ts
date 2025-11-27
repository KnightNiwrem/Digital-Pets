/**
 * Shop data definitions for merchant NPCs.
 */

import type { Shop, ShopItem } from "@/game/types/shop";

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
    shopItem("food_kibble", 10),
    shopItem("food_apple", 15),
    shopItem("food_meat", 30),
    shopItem("food_fish", 35),

    // Drink items
    shopItem("drink_water", 5),
    shopItem("drink_juice", 15),
    shopItem("drink_milk", 20),
    shopItem("drink_tea", 30),

    // Cleaning items
    shopItem("cleaning_tissue", 5),
    shopItem("cleaning_wipes", 15),
    shopItem("cleaning_sponge", 30),

    // Toys
    shopItem("toy_ball", 25),
    shopItem("toy_rope", 35),
    shopItem("toy_plush", 60),
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
