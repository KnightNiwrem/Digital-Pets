/**
 * Tests for inventory management functions.
 */

import { expect, test } from "bun:test";
import type { Inventory } from "@/game/types/gameState";
import {
  addItem,
  findInventoryItem,
  getItemQuantity,
  hasItem,
  removeItem,
} from "./inventory";

function createEmptyInventory(): Inventory {
  return { items: [] };
}

function createInventoryWithItems(): Inventory {
  return {
    items: [
      { itemId: "food_kibble", quantity: 5, currentDurability: null },
      { itemId: "drink_water", quantity: 10, currentDurability: null },
    ],
  };
}

test("findInventoryItem finds existing item", () => {
  const inventory = createInventoryWithItems();
  const item = findInventoryItem(inventory, "food_kibble");
  expect(item).toBeDefined();
  expect(item?.quantity).toBe(5);
});

test("findInventoryItem returns undefined for missing item", () => {
  const inventory = createInventoryWithItems();
  const item = findInventoryItem(inventory, "nonexistent");
  expect(item).toBeUndefined();
});

test("getItemQuantity returns correct quantity", () => {
  const inventory = createInventoryWithItems();
  expect(getItemQuantity(inventory, "food_kibble")).toBe(5);
  expect(getItemQuantity(inventory, "drink_water")).toBe(10);
});

test("getItemQuantity returns 0 for missing item", () => {
  const inventory = createInventoryWithItems();
  expect(getItemQuantity(inventory, "nonexistent")).toBe(0);
});

test("hasItem returns true when has enough items", () => {
  const inventory = createInventoryWithItems();
  expect(hasItem(inventory, "food_kibble", 1)).toBe(true);
  expect(hasItem(inventory, "food_kibble", 5)).toBe(true);
});

test("hasItem returns false when not enough items", () => {
  const inventory = createInventoryWithItems();
  expect(hasItem(inventory, "food_kibble", 6)).toBe(false);
  expect(hasItem(inventory, "nonexistent", 1)).toBe(false);
});

test("addItem adds new stackable item to empty inventory", () => {
  const inventory = createEmptyInventory();
  const updated = addItem(inventory, "food_kibble", 3);
  expect(updated.items.length).toBe(1);
  expect(updated.items[0]?.itemId).toBe("food_kibble");
  expect(updated.items[0]?.quantity).toBe(3);
});

test("addItem stacks with existing item", () => {
  const inventory = createInventoryWithItems();
  const updated = addItem(inventory, "food_kibble", 2);
  expect(getItemQuantity(updated, "food_kibble")).toBe(7);
});

test("addItem respects max stack size", () => {
  const inventory = createEmptyInventory();
  const updated = addItem(inventory, "food_kibble", 150);
  // food_kibble has maxStack of 99
  expect(updated.items[0]?.quantity).toBe(99);
});

test("addItem does not modify original inventory", () => {
  const inventory = createInventoryWithItems();
  const updated = addItem(inventory, "food_kibble", 2);
  expect(getItemQuantity(inventory, "food_kibble")).toBe(5);
  expect(getItemQuantity(updated, "food_kibble")).toBe(7);
});

test("removeItem removes correct quantity", () => {
  const inventory = createInventoryWithItems();
  const updated = removeItem(inventory, "food_kibble", 2);
  expect(getItemQuantity(updated, "food_kibble")).toBe(3);
});

test("removeItem removes item stack when quantity reaches 0", () => {
  const inventory = createInventoryWithItems();
  const updated = removeItem(inventory, "food_kibble", 5);
  expect(findInventoryItem(updated, "food_kibble")).toBeUndefined();
  expect(updated.items.length).toBe(1);
});

test("removeItem returns original inventory if not enough items", () => {
  const inventory = createInventoryWithItems();
  const updated = removeItem(inventory, "food_kibble", 10);
  expect(updated).toBe(inventory);
});

test("removeItem does not modify original inventory", () => {
  const inventory = createInventoryWithItems();
  const updated = removeItem(inventory, "food_kibble", 2);
  expect(getItemQuantity(inventory, "food_kibble")).toBe(5);
  expect(getItemQuantity(updated, "food_kibble")).toBe(3);
});

test("addItem creates overflow stacks when quantity exceeds max", () => {
  const inventory = createEmptyInventory();
  // Add 150 items when maxStack is 99
  const updated = addItem(inventory, "food_kibble", 150);
  // Should create 2 stacks: one of 99, one of 51
  expect(updated.items.length).toBe(2);
  expect(updated.items[0]?.quantity).toBe(99);
  expect(updated.items[1]?.quantity).toBe(51);
});

test("addItem fills existing stack then creates overflow", () => {
  // Create inventory with 95 items (near max)
  const inventory: Inventory = {
    items: [{ itemId: "food_kibble", quantity: 95, currentDurability: null }],
  };
  // Add 10 items (should fill to 99 then create new stack of 6)
  const updated = addItem(inventory, "food_kibble", 10);
  expect(updated.items.length).toBe(2);
  expect(updated.items[0]?.quantity).toBe(99);
  expect(updated.items[1]?.quantity).toBe(6);
});
