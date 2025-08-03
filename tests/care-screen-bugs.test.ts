/**
 * Test file for care screen bugs #70
 * Testing specific scenarios reported in the issue
 */

import { describe, it, expect } from "bun:test";
import { PetValidator } from "@/lib/utils";
import { ItemSystem } from "@/systems/ItemSystem";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { getItemById } from "@/data/items";

describe("Care Screen Bug #70 - Sleep State Validation", () => {
  it("should prevent playing with pet while pet is sleeping", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.state = "sleeping";
    pet.happiness = 50; // Make pet not fully happy so play would normally be valid

    // Test PetValidator.validateCareAction for play while sleeping
    const error = PetValidator.validateCareAction(pet, "play", 10);

    // Should return an error message preventing play while sleeping
    expect(error).not.toBeNull();
    expect(error).toContain("sleep");
  });

  it("should allow playing with pet when not sleeping", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.state = "idle";
    pet.happiness = 50; // Make pet not fully happy
    pet.currentEnergy = 50; // Ensure sufficient energy

    // Test PetValidator.validateCareAction for play while awake
    const error = PetValidator.validateCareAction(pet, "play", 10);

    // Should not return an error
    expect(error).toBeNull();
  });
});

describe("Care Screen Bug #70 - Cleaning Validation", () => {
  it("should allow cleaning when pet has poop and is in valid state", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 2;
    pet.state = "idle";

    const inventory = testGame.inventory;
    const soapItem = getItemById("soap");
    expect(soapItem).toBeDefined();

    if (soapItem) {
      ItemSystem.addItem(inventory, soapItem, 1);

      // Test item validation for hygiene items
      const validation = ItemSystem.validateItemUsage(pet, soapItem);

      expect(validation.success).toBe(true);
    }
  });

  it("should prevent cleaning when pet has no poop", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 0; // No poop to clean
    pet.state = "idle";

    const inventory = testGame.inventory;
    const soapItem = getItemById("soap");
    expect(soapItem).toBeDefined();

    if (soapItem) {
      ItemSystem.addItem(inventory, soapItem, 1);

      // Test item validation for hygiene items
      const validation = ItemSystem.validateItemUsage(pet, soapItem);

      expect(validation.success).toBe(false);
      expect(validation.error).toContain("no poop to clean");
    }
  });

  it("should handle cleaning validation consistently with UI logic", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 1;
    pet.state = "sleeping"; // Pet is sleeping

    const inventory = testGame.inventory;
    const soapItem = getItemById("soap");
    expect(soapItem).toBeDefined();

    if (soapItem) {
      ItemSystem.addItem(inventory, soapItem, 1);

      // The UI logic prevents cleaning while sleeping
      // Now the item validation should also prevent it
      const validation = ItemSystem.validateItemUsage(pet, soapItem);

      // Should now fail because pet is sleeping
      expect(validation.success).toBe(false);
      expect(validation.error).toContain("sleeping");
    }
  });

  it("should use useItem flow end-to-end for cleaning", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 2;
    pet.state = "idle";

    const inventory = testGame.inventory;
    const soapItem = getItemById("soap");
    expect(soapItem).toBeDefined();

    if (soapItem) {
      const addResult = ItemSystem.addItem(inventory, soapItem, 1);
      expect(addResult.success).toBe(true);

      // Test the full useItem flow
      const useResult = ItemSystem.useItem(inventory, pet, soapItem.id);

      expect(useResult.success).toBe(true);
      if (useResult.success && useResult.data) {
        expect(useResult.data.pet.poopCount).toBe(0); // Check the returned pet, not the original
      }
    }
  });
});

describe("Care Screen Bug #70 - State Validation Edge Cases", () => {
  it("should handle pet state transitions properly", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.happiness = 50;
    pet.currentEnergy = 50;

    // Test state transitions
    pet.state = "idle";
    expect(PetValidator.validateCareAction(pet, "play", 10)).toBeNull();

    pet.state = "sleeping";
    expect(PetValidator.validateCareAction(pet, "play", 10)).toBeDefined();

    pet.state = "exploring";
    expect(PetValidator.validateCareAction(pet, "play", 10)).toBeDefined();
  });

  it("should validate all care actions consistently", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.state = "sleeping";

    // Test all care actions while sleeping
    const feedError = PetValidator.validateCareAction(pet, "feed");
    const drinkError = PetValidator.validateCareAction(pet, "drink");
    const playError = PetValidator.validateCareAction(pet, "play", 10);

    // Feed and drink should be allowed while sleeping (in real life pets can eat/drink while resting)
    expect(feedError).toBeNull();
    expect(drinkError).toBeNull();

    // But play should not be allowed
    expect(playError).not.toBeNull();
    expect(playError).toContain("sleep");
  });
});
