/**
 * Shop transaction logic for buying and selling items.
 */

import { addItem, hasItem, removeItem } from "@/game/core/inventory";
import { getItemById } from "@/game/data/items";
import { getShop } from "@/game/data/shops";
import type { GameState } from "@/game/types/gameState";
import type { BuyResult, SellResult, Shop, ShopItem } from "@/game/types/shop";

/**
 * Check if player can afford to buy an item.
 */
export function canAfford(state: GameState, price: number): boolean {
  return state.player.currency.coins >= price;
}

/**
 * Get the shop item entry for a specific item in a shop.
 */
export function getShopItem(shop: Shop, itemId: string): ShopItem | undefined {
  return shop.items.find((item) => item.itemId === itemId);
}

/**
 * Calculate the sell price for an item based on shop's sell multiplier.
 */
export function calculateSellPrice(shopId: string, itemId: string): number {
  const shop = getShop(shopId);
  const itemDef = getItemById(itemId);

  if (!shop || !itemDef) return 0;

  return Math.floor(itemDef.sellValue * shop.sellMultiplier);
}

/**
 * Validate and normalize quantity for transactions.
 * Returns null if quantity is invalid, otherwise returns the normalized quantity.
 */
function normalizeQuantity(quantity: number): number | null {
  const normalized = Math.floor(quantity);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }
  return normalized;
}

/**
 * Buy an item from a shop.
 * Returns a result with the updated state or an error message.
 */
export function buyItem(
  state: GameState,
  shopId: string,
  itemId: string,
  quantity = 1,
): { result: BuyResult; state: GameState } {
  const normalizedQuantity = normalizeQuantity(quantity);
  if (normalizedQuantity === null) {
    return {
      result: { success: false, message: "Quantity must be at least 1." },
      state,
    };
  }

  const shop = getShop(shopId);
  if (!shop) {
    return {
      result: { success: false, message: "Shop not found." },
      state,
    };
  }

  const shopItem = getShopItem(shop, itemId);
  if (!shopItem) {
    return {
      result: { success: false, message: "Item not available in this shop." },
      state,
    };
  }

  const itemDef = getItemById(itemId);
  if (!itemDef) {
    return {
      result: { success: false, message: "Item not found." },
      state,
    };
  }

  const totalCost = shopItem.buyPrice * normalizedQuantity;

  if (!canAfford(state, totalCost)) {
    return {
      result: {
        success: false,
        message: `Not enough coins. Need ${totalCost} coins.`,
      },
      state,
    };
  }

  // Deduct coins and add item
  const newInventory = addItem(
    state.player.inventory,
    itemId,
    normalizedQuantity,
  );
  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
      currency: {
        ...state.player.currency,
        coins: state.player.currency.coins - totalCost,
      },
    },
  };

  return {
    result: {
      success: true,
      message: `Purchased ${normalizedQuantity}x ${itemDef.name} for ${totalCost} coins.`,
    },
    state: newState,
  };
}

/**
 * Sell an item to a shop.
 * Returns a result with the updated state or an error message.
 */
export function sellItem(
  state: GameState,
  shopId: string,
  itemId: string,
  quantity = 1,
): { result: SellResult; state: GameState } {
  const normalizedQuantity = normalizeQuantity(quantity);
  if (normalizedQuantity === null) {
    return {
      result: { success: false, message: "Quantity must be at least 1." },
      state,
    };
  }

  const shop = getShop(shopId);
  if (!shop) {
    return {
      result: { success: false, message: "Shop not found." },
      state,
    };
  }

  const itemDef = getItemById(itemId);
  if (!itemDef) {
    return {
      result: { success: false, message: "Item not found." },
      state,
    };
  }

  if (!hasItem(state.player.inventory, itemId, normalizedQuantity)) {
    return {
      result: { success: false, message: "Not enough items to sell." },
      state,
    };
  }

  const sellPrice = calculateSellPrice(shopId, itemId);
  const totalEarned = sellPrice * normalizedQuantity;

  if (totalEarned === 0) {
    return {
      result: { success: false, message: "This item cannot be sold." },
      state,
    };
  }

  // Remove item and add coins
  const newInventory = removeItem(
    state.player.inventory,
    itemId,
    normalizedQuantity,
  );
  const newState: GameState = {
    ...state,
    player: {
      ...state.player,
      inventory: newInventory,
      currency: {
        ...state.player.currency,
        coins: state.player.currency.coins + totalEarned,
      },
    },
  };

  return {
    result: {
      success: true,
      message: `Sold ${normalizedQuantity}x ${itemDef.name} for ${totalEarned} coins.`,
      coinsReceived: totalEarned,
    },
    state: newState,
  };
}
