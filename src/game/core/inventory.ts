/**
 * Core inventory management functions.
 */

import { getItemById } from "@/game/data/items";
import type { Inventory, InventoryItem } from "@/game/types/gameState";

/**
 * Find an inventory item by item ID.
 * For stackable items, returns the first matching stack.
 * For durability items, returns the first matching item.
 */
export function findInventoryItem(
  inventory: Inventory,
  itemId: string,
): InventoryItem | undefined {
  return inventory.items.find((item) => item.itemId === itemId);
}

/**
 * Find the index of an inventory item by item ID.
 */
export function findInventoryItemIndex(
  inventory: Inventory,
  itemId: string,
): number {
  return inventory.items.findIndex((item) => item.itemId === itemId);
}

/**
 * Get the total quantity of an item in the inventory.
 * For stackable items, returns the quantity.
 * For durability items, counts all instances.
 */
export function getItemQuantity(inventory: Inventory, itemId: string): number {
  return inventory.items
    .filter((item) => item.itemId === itemId)
    .reduce((total, item) => total + item.quantity, 0);
}

/**
 * Check if player has at least the specified quantity of an item.
 */
export function hasItem(
  inventory: Inventory,
  itemId: string,
  quantity = 1,
): boolean {
  return getItemQuantity(inventory, itemId) >= quantity;
}

/**
 * Add items to inventory.
 * Returns a new inventory object with the items added.
 */
export function addItem(
  inventory: Inventory,
  itemId: string,
  quantity = 1,
  currentDurability: number | null = null,
): Inventory {
  const itemDef = getItemById(itemId);
  if (!itemDef) {
    console.warn(`Attempted to add unknown item: ${itemId}`);
    return inventory;
  }

  const newItems = [...inventory.items];

  if (itemDef.stackable) {
    // For stackable items, find existing stack or create new one
    const existingIndex = newItems.findIndex((item) => item.itemId === itemId);

    if (existingIndex >= 0) {
      const existing = newItems[existingIndex];
      if (existing) {
        const newQuantity = Math.min(
          existing.quantity + quantity,
          itemDef.maxStack,
        );
        newItems[existingIndex] = {
          ...existing,
          quantity: newQuantity,
        };
      }
    } else {
      newItems.push({
        itemId,
        quantity: Math.min(quantity, itemDef.maxStack),
        currentDurability: null,
      });
    }
  } else {
    // For non-stackable items (durability-based), add each separately
    for (let i = 0; i < quantity; i++) {
      newItems.push({
        itemId,
        quantity: 1,
        currentDurability:
          currentDurability ??
          ("maxDurability" in itemDef ? itemDef.maxDurability : null),
      });
    }
  }

  return { items: newItems };
}

/**
 * Remove items from inventory.
 * Returns a new inventory object with the items removed.
 * Returns the original inventory if not enough items.
 */
export function removeItem(
  inventory: Inventory,
  itemId: string,
  quantity = 1,
): Inventory {
  if (!hasItem(inventory, itemId, quantity)) {
    return inventory;
  }

  const newItems = [...inventory.items];
  let remainingToRemove = quantity;

  for (let i = newItems.length - 1; i >= 0 && remainingToRemove > 0; i--) {
    const item = newItems[i];
    if (item?.itemId === itemId) {
      if (item.quantity <= remainingToRemove) {
        remainingToRemove -= item.quantity;
        newItems.splice(i, 1);
      } else {
        newItems[i] = {
          ...item,
          quantity: item.quantity - remainingToRemove,
        };
        remainingToRemove = 0;
      }
    }
  }

  return { items: newItems };
}

/**
 * Get all inventory items of a specific category.
 */
export function getInventoryItemsByCategory(
  inventory: Inventory,
  category: string,
): InventoryItem[] {
  return inventory.items.filter((invItem) => {
    const itemDef = getItemById(invItem.itemId);
    return itemDef?.category === category;
  });
}
