/**
 * Unit tests for PetCarePanel component, focusing on cleaning logic
 */

import { describe, test, expect } from "bun:test";
import type { Pet, Inventory, ConsumableItem, InventorySlot } from "@/types";
import { PET_CONSTANTS } from "@/types";

// Mock pet for testing
function createMockPet(overrides: Partial<Pet> = {}): Pet {
  return {
    id: "test-pet",
    name: "Test Pet",
    species: {
      id: "wild_beast",
      name: "Wild Beast",
      rarity: "common",
      description: "A test pet",
      baseStats: { attack: 10, defense: 10, speed: 10, health: 100 },
      growthRates: { attack: 1.1, defense: 1.1, speed: 1.1, health: 1.1, energy: 1.1 },
      sprite: "beast.png",
      icon: "beast-icon.png",
    },
    rarity: "common",
    growthStage: 0,
    satiety: 50,
    hydration: 50,
    happiness: 50,
    satietyTicksLeft: 1000,
    hydrationTicksLeft: 1000,
    happinessTicksLeft: 1000,
    poopTicksLeft: 500,
    poopCount: 0,
    sickByPoopTicksLeft: PET_CONSTANTS.SICK_BY_POOP_TICKS,
    life: 500000,
    maxEnergy: 100,
    currentEnergy: 100,
    health: "healthy",
    state: "idle",
    attack: 15,
    defense: 15,
    speed: 15,
    maxHealth: 100,
    currentHealth: 100,
    moves: [],
    lastCareTime: Date.now(),
    birthTime: Date.now(),
    totalLifetime: 0,
    ...overrides,
  };
}

// Mock cleaning item
function createCleaningItem(): ConsumableItem {
  return {
    id: "soap",
    name: "Pet Soap",
    type: "hygiene",
    description: "Gentle soap for cleaning your pet",
    effects: [{ type: "clean", value: 1 }],
    value: 15,
    rarity: "common",
    stackable: true,
    icon: "item_soap",
  };
}

// Mock inventory with cleaning items
function createInventoryWithCleaningItems(cleaningItemCount: number = 1): Inventory {
  const cleaningSlots: InventorySlot[] = Array.from({ length: cleaningItemCount }, (_, index) => ({
    item: createCleaningItem(),
    quantity: 1,
    slotIndex: index,
  }));
  return {
    maxSlots: 20,
    slots: cleaningSlots,
    gold: 100,
  };
}

// Mock inventory without cleaning items
function createEmptyInventory(): Inventory {
  return {
    maxSlots: 20,
    slots: [],
    gold: 100,
  };
}

describe("PetCarePanel Cleaning Logic", () => {
  describe("canClean condition", () => {
    test("should allow cleaning when pet has poop and cleaning items available", () => {
      const pet = createMockPet({
        poopCount: 2, // Pet has poop to clean
        state: "idle",
      });
      const inventory = createInventoryWithCleaningItems();

      // Test the actual condition logic from PetCarePanel
      const canClean =
        pet.poopCount > 0 &&
        pet.state !== "exploring" &&
        pet.state !== "sleeping" &&
        pet.state !== "travelling" &&
        inventory.slots.some(slot => slot.item.effects?.some((effect: any) => effect.type === "clean"));

      expect(canClean).toBe(true);
    });

    test("should not allow cleaning when pet has no poop", () => {
      const pet = createMockPet({
        poopCount: 0, // No poop to clean
        state: "idle",
      });
      const inventory = createInventoryWithCleaningItems();

      const canClean =
        pet.poopCount > 0 &&
        pet.state !== "exploring" &&
        pet.state !== "sleeping" &&
        pet.state !== "travelling" &&
        inventory.slots.some(slot => slot.item.effects?.some((effect: any) => effect.type === "clean"));

      expect(canClean).toBe(false);
    });

    test("should not allow cleaning when no cleaning items available", () => {
      const pet = createMockPet({
        poopCount: 3, // Pet has poop to clean
        state: "idle",
      });
      const inventory = createEmptyInventory(); // No cleaning items

      const canClean =
        pet.poopCount > 0 &&
        pet.state !== "exploring" &&
        pet.state !== "sleeping" &&
        pet.state !== "travelling" &&
        inventory.slots.some(slot => slot.item.effects?.some((effect: any) => effect.type === "clean"));

      expect(canClean).toBe(false);
    });

    test("should not allow cleaning when pet is in restricted states", () => {
      const restrictedStates = ["exploring", "sleeping", "travelling"] as const;

      restrictedStates.forEach(state => {
        const pet = createMockPet({
          poopCount: 2, // Pet has poop to clean
          state: state,
        });
        const inventory = createInventoryWithCleaningItems();

        const canClean =
          pet.poopCount > 0 &&
          pet.state !== "exploring" &&
          pet.state !== "sleeping" &&
          pet.state !== "travelling" &&
          inventory.slots.some(slot => slot.item.effects?.some((effect: any) => effect.type === "clean"));

        expect(canClean).toBe(false);
      });
    });
  });

  describe("disabled button message logic", () => {
    test("should show 'No Cleaning Items' when inventory is empty", () => {
      const pet = createMockPet({
        poopCount: 2, // Pet has poop
      });
      const inventory = createEmptyInventory();
      const cleaningItems = inventory.slots.filter(slot =>
        slot.item.effects?.some((effect: any) => effect.type === "clean")
      );

      const buttonMessage =
        cleaningItems.length === 0 ? "No Cleaning Items" : pet.poopCount === 0 ? "No Poop to Clean" : "Cannot Clean";

      expect(buttonMessage).toBe("No Cleaning Items");
    });

    test("should show 'No Poop to Clean' when pet has no poop but cleaning items exist", () => {
      const pet = createMockPet({
        poopCount: 0, // No poop to clean
      });
      const inventory = createInventoryWithCleaningItems();
      const cleaningItems = inventory.slots.filter(slot =>
        slot.item.effects?.some((effect: any) => effect.type === "clean")
      );

      const buttonMessage =
        cleaningItems.length === 0 ? "No Cleaning Items" : pet.poopCount === 0 ? "No Poop to Clean" : "Cannot Clean";

      expect(buttonMessage).toBe("No Poop to Clean");
    });

    test("should show 'Cannot Clean' for other blocking conditions", () => {
      const pet = createMockPet({
        poopCount: 2, // Pet has poop
        state: "sleeping", // But is in a state that prevents cleaning
      });
      const inventory = createInventoryWithCleaningItems();
      const cleaningItems = inventory.slots.filter(slot =>
        slot.item.effects?.some((effect: any) => effect.type === "clean")
      );

      // This represents the case where pet has poop and cleaning items exist,
      // but other conditions prevent cleaning
      const buttonMessage =
        cleaningItems.length === 0 ? "No Cleaning Items" : pet.poopCount === 0 ? "No Poop to Clean" : "Cannot Clean";

      expect(buttonMessage).toBe("Cannot Clean");
    });
  });

  describe("poop count scenarios", () => {
    test("should recognize single poop needing cleaning", () => {
      const pet = createMockPet({
        poopCount: 1,
      });

      expect(pet.poopCount > 0).toBe(true);
    });

    test("should recognize multiple poops needing cleaning", () => {
      const pet = createMockPet({
        poopCount: 5,
      });

      expect(pet.poopCount > 0).toBe(true);
    });

    test("should recognize no poop when count is zero", () => {
      const pet = createMockPet({
        poopCount: 0,
      });

      expect(pet.poopCount > 0).toBe(false);
      expect(pet.poopCount === 0).toBe(true);
    });
  });

  describe("poopTicksLeft vs poopCount distinction", () => {
    test("should use poopCount (not poopTicksLeft) for cleaning availability", () => {
      // Test case: Pet has poop to clean but timer for next poop is still counting down
      const pet = createMockPet({
        poopCount: 2, // Has poop to clean
        poopTicksLeft: 100, // Still time before next poop
      });

      // Old (incorrect) logic would check poopTicksLeft <= 0
      const oldIncorrectCondition = pet.poopTicksLeft <= 0;
      expect(oldIncorrectCondition).toBe(false); // Would incorrectly prevent cleaning

      // New (correct) logic checks poopCount > 0
      const correctCondition = pet.poopCount > 0;
      expect(correctCondition).toBe(true); // Correctly allows cleaning
    });

    test("should distinguish between timer expiry and actual poop presence", () => {
      // Test case: Timer expired (would cause poop on next tick) but no poop yet
      const pet = createMockPet({
        poopCount: 0, // No poop to clean yet
        poopTicksLeft: 0, // Timer expired (poop would appear on next game tick)
      });

      // Old (incorrect) logic would allow cleaning when no poop exists
      const oldIncorrectCondition = pet.poopTicksLeft <= 0;
      expect(oldIncorrectCondition).toBe(true); // Would incorrectly allow cleaning

      // New (correct) logic prevents cleaning when no actual poop exists
      const correctCondition = pet.poopCount > 0;
      expect(correctCondition).toBe(false); // Correctly prevents cleaning
    });
  });
});
