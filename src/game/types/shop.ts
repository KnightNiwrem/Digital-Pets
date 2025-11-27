/**
 * Shop types for merchant NPCs.
 */

/**
 * A single item listing in a shop.
 */
export interface ShopItem {
  /** Item definition ID */
  itemId: string;
  /** Buy price (cost to player) */
  buyPrice: number;
  /** Maximum quantity available per restock (-1 for unlimited) */
  stock: number;
}

/**
 * Shop inventory for a merchant NPC.
 */
export interface Shop {
  /** Unique shop identifier */
  id: string;
  /** Shop display name */
  name: string;
  /** Items available for purchase */
  items: ShopItem[];
  /** Sell price multiplier (0.0 to 1.0 of item's sellValue) */
  sellMultiplier: number;
}

/**
 * Result of a buy transaction.
 */
export interface BuyResult {
  success: boolean;
  message: string;
}

/**
 * Result of a sell transaction.
 */
export interface SellResult {
  success: boolean;
  message: string;
  /** Amount of coins received */
  coinsReceived?: number;
}
