/**
 * Tests for item usage functions.
 */

import { expect, test } from "bun:test";
import { createNewPet } from "@/game/data/starting";
import { CURRENT_SAVE_VERSION } from "@/game/types";
import type { GameState } from "@/game/types/gameState";
import { createInitialSkills } from "@/game/types/skill";
import {
  useCleaningItem,
  useDrinkItem,
  useFoodItem,
  useToyItem,
} from "./items";

function createTestState(): GameState {
  const pet = createNewPet("TestPet", "florabit");
  // Reduce stats to test restoration
  pet.careStats.satiety = 10_000;
  pet.careStats.hydration = 10_000;
  pet.careStats.happiness = 10_000;
  pet.energyStats.energy = 10_000;

  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    lastDailyReset: Date.now(),
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
          { itemId: "toy_ball", quantity: 1, currentDurability: 10 },
          { itemId: "toy_rope", quantity: 1, currentDurability: 3 },
        ],
      },
      currency: { coins: 100 },
      currentLocationId: "home",
      skills: createInitialSkills(),
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
    state.pet.poop.ticksUntilNext = 200;
    // Add food_meat which has poopAcceleration of 90 ticks (45 minutes)
    state.player.inventory.items.push({
      itemId: "food_meat",
      quantity: 1,
      currentDurability: null,
    });
  }

  const result = useFoodItem(state, "food_meat");
  expect(result.success).toBe(true);
  // poop timer should be reduced by 90 (from 200 to 110)
  expect(result.state.pet?.poop.ticksUntilNext).toBe(110);
});

test("useFoodItem does not go below 0 for poop timer", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop timer to a low value
    state.pet.poop.ticksUntilNext = 50;
    // Add food_cake which has poopAcceleration of 120 ticks (60 minutes)
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

test("useFoodItem applies poopAcceleration for light meals", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop timer to a known value
    state.pet.poop.ticksUntilNext = 100;
  }

  // food_kibble has poopAcceleration of 30 ticks (15 minutes)
  const result = useFoodItem(state, "food_kibble");
  expect(result.success).toBe(true);
  // poop timer should be reduced by 30 (from 100 to 70)
  expect(result.state.pet?.poop.ticksUntilNext).toBe(70);
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

// Toy tests
test("useToyItem restores happiness", () => {
  const state = createTestState();
  const result = useToyItem(state, "toy_ball");

  expect(result.success).toBe(true);
  expect(result.state.pet?.careStats.happiness).toBeGreaterThan(10_000);
});

test("useToyItem reduces durability by 1", () => {
  const state = createTestState();
  const result = useToyItem(state, "toy_ball");

  expect(result.success).toBe(true);
  const toyItem = result.state.player.inventory.items.find(
    (i) => i.itemId === "toy_ball",
  );
  expect(toyItem?.currentDurability).toBe(9);
});

test("useToyItem destroys toy when durability reaches 0", () => {
  const baseState = createTestState();
  // Set rope to 1 durability so it breaks after use (immutable update)
  const ropeIndex = baseState.player.inventory.items.findIndex(
    (i) => i.itemId === "toy_rope",
  );
  const state = {
    ...baseState,
    player: {
      ...baseState.player,
      inventory: {
        items: baseState.player.inventory.items.map((item, i) =>
          i === ropeIndex ? { ...item, currentDurability: 1 } : item,
        ),
      },
    },
  };

  const result = useToyItem(state, "toy_rope");

  expect(result.success).toBe(true);
  expect(result.message).toContain("broke");
  // Toy should be removed from inventory
  const toyItem = result.state.player.inventory.items.find(
    (i) => i.itemId === "toy_rope",
  );
  expect(toyItem).toBeUndefined();
});

test("useToyItem fails when pet is sleeping", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.sleep.isSleeping = true;
  }

  const result = useToyItem(state, "toy_ball");
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("useToyItem fails when no pet exists", () => {
  const state = createTestState();
  state.pet = null;

  const result = useToyItem(state, "toy_ball");
  expect(result.success).toBe(false);
  expect(result.message).toContain("No pet");
});

test("useToyItem fails when toy not in inventory", () => {
  const state = createTestState();

  const result = useToyItem(state, "toy_plush");
  expect(result.success).toBe(false);
  expect(result.message).toContain("inventory");
});

test("useToyItem fails with invalid toy item", () => {
  const state = createTestState();

  const result = useToyItem(state, "food_kibble");
  expect(result.success).toBe(false);
  expect(result.message).toContain("Invalid toy item");
});

test("useToyItem clamps happiness to max", () => {
  const state = createTestState();
  if (state.pet) {
    // Set happiness near max
    state.pet.careStats.happiness = 49_000;
  }

  const result = useToyItem(state, "toy_ball");
  expect(result.success).toBe(true);
  // Baby stage max with florabit multiplier is 50_000
  expect(result.state.pet?.careStats.happiness).toBe(50_000);
});
