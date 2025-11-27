/**
 * Tests for item usage functions.
 */

import { expect, test } from "bun:test";
import {
  CLEANING_ITEMS,
  DRINK_ITEMS,
  FOOD_ITEMS,
  TOY_ITEMS,
} from "@/game/data/items";
import { SPECIES } from "@/game/data/species";
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
  const pet = createNewPet("TestPet", SPECIES.FLORABIT.id);
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
          {
            itemId: FOOD_ITEMS.KIBBLE.id,
            quantity: 5,
            currentDurability: null,
          },
          {
            itemId: DRINK_ITEMS.WATER.id,
            quantity: 5,
            currentDurability: null,
          },
          {
            itemId: DRINK_ITEMS.ENERGY.id,
            quantity: 2,
            currentDurability: null,
          },
          {
            itemId: CLEANING_ITEMS.TISSUE.id,
            quantity: 3,
            currentDurability: null,
          },
          {
            itemId: CLEANING_ITEMS.SPONGE.id,
            quantity: 2,
            currentDurability: null,
          },
          { itemId: TOY_ITEMS.BALL.id, quantity: 1, currentDurability: 10 },
          { itemId: TOY_ITEMS.ROPE.id, quantity: 1, currentDurability: 3 },
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
  const result = useFoodItem(state, FOOD_ITEMS.KIBBLE.id);

  expect(result.success).toBe(true);
  expect(result.state.pet?.careStats.satiety).toBeGreaterThan(10_000);
});

test("useFoodItem consumes item from inventory", () => {
  const state = createTestState();
  const result = useFoodItem(state, FOOD_ITEMS.KIBBLE.id);

  expect(result.success).toBe(true);
  const kibbleItem = result.state.player.inventory.items.find(
    (i) => i.itemId === FOOD_ITEMS.KIBBLE.id,
  );
  expect(kibbleItem?.quantity).toBe(4);
});

test("useFoodItem fails when pet is sleeping", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.sleep.isSleeping = true;
  }

  const result = useFoodItem(state, FOOD_ITEMS.KIBBLE.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("useFoodItem fails when item not in inventory", () => {
  const state = createTestState();
  const result = useFoodItem(state, FOOD_ITEMS.CAKE.id);

  expect(result.success).toBe(false);
  expect(result.message).toContain("inventory");
});

test("useFoodItem fails when no pet exists", () => {
  const state = createTestState();
  state.pet = null;

  const result = useFoodItem(state, FOOD_ITEMS.KIBBLE.id);
  expect(result.success).toBe(false);
});

test("useDrinkItem restores hydration", () => {
  const state = createTestState();
  const result = useDrinkItem(state, DRINK_ITEMS.WATER.id);

  expect(result.success).toBe(true);
  expect(result.state.pet?.careStats.hydration).toBeGreaterThan(10_000);
});

test("useDrinkItem consumes item from inventory", () => {
  const state = createTestState();
  const result = useDrinkItem(state, DRINK_ITEMS.WATER.id);

  expect(result.success).toBe(true);
  const waterItem = result.state.player.inventory.items.find(
    (i) => i.itemId === DRINK_ITEMS.WATER.id,
  );
  expect(waterItem?.quantity).toBe(4);
});

test("useDrinkItem with energy drink also restores energy", () => {
  const state = createTestState();
  const result = useDrinkItem(state, DRINK_ITEMS.ENERGY.id);

  expect(result.success).toBe(true);
  expect(result.state.pet?.energyStats.energy).toBeGreaterThan(10_000);
});

test("useDrinkItem fails when pet is sleeping", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.sleep.isSleeping = true;
  }

  const result = useDrinkItem(state, DRINK_ITEMS.WATER.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("useFoodItem clamps satiety to max", () => {
  const state = createTestState();
  if (state.pet) {
    // Set satiety near max
    state.pet.careStats.satiety = 49_000;
  }

  const result = useFoodItem(state, FOOD_ITEMS.KIBBLE.id);
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
      itemId: FOOD_ITEMS.MEAT.id,
      quantity: 1,
      currentDurability: null,
    });
  }

  const result = useFoodItem(state, FOOD_ITEMS.MEAT.id);
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
      itemId: FOOD_ITEMS.CAKE.id,
      quantity: 1,
      currentDurability: null,
    });
  }

  const result = useFoodItem(state, FOOD_ITEMS.CAKE.id);
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
  const result = useFoodItem(state, FOOD_ITEMS.KIBBLE.id);
  expect(result.success).toBe(true);
  // poop timer should be reduced by 30 (from 100 to 70)
  expect(result.state.pet?.poop.ticksUntilNext).toBe(70);
});

test("useCleaningItem removes poop and consumes item", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 3;
  }

  const result = useCleaningItem(state, CLEANING_ITEMS.TISSUE.id);

  expect(result.success).toBe(true);
  // Tissue removes 1 poop
  expect(result.state.pet?.poop.count).toBe(2);
  // Item should be consumed
  const tissueItem = result.state.player.inventory.items.find(
    (i) => i.itemId === CLEANING_ITEMS.TISSUE.id,
  );
  expect(tissueItem?.quantity).toBe(2);
});

test("useCleaningItem fails when no pet exists", () => {
  const state = createTestState();
  state.pet = null;

  const result = useCleaningItem(state, CLEANING_ITEMS.TISSUE.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("No pet");
});

test("useCleaningItem fails with invalid cleaning item", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 1;
  }

  const result = useCleaningItem(state, FOOD_ITEMS.KIBBLE.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("Invalid cleaning item");
});

test("useCleaningItem fails when item not in inventory", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 1;
  }

  const result = useCleaningItem(state, CLEANING_ITEMS.VACUUM.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("inventory");
});

test("useCleaningItem fails when no poop to clean", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 0;
  }

  const result = useCleaningItem(state, CLEANING_ITEMS.TISSUE.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("Nothing to clean");
});

test("useCleaningItem reduces poop but not below zero", () => {
  const state = createTestState();
  if (state.pet) {
    // Set poop to 2, use sponge which removes 3
    state.pet.poop.count = 2;
  }

  const result = useCleaningItem(state, CLEANING_ITEMS.SPONGE.id);
  expect(result.success).toBe(true);
  // Should be clamped at 0, not negative
  expect(result.state.pet?.poop.count).toBe(0);
});

test("useCleaningItem with sponge removes more poop than tissue", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.poop.count = 5;
  }

  const result = useCleaningItem(state, CLEANING_ITEMS.SPONGE.id);
  expect(result.success).toBe(true);
  // Sponge removes 3 poop
  expect(result.state.pet?.poop.count).toBe(2);
});

// Toy tests
test("useToyItem restores happiness", () => {
  const state = createTestState();
  const result = useToyItem(state, TOY_ITEMS.BALL.id);

  expect(result.success).toBe(true);
  expect(result.state.pet?.careStats.happiness).toBeGreaterThan(10_000);
});

test("useToyItem reduces durability by 1", () => {
  const state = createTestState();
  const result = useToyItem(state, TOY_ITEMS.BALL.id);

  expect(result.success).toBe(true);
  const toyItem = result.state.player.inventory.items.find(
    (i) => i.itemId === TOY_ITEMS.BALL.id,
  );
  expect(toyItem?.currentDurability).toBe(9);
});

test("useToyItem destroys toy when durability reaches 0", () => {
  const baseState = createTestState();
  // Set rope to 1 durability so it breaks after use (immutable update)
  const ropeIndex = baseState.player.inventory.items.findIndex(
    (i) => i.itemId === TOY_ITEMS.ROPE.id,
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

  const result = useToyItem(state, TOY_ITEMS.ROPE.id);

  expect(result.success).toBe(true);
  expect(result.message).toContain("broke");
  // Toy should be removed from inventory
  const toyItem = result.state.player.inventory.items.find(
    (i) => i.itemId === TOY_ITEMS.ROPE.id,
  );
  expect(toyItem).toBeUndefined();
});

test("useToyItem fails when pet is sleeping", () => {
  const state = createTestState();
  if (state.pet) {
    state.pet.sleep.isSleeping = true;
  }

  const result = useToyItem(state, TOY_ITEMS.BALL.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("useToyItem fails when no pet exists", () => {
  const state = createTestState();
  state.pet = null;

  const result = useToyItem(state, TOY_ITEMS.BALL.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("No pet");
});

test("useToyItem fails when toy not in inventory", () => {
  const state = createTestState();

  const result = useToyItem(state, TOY_ITEMS.PLUSH.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("inventory");
});

test("useToyItem fails with invalid toy item", () => {
  const state = createTestState();

  const result = useToyItem(state, FOOD_ITEMS.KIBBLE.id);
  expect(result.success).toBe(false);
  expect(result.message).toContain("Invalid toy item");
});

test("useToyItem clamps happiness to max", () => {
  const state = createTestState();
  if (state.pet) {
    // Set happiness near max
    state.pet.careStats.happiness = 49_000;
  }

  const result = useToyItem(state, TOY_ITEMS.BALL.id);
  expect(result.success).toBe(true);
  // Baby stage max with florabit multiplier is 50_000
  expect(result.state.pet?.careStats.happiness).toBe(50_000);
});
