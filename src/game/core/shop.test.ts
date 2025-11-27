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

    const item = getShopItem(shop, "food_kibble");
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
    const price = calculateSellPrice("willowbrook_shop", "food_kibble");
    expect(price).toBe(2); // floor(5 * 0.5) = 2
  });

  test("returns 0 for unknown shop", () => {
    const price = calculateSellPrice("nonexistent_shop", "food_kibble");
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
      "food_kibble",
      2,
    );

    expect(result.success).toBe(true);
    expect(newState.player.currency.coins).toBe(80); // 100 - (10 * 2)
    expect(newState.player.inventory.items).toHaveLength(1);
    expect(newState.player.inventory.items[0]?.itemId).toBe("food_kibble");
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
      "food_kibble",
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
      "food_kibble",
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
            { itemId: "food_kibble", quantity: 5, currentDurability: null },
          ],
        },
      },
    };

    const { result, state: newState } = sellItem(
      state,
      "willowbrook_shop",
      "food_kibble",
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
            { itemId: "food_kibble", quantity: 1, currentDurability: null },
          ],
        },
      },
    };

    const { result, state: newState } = sellItem(
      state,
      "willowbrook_shop",
      "food_kibble",
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
            { itemId: "food_kibble", quantity: 5, currentDurability: null },
          ],
        },
      },
    };

    const { result } = sellItem(state, "nonexistent_shop", "food_kibble", 1);

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
            { itemId: "food_kibble", quantity: 3, currentDurability: null },
          ],
        },
      },
    };

    const { result, state: newState } = sellItem(
      state,
      "willowbrook_shop",
      "food_kibble",
      3,
    );

    expect(result.success).toBe(true);
    expect(newState.player.inventory.items).toHaveLength(0);
  });
});
