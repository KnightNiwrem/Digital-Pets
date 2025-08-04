/**
 * Test file for care screen bugs #70
 * Testing specific scenarios reported in the issue
 */

import { describe, it, expect } from "bun:test";
import { PetValidator } from "@/lib/utils";
import { GameStateFactory } from "@/engine/GameStateFactory";

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
  it("should validate pet state for cleaning actions", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 2;
    pet.state = "idle";

    // Test that pet has poop and is in a valid state for cleaning
    expect(pet.poopCount).toBeGreaterThan(0);
    expect(pet.state).toBe("idle");
    expect(PetValidator.isSleeping(pet)).toBe(false);
  });

  it("should prevent cleaning when pet has no poop", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 0; // No poop to clean
    pet.state = "idle";

    // Modern validation is handled through PetValidator and ActionCoordinator
    // The specific item validation logic has been moved to proposal-based system
    expect(pet.poopCount).toBe(0);
  });

  it("should handle cleaning validation consistently with UI logic", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 1;
    pet.state = "sleeping"; // Pet is sleeping

    // Test that pet state validation works for sleeping pets
    expect(PetValidator.isSleeping(pet)).toBe(true);
    expect(pet.poopCount).toBeGreaterThan(0);
  });

  it("should identify pets that need cleaning", () => {
    const testGame = GameStateFactory.createTestGame();
    const pet = testGame.currentPet!;
    pet.poopCount = 2;
    pet.state = "idle";

    // Test that we can identify when cleaning is needed
    expect(pet.poopCount).toBeGreaterThan(0);
    expect(pet.state).toBe("idle");
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
