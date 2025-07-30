// Tests for button functionality issues reported in the problem statement

import { describe, it, expect } from "bun:test";
import { PetSystem } from "@/systems/PetSystem";
import { PetValidator } from "@/lib/utils";
import { WILD_BEAST } from "@/data/pets";
import type { Pet } from "@/types";

// Helper to create a basic pet for testing
function createTestPet(): Pet {
  // Set tick values first, then calculate display values to ensure consistency
  const satietyTicksLeft = 5000; // 50 display value (5000 / 100 = 50)
  const hydrationTicksLeft = 4000; // 50 display value (4000 / 80 = 50) 
  const happinessTicksLeft = 6000; // 50 display value (6000 / 120 = 50)

  return {
    id: "test-pet",
    name: "Test Pet",
    species: WILD_BEAST,
    rarity: "common",
    birthTime: Date.now(),
    lastCareTime: Date.now(),
    totalLifetime: 0,
    growthStage: 0,

    // Care Stats (displayed) - calculated from ticks for consistency
    satiety: Math.ceil(satietyTicksLeft / 100), // 50
    hydration: Math.ceil(hydrationTicksLeft / 80), // 50  
    happiness: Math.ceil(happinessTicksLeft / 120), // 50

    // Hidden Counters
    satietyTicksLeft,
    hydrationTicksLeft,
    happinessTicksLeft,
    poopTicksLeft: 100,
    sickByPoopTicksLeft: 17280,

    // Core Stats
    life: 1000000,
    maxEnergy: 100,
    currentEnergy: 100,
    health: "healthy",
    state: "idle",

    // Battle Stats
    attack: 10,
    defense: 10,
    speed: 10,
    maxHealth: 50,
    currentHealth: 50,
    moves: [],
  };
}

describe("Button Issues from Problem Statement", () => {
  describe("Issue 1: Care stats fail to increase when given food, drinks, or toys", () => {
    it("should allow feeding when pet has room for satiety increase", () => {
      const pet = createTestPet();
      pet.satiety = 50; // Not full
      pet.health = "healthy"; // Not sick
      pet.state = "idle"; // Not busy
      
      // Test that PetValidator allows the action
      const feedValidation = PetValidator.validateCareAction(pet, "feed");
      expect(feedValidation).toBeNull(); // Should be valid
      
      // Test that feeding actually works
      const result = PetSystem.feedPet(pet, 20);
      expect(result.success).toBe(true);
      expect(pet.satiety).toBeGreaterThan(50); // Should have increased
    });

    it("should allow giving drinks when pet has room for hydration increase", () => {
      const pet = createTestPet();
      // Start with lower hydration to ensure room for increase
      pet.hydrationTicksLeft = 3200; // 40 display value (3200 / 80 = 40)
      pet.hydration = Math.ceil(pet.hydrationTicksLeft / 80); // 40
      pet.health = "healthy"; // Not sick
      pet.state = "idle"; // Not busy
      
      // Test that PetValidator allows the action
      const drinkValidation = PetValidator.validateCareAction(pet, "drink");
      expect(drinkValidation).toBeNull(); // Should be valid
      
      // Test that giving drinks actually works
      const result = PetSystem.giveDrink(pet, 25);
      expect(result.success).toBe(true);
      expect(pet.hydration).toBeGreaterThan(40); // Should have increased
    });

    it("should allow playing when pet has room for happiness increase and enough energy", () => {
      const pet = createTestPet();
      // Start with lower happiness to ensure room for increase  
      pet.happinessTicksLeft = 7200; // 60 display value (7200 / 120 = 60)
      pet.happiness = Math.ceil(pet.happinessTicksLeft / 120); // 60
      pet.currentEnergy = 50; // Has energy
      pet.health = "healthy"; // Not sick
      pet.state = "idle"; // Not busy
      
      // Test that PetValidator allows the action
      const playValidation = PetValidator.validateCareAction(pet, "play", 10);
      expect(playValidation).toBeNull(); // Should be valid
      
      // Test that playing actually works
      const result = PetSystem.playWithPet(pet, 15, 10);
      expect(result.success).toBe(true);
      expect(pet.happiness).toBeGreaterThan(60); // Should have increased
    });

    it("should correctly block care actions when pet is sick", () => {
      const pet = createTestPet();
      pet.health = "sick"; // Pet is sick
      
      // All care actions should be blocked when sick
      expect(PetValidator.validateCareAction(pet, "feed")).toBe("Pet is too sick to eat. Use medicine first.");
      expect(PetValidator.validateCareAction(pet, "drink")).toBe("Pet is too sick to drink. Use medicine first.");
      expect(PetValidator.validateCareAction(pet, "play", 10)).toBe("Pet is too sick to play. Use medicine first.");
    });

    it("should correctly block care actions when pet is exploring", () => {
      const pet = createTestPet();
      pet.state = "exploring"; // Pet is busy
      
      // All care actions should be blocked when exploring
      expect(PetValidator.validateCareAction(pet, "feed")).toBe("Cannot feed pet while exploring. Wait for activity to complete or cancel it.");
      expect(PetValidator.validateCareAction(pet, "drink")).toBe("Cannot give drinks while exploring. Wait for activity to complete or cancel it.");
      expect(PetValidator.validateCareAction(pet, "play", 10)).toBe("Cannot play while exploring. Wait for activity to complete or cancel it.");
    });
  });

  describe("Issue 2: Wake up button incorrectly disabled when pet is sleeping", () => {
    it("should allow waking up pet when it is sleeping", () => {
      const pet = createTestPet();
      pet.state = "sleeping"; // Pet is sleeping
      
      // Wake up action should be allowed when pet is sleeping
      const result = PetSystem.wakePetUp(pet);
      expect(result.success).toBe(true);
      expect(pet.state).toBe("idle" as any); // Should be awake now
    });

    it("should block sleep action when pet is already sleeping", () => {
      const pet = createTestPet();
      pet.state = "sleeping"; // Pet is already sleeping
      
      // Sleep action should be blocked when already sleeping
      const sleepValidation = PetValidator.validateSleepAction(pet);
      expect(sleepValidation).toBe("Pet is already sleeping.");
      
      // But wake up should work
      const wakeResult = PetSystem.wakePetUp(pet);
      expect(wakeResult.success).toBe(true);
    });

    it("should allow sleep action when pet is idle", () => {
      const pet = createTestPet();
      pet.state = "idle"; // Pet is awake
      
      // Sleep action should be allowed when idle
      const sleepValidation = PetValidator.validateSleepAction(pet);
      expect(sleepValidation).toBeNull(); // Should be valid
      
      const result = PetSystem.putPetToSleep(pet);
      expect(result.success).toBe(true);
      expect(pet.state).toBe("sleeping" as any);
    });

    it("should demonstrate the button logic issue with sleep/wake validation", () => {
      const pet = createTestPet();
      
      // Test when pet is awake - should be able to sleep
      pet.state = "idle";
      const canSleepWhenIdle = (pet.state as any) !== "sleeping" && !PetValidator.validateSleepAction(pet);
      const canWakeWhenIdle = (pet.state as any) === "sleeping";
      const canToggleSleepWhenIdle = canSleepWhenIdle || canWakeWhenIdle;
      expect(canToggleSleepWhenIdle).toBe(true); // Button should be enabled for "Sleep"
      
      // Test when pet is sleeping - should be able to wake up (this was the bug)
      pet.state = "sleeping";
      const canSleepWhenSleeping = (pet.state as any) !== "sleeping" && !PetValidator.validateSleepAction(pet);
      const canWakeWhenSleeping = (pet.state as any) === "sleeping";
      const canToggleSleepWhenSleeping = canSleepWhenSleeping || canWakeWhenSleeping;
      expect(canToggleSleepWhenSleeping).toBe(true); // FIXED: Button should be enabled for "Wake Up"
      
      // Verify the individual components of the logic
      expect(canSleepWhenSleeping).toBe(false); // Can't sleep when already sleeping
      expect(canWakeWhenSleeping).toBe(true); // Can wake when sleeping
      
      // But we should be able to wake up a sleeping pet
      const canWakeUp = PetSystem.wakePetUp(pet);
      expect(canWakeUp.success).toBe(true); // Wake up should work
    });
  });
});