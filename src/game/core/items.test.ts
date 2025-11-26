/**
 * Tests for item usage functions.
 */

import { expect, test } from "bun:test";
import { createNewPet } from "@/game/data/starting";
import { CURRENT_SAVE_VERSION } from "@/game/types";
import type { GameState } from "@/game/types/gameState";
import { useCleaningItem, useDrinkItem, useFoodItem } from "./items";

function createTestState(): GameState {
  const pet = createNewPet("TestPet", "florabit");
  // Reduce stats to test restoration
  pet.careStats.satiety = 10_000;
  pet.careStats.hydration = 10_000;
  pet.energyStats.energy = 10_000;

  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    totalTicks: 0,
    pet,
    player: {
      inventory: {
        items: [
          { itemId: "food_kibble", quantity: 5, currentDurability: null },
          { itemId: "drink_water", quantity: 5, currentDurability: null },
          { itemId: "drink_energy", quantity: 2, currentDurability: null },
          { itemId: "cleaning_tissue", quantity: 3, currentDurability: null },
          { itemId: "cleaning_sponge", quantity: 2, currentDurability: null },
        ],
      },
      currency: { coins: 100 },
      currentLocationId: "home",
    },
    quests: [],
    isInitialized: true,
  };
}

test("useFoodItem restores satiety", () => {
  const state = createTestState();
  const result = useFoodItem(state, "food_kibble");

  expect(result.success).toBe(true);
  expect(result.state.pet?.careStats.satiety).toBeGreaterThan(10_000);
});

test("useFoodItem consumes item from inventory", () => {
  const state = createTestState();
  const result = useFoodItem(state, "food_kibble");

  expect(result.success).toBe(true);
  const kibbleItem = result.state.player.inventory.items.find(
    (i) => i.itemId === "food_kibble",
  );
  expect(kibbleItem?.quantity).toBe(4);
});

test("useFoodItem fails when pet is sleeping", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.sleep.isSleeping = true;
  }

  const result = useFoodItem(state, "food_kibble");
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("useFoodItem fails when item not in inventory", () => {
  const state = createTestState();
  const result = useFoodItem(state, "food_cake");

  expect(result.success).toBe(false);
  expect(result.message).toContain("inventory");
});

test("useFoodItem fails when no pet exists", () => {
  const state = createTestState();
  state.pet = null;

  const result = useFoodItem(state, "food_kibble");
  expect(result.success).toBe(false);
});

test("useDrinkItem restores hydration", () => {
  const state = createTestState();
  const result = useDrinkItem(state, "drink_water");

  expect(result.success).toBe(true);
  expect(result.state.pet?.careStats.hydration).toBeGreaterThan(10_000);
});

test("useDrinkItem consumes item from inventory", () => {
  const state = createTestState();
  const result = useDrinkItem(state, "drink_water");

  expect(result.success).toBe(true);
  const waterItem = result.state.player.inventory.items.find(
    (i) => i.itemId === "drink_water",
  );
  expect(waterItem?.quantity).toBe(4);
});

test("useDrinkItem with energy drink also restores energy", () => {
  const state = createTestState();
  const result = useDrinkItem(state, "drink_energy");

  expect(result.success).toBe(true);
  expect(result.state.pet?.energyStats.energy).toBeGreaterThan(10_000);
});

test("useDrinkItem fails when pet is sleeping", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.sleep.isSleeping = true;
  }

  const result = useDrinkItem(state, "drink_water");
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("useFoodItem clamps satiety to max", () => {
  const state = createTestState();
  if (state.pet) {
    // Set satiety near max
    state.pet.careStats.satiety = 49_000;
  }

  const result = useFoodItem(state, "food_kibble");
  expect(result.success).toBe(true);
  // Baby stage max with florabit multiplier is 50_000 * 1.0 = 50_000
  expect(result.state.pet?.careStats.satiety).toBe(50_000);
});

test("useFoodItem applies poopAcceleration when food has it", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop timer to a known value
    state.pet.poop.ticksUntilNext = 10;
    // Add food_meat which has poopAcceleration of 2
    state.player.inventory.items.push({
      itemId: "food_meat",
      quantity: 1,
      currentDurability: null,
    });
  }

  const result = useFoodItem(state, "food_meat");
  expect(result.success).toBe(true);
  // poop timer should be reduced by 2 (from 10 to 8)
  expect(result.state.pet?.poop.ticksUntilNext).toBe(8);
});

test("useFoodItem does not go below 0 for poop timer", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop timer to a low value
    state.pet.poop.ticksUntilNext = 1;
    // Add food_cake which has poopAcceleration of 3
    state.player.inventory.items.push({
      itemId: "food_cake",
      quantity: 1,
      currentDurability: null,
    });
  }

  const result = useFoodItem(state, "food_cake");
  expect(result.success).toBe(true);
  // poop timer should be clamped at 0, not negative
  expect(result.state.pet?.poop.ticksUntilNext).toBe(0);
});

test("useFoodItem does not change poop timer when poopAcceleration is 0", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop timer to a known value
    state.pet.poop.ticksUntilNext = 10;
  }

  // food_kibble has poopAcceleration of 0
  const result = useFoodItem(state, "food_kibble");
  expect(result.success).toBe(true);
  // poop timer should remain unchanged
  expect(result.state.pet?.poop.ticksUntilNext).toBe(10);
});

test("useCleaningItem removes poop and consumes item", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 3;
  }

  const result = useCleaningItem(state, "cleaning_tissue");

  expect(result.success).toBe(true);
  // Tissue removes 1 poop
  expect(result.state.pet?.poop.count).toBe(2);
  // Item should be consumed
  const tissueItem = result.state.player.inventory.items.find(
    (i) => i.itemId === "cleaning_tissue",
  );
  expect(tissueItem?.quantity).toBe(2);
});

test("useCleaningItem fails when no pet exists", () => {
  const state = createTestState();
  state.pet = null;

  const result = useCleaningItem(state, "cleaning_tissue");
  expect(result.success).toBe(false);
  expect(result.message).toContain("No pet");
});

test("useCleaningItem fails with invalid cleaning item", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 1;
  }

  const result = useCleaningItem(state, "food_kibble");
  expect(result.success).toBe(false);
  expect(result.message).toContain("Invalid cleaning item");
});

test("useCleaningItem fails when item not in inventory", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 1;
  }

  const result = useCleaningItem(state, "cleaning_vacuum");
  expect(result.success).toBe(false);
  expect(result.message).toContain("inventory");
});

test("useCleaningItem fails when no poop to clean", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 0;
  }

  const result = useCleaningItem(state, "cleaning_tissue");
  expect(result.success).toBe(false);
  expect(result.message).toContain("Nothing to clean");
});

test("useCleaningItem reduces poop but not below zero", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop to 2, use sponge which removes 3
    state.pet.poop.count = 2;
  }

  const result = useCleaningItem(state, "cleaning_sponge");
  expect(result.success).toBe(true);
  // Should be clamped at 0, not negative
  expect(result.state.pet?.poop.count).toBe(0);
});

test("useCleaningItem with sponge removes more poop than tissue", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 5;
  }

  const result = useCleaningItem(state, "cleaning_sponge");
  expect(result.success).toBe(true);
  // Sponge removes 3 poop
  expect(result.state.pet?.poop.count).toBe(2);
});
