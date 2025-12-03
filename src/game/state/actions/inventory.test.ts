/**
 * Tests for inventory state actions.
 */

import { describe, expect, test } from "bun:test";
import { DRINK_ITEMS } from "@/game/data/items/drinks";
import { FOOD_ITEMS } from "@/game/data/items/food";
import { createTestGameState } from "@/game/testing/createTestPet";
import { addItemToInventory, removeItemFromInventory } from "./inventory";

describe("addItemToInventory", () => {
  test("adds new item to empty inventory", () => {
    const state = createTestGameState();
    const result = addItemToInventory(state, FOOD_ITEMS.APPLE.id, 3);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem).toBeDefined();
    expect(appleItem?.quantity).toBe(3);
  });

  test("stacks with existing item", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 2, currentDurability: null },
    ];

    const result = addItemToInventory(state, FOOD_ITEMS.APPLE.id, 3);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem?.quantity).toBe(5);
  });

  test("adds default quantity of 1", () => {
    const state = createTestGameState();
    const result = addItemToInventory(state, FOOD_ITEMS.APPLE.id);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem?.quantity).toBe(1);
  });

  test("preserves other inventory items", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: DRINK_ITEMS.WATER.id, quantity: 5, currentDurability: null },
    ];

    const result = addItemToInventory(state, FOOD_ITEMS.APPLE.id, 3);

    const waterItem = result.player.inventory.items.find(
      (item) => item.itemId === DRINK_ITEMS.WATER.id,
    );
    expect(waterItem?.quantity).toBe(5);
  });

  test("does not modify original state", () => {
    const state = createTestGameState();
    const originalItemCount = state.player.inventory.items.length;

    addItemToInventory(state, FOOD_ITEMS.APPLE.id, 3);

    expect(state.player.inventory.items.length).toBe(originalItemCount);
  });
});

describe("removeItemFromInventory", () => {
  test("removes quantity from existing item", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 5, currentDurability: null },
    ];

    const result = removeItemFromInventory(state, FOOD_ITEMS.APPLE.id, 2);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem?.quantity).toBe(3);
  });

  test("removes item entirely when quantity reaches zero", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 3, currentDurability: null },
    ];

    const result = removeItemFromInventory(state, FOOD_ITEMS.APPLE.id, 3);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem).toBeUndefined();
  });

  test("removes default quantity of 1", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 5, currentDurability: null },
    ];

    const result = removeItemFromInventory(state, FOOD_ITEMS.APPLE.id);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem?.quantity).toBe(4);
  });

  test("does not remove if quantity insufficient", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 2, currentDurability: null },
    ];

    const result = removeItemFromInventory(state, FOOD_ITEMS.APPLE.id, 5);

    const appleItem = result.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem?.quantity).toBe(2);
  });

  test("returns unchanged state if item not found", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: DRINK_ITEMS.WATER.id, quantity: 5, currentDurability: null },
    ];

    const result = removeItemFromInventory(state, FOOD_ITEMS.APPLE.id, 1);

    expect(result.player.inventory.items).toEqual(state.player.inventory.items);
  });

  test("preserves other inventory items", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 5, currentDurability: null },
      { itemId: DRINK_ITEMS.WATER.id, quantity: 3, currentDurability: null },
    ];

    const result = removeItemFromInventory(state, FOOD_ITEMS.APPLE.id, 2);

    const waterItem = result.player.inventory.items.find(
      (item) => item.itemId === DRINK_ITEMS.WATER.id,
    );
    expect(waterItem?.quantity).toBe(3);
  });

  test("does not modify original state", () => {
    const state = createTestGameState();
    state.player.inventory.items = [
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 5, currentDurability: null },
    ];

    removeItemFromInventory(state, FOOD_ITEMS.APPLE.id, 2);

    const appleItem = state.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    expect(appleItem?.quantity).toBe(5);
  });
});
