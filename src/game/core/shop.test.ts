/**
 * Tests for shop transaction logic.
 */

import { describe, expect, test } from "bun:test";
import {
  buyItem,
  calculateSellPrice,
  canAfford,
  getShopItem,
  sellItem,
} from "@/game/core/shop";
import { FOOD_ITEMS } from "@/game/data/items";
import { getShop } from "@/game/data/shops";
import { createInitialGameState } from "@/game/types/gameState";

describe("canAfford", () => {
  test("returns true when player has enough coins", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 100 },
      },
    };

    expect(canAfford(state, 50)).toBe(true);
    expect(canAfford(state, 100)).toBe(true);
  });

  test("returns false when player lacks coins", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 50 },
      },
    };

    expect(canAfford(state, 100)).toBe(false);
  });
});

describe("getShopItem", () => {
  test("returns shop item when found", () => {
    const shop = getShop("willowbrook_shop");
    expect(shop).toBeDefined();
    if (!shop) return;

    const item = getShopItem(shop, FOOD_ITEMS.KIBBLE.id);
    expect(item).toBeDefined();
    expect(item?.buyPrice).toBe(10);
  });

  test("returns undefined when item not in shop", () => {
    const shop = getShop("willowbrook_shop");
    expect(shop).toBeDefined();
    if (!shop) return;

    const item = getShopItem(shop, "nonexistent_item");
    expect(item).toBeUndefined();
  });
});

describe("calculateSellPrice", () => {
  test("calculates correct sell price based on multiplier", () => {
    // food_kibble has sellValue of 5, shop has 0.5 multiplier
    const price = calculateSellPrice("willowbrook_shop", FOOD_ITEMS.KIBBLE.id);
    expect(price).toBe(2); // floor(5 * 0.5) = 2
  });

  test("returns 0 for unknown shop", () => {
    const price = calculateSellPrice("nonexistent_shop", FOOD_ITEMS.KIBBLE.id);
    expect(price).toBe(0);
  });

  test("returns 0 for unknown item", () => {
    const price = calculateSellPrice("willowbrook_shop", "nonexistent_item");
    expect(price).toBe(0);
  });
});

describe("buyItem", () => {
  test("succeeds when player can afford item", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 100 },
        inventory: { items: [] },
      },
    };

    const { result, state: newState } = buyItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      2,
    );

    expect(result.success).toBe(true);
    expect(newState.player.currency.coins).toBe(80); // 100 - (10 * 2)
    expect(newState.player.inventory.items).toHaveLength(1);
    expect(newState.player.inventory.items[0]?.itemId).toBe(
      FOOD_ITEMS.KIBBLE.id,
    );
    expect(newState.player.inventory.items[0]?.quantity).toBe(2);
  });

  test("fails when player cannot afford item", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 5 },
        inventory: { items: [] },
      },
    };

    const { result, state: newState } = buyItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      1,
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("Not enough coins");
    expect(newState.player.currency.coins).toBe(5); // unchanged
    expect(newState.player.inventory.items).toHaveLength(0);
  });

  test("fails for unknown shop", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 100 },
      },
    };

    const { result, state: newState } = buyItem(
      state,
      "nonexistent_shop",
      FOOD_ITEMS.KIBBLE.id,
      1,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Shop not found.");
    expect(newState).toBe(state); // unchanged
  });

  test("fails for item not in shop", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 100 },
      },
    };

    const { result, state: newState } = buyItem(
      state,
      "willowbrook_shop",
      "nonexistent_item",
      1,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Item not available in this shop.");
    expect(newState).toBe(state); // unchanged
  });

  test("fails for invalid quantity", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 100 },
      },
    };

    // Zero quantity
    const result1 = buyItem(state, "willowbrook_shop", FOOD_ITEMS.KIBBLE.id, 0);
    expect(result1.result.success).toBe(false);
    expect(result1.result.message).toBe("Quantity must be at least 1.");

    // Negative quantity
    const result2 = buyItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      -5,
    );
    expect(result2.result.success).toBe(false);
    expect(result2.result.message).toBe("Quantity must be at least 1.");
  });
});

describe("sellItem", () => {
  test("succeeds when player has item", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 50 },
        inventory: {
          items: [
            {
              itemId: FOOD_ITEMS.KIBBLE.id,
              quantity: 5,
              currentDurability: null,
            },
          ],
        },
      },
    };

    const { result, state: newState } = sellItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      2,
    );

    expect(result.success).toBe(true);
    expect(result.coinsReceived).toBe(4); // 2 * floor(5 * 0.5) = 2 * 2 = 4
    expect(newState.player.currency.coins).toBe(54); // 50 + 4
    expect(newState.player.inventory.items[0]?.quantity).toBe(3); // 5 - 2
  });

  test("fails when player lacks items", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 50 },
        inventory: {
          items: [
            {
              itemId: FOOD_ITEMS.KIBBLE.id,
              quantity: 1,
              currentDurability: null,
            },
          ],
        },
      },
    };

    const { result, state: newState } = sellItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      5,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Not enough items to sell.");
    expect(newState.player.currency.coins).toBe(50); // unchanged
  });

  test("fails for unknown shop", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        inventory: {
          items: [
            {
              itemId: FOOD_ITEMS.KIBBLE.id,
              quantity: 5,
              currentDurability: null,
            },
          ],
        },
      },
    };

    const { result } = sellItem(
      state,
      "nonexistent_shop",
      FOOD_ITEMS.KIBBLE.id,
      1,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("Shop not found.");
  });

  test("removes all items when selling entire stack", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        currency: { coins: 0 },
        inventory: {
          items: [
            {
              itemId: FOOD_ITEMS.KIBBLE.id,
              quantity: 3,
              currentDurability: null,
            },
          ],
        },
      },
    };

    const { result, state: newState } = sellItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      3,
    );

    expect(result.success).toBe(true);
    expect(newState.player.inventory.items).toHaveLength(0);
  });

  test("fails for invalid quantity", () => {
    const state = {
      ...createInitialGameState(),
      player: {
        ...createInitialGameState().player,
        inventory: {
          items: [
            {
              itemId: FOOD_ITEMS.KIBBLE.id,
              quantity: 5,
              currentDurability: null,
            },
          ],
        },
      },
    };

    // Zero quantity
    const result1 = sellItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      0,
    );
    expect(result1.result.success).toBe(false);
    expect(result1.result.message).toBe("Quantity must be at least 1.");

    // Negative quantity
    const result2 = sellItem(
      state,
      "willowbrook_shop",
      FOOD_ITEMS.KIBBLE.id,
      -5,
    );
    expect(result2.result.success).toBe(false);
    expect(result2.result.message).toBe("Quantity must be at least 1.");
  });
});
