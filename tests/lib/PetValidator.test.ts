import { describe, it, expect } from "bun:test";
import { PetValidator, GameMath, EnergyManager } from "@/lib/utils";
import { PET_CONSTANTS } from "@/types";
import type { Pet } from "@/types/Pet";

describe("PetValidator", () => {
  const createTestPet = (overrides: Partial<Pet> = {}): Pet => ({
    id: "test-pet",
    name: "Test Pet",
    species: "starter_dog",
    rarity: "common",
    growthStage: 0,
    satiety: 50,
    hydration: 50,
    happiness: 50,
    satietyTicksLeft: 50 * 100, // SATIETY multiplier is 100
    hydrationTicksLeft: 50 * 80, // HYDRATION multiplier is 80
    happinessTicksLeft: 50 * 120, // HAPPINESS multiplier is 120
    poopTicksLeft: 2000,
    sickByPoopTicksLeft: 17280,
    life: 1000000,
    maxEnergy: 100,
    currentEnergy: 50,
    health: "healthy",
    state: "idle",
    attack: 10,
    defense: 10,
    speed: 10,
    maxHealth: 100,
    currentHealth: 100,
    moves: [],
    level: 1,
    experience: 0,
    experienceToNext: 100,
    lastCareTime: Date.now(),
    createdAt: Date.now(),
    lifetime: 0,
    ...overrides,
  });

  describe("isSick", () => {
    it("should return true when pet is sick", () => {
      const sickPet = createTestPet({ health: "sick" });
      expect(PetValidator.isSick(sickPet)).toBe(true);
    });

    it("should return false when pet is healthy", () => {
      const healthyPet = createTestPet({ health: "healthy" });
      expect(PetValidator.isSick(healthyPet)).toBe(false);
    });

    it("should return false when pet is injured", () => {
      const injuredPet = createTestPet({ health: "injured" });
      expect(PetValidator.isSick(injuredPet)).toBe(false);
    });
  });

  describe("isSleeping", () => {
    it("should return true when pet is sleeping", () => {
      const sleepingPet = createTestPet({ state: "sleeping" });
      expect(PetValidator.isSleeping(sleepingPet)).toBe(true);
    });

    it("should return false when pet is idle", () => {
      const idlePet = createTestPet({ state: "idle" });
      expect(PetValidator.isSleeping(idlePet)).toBe(false);
    });

    it("should return false when pet is travelling", () => {
      const travellingPet = createTestPet({ state: "travelling" });
      expect(PetValidator.isSleeping(travellingPet)).toBe(false);
    });
  });

  describe("isTravelling", () => {
    it("should return true when pet is travelling", () => {
      const travellingPet = createTestPet({ state: "travelling" });
      expect(PetValidator.isTravelling(travellingPet)).toBe(true);
    });

    it("should return false when pet is idle", () => {
      const idlePet = createTestPet({ state: "idle" });
      expect(PetValidator.isTravelling(idlePet)).toBe(false);
    });

    it("should return false when pet is sleeping", () => {
      const sleepingPet = createTestPet({ state: "sleeping" });
      expect(PetValidator.isTravelling(sleepingPet)).toBe(false);
    });
  });

  describe("hasEnoughEnergy", () => {
    it("should return true when pet has enough energy", () => {
      const pet = createTestPet({ currentEnergy: 50 });
      expect(PetValidator.hasEnoughEnergy(pet, 30)).toBe(true);
    });

    it("should return true when pet has exactly required energy", () => {
      const pet = createTestPet({ currentEnergy: 30 });
      expect(PetValidator.hasEnoughEnergy(pet, 30)).toBe(true);
    });

    it("should return false when pet has insufficient energy", () => {
      const pet = createTestPet({ currentEnergy: 20 });
      expect(PetValidator.hasEnoughEnergy(pet, 30)).toBe(false);
    });
  });

  describe("validateCareAction", () => {
    it("should allow feeding healthy pet", () => {
      const pet = createTestPet({ health: "healthy" });
      expect(PetValidator.validateCareAction(pet, "feed")).toBeNull();
    });

    it("should prevent feeding sick pet", () => {
      const pet = createTestPet({ health: "sick" });
      expect(PetValidator.validateCareAction(pet, "feed")).toBe("Pet is too sick to eat. Use medicine first.");
    });

    it("should allow drinking for healthy pet", () => {
      const pet = createTestPet({ health: "healthy" });
      expect(PetValidator.validateCareAction(pet, "drink")).toBeNull();
    });

    it("should prevent drinking for sick pet", () => {
      const pet = createTestPet({ health: "sick" });
      expect(PetValidator.validateCareAction(pet, "drink")).toBe("Pet is too sick to drink. Use medicine first.");
    });

    it("should allow playing with healthy energetic pet", () => {
      const pet = createTestPet({ health: "healthy", currentEnergy: 50 });
      expect(PetValidator.validateCareAction(pet, "play", 10)).toBeNull();
    });

    it("should prevent playing with sick pet", () => {
      const pet = createTestPet({ health: "sick", currentEnergy: 50 });
      expect(PetValidator.validateCareAction(pet, "play", 10)).toBe("Pet is too sick to play. Use medicine first.");
    });

    it("should prevent playing with tired pet", () => {
      const pet = createTestPet({ health: "healthy", currentEnergy: 5 });
      expect(PetValidator.validateCareAction(pet, "play", 10)).toBe("Pet doesn't have enough energy to play.");
    });
  });

  describe("validateSleepAction", () => {
    it("should allow sleeping for idle pet", () => {
      const pet = createTestPet({ state: "idle" });
      expect(PetValidator.validateSleepAction(pet)).toBeNull();
    });

    it("should prevent sleeping for already sleeping pet", () => {
      const pet = createTestPet({ state: "sleeping" });
      expect(PetValidator.validateSleepAction(pet)).toBe("Pet is already sleeping.");
    });

    it("should prevent sleeping for travelling pet", () => {
      const pet = createTestPet({ state: "travelling" });
      expect(PetValidator.validateSleepAction(pet)).toBe("Pet cannot sleep while travelling.");
    });
  });

  describe("validateWorldAction", () => {
    it("should allow world action for idle energetic pet", () => {
      const pet = createTestPet({ state: "idle", currentEnergy: 50 });
      expect(PetValidator.validateWorldAction(pet, 20)).toBeNull();
    });

    it("should prevent world action for sleeping pet", () => {
      const pet = createTestPet({ state: "sleeping", currentEnergy: 50 });
      expect(PetValidator.validateWorldAction(pet, 20)).toBe("Pet cannot perform activities while sleeping.");
    });

    it("should prevent world action for travelling pet", () => {
      const pet = createTestPet({ state: "travelling", currentEnergy: 50 });
      expect(PetValidator.validateWorldAction(pet, 20)).toBe("Pet cannot perform activities while travelling.");
    });

    it("should prevent world action for tired pet", () => {
      const pet = createTestPet({ state: "idle", currentEnergy: 10 });
      expect(PetValidator.validateWorldAction(pet, 20)).toBe("Pet has insufficient energy for this activity.");
    });
  });

  describe("validateBattleAction", () => {
    it("should allow battle action for healthy energetic pet", () => {
      const pet = createTestPet({ health: "healthy", currentEnergy: 50 });
      expect(PetValidator.validateBattleAction(pet, 20)).toBeNull();
    });

    it("should prevent battle action for sick pet", () => {
      const pet = createTestPet({ health: "sick", currentEnergy: 50 });
      expect(PetValidator.validateBattleAction(pet, 20)).toBe("Pet is too sick to battle.");
    });

    it("should prevent battle action for tired pet", () => {
      const pet = createTestPet({ health: "healthy", currentEnergy: 10 });
      expect(PetValidator.validateBattleAction(pet, 20)).toBe("Pet has insufficient energy for this move.");
    });

    it("should allow battle action for injured but energetic pet", () => {
      const pet = createTestPet({ health: "injured", currentEnergy: 50 });
      expect(PetValidator.validateBattleAction(pet, 20)).toBeNull();
    });
  });
});

describe("GameMath", () => {
  describe("clamp", () => {
    it("should return value when within bounds", () => {
      expect(GameMath.clamp(50, 0, 100)).toBe(50);
    });

    it("should return min when value is below minimum", () => {
      expect(GameMath.clamp(-10, 0, 100)).toBe(0);
    });

    it("should return max when value is above maximum", () => {
      expect(GameMath.clamp(150, 0, 100)).toBe(100);
    });

    it("should handle equal min and max", () => {
      expect(GameMath.clamp(50, 75, 75)).toBe(75);
    });
  });

  describe("ticksToDisplayValue", () => {
    it("should convert ticks to display value correctly", () => {
      const ticks = 5000; // 50 * 100
      const multiplier = PET_CONSTANTS.STAT_MULTIPLIER.SATIETY; // 100
      expect(GameMath.ticksToDisplayValue(ticks, multiplier)).toBe(50);
    });

    it("should cap at 100", () => {
      const ticks = 30000; // Very high value
      const multiplier = PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
      expect(GameMath.ticksToDisplayValue(ticks, multiplier)).toBe(100);
    });

    it("should floor at 0", () => {
      const ticks = -100;
      const multiplier = PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
      expect(GameMath.ticksToDisplayValue(ticks, multiplier)).toBe(0);
    });
  });

  describe("displayValueToTicks", () => {
    it("should convert display value to ticks correctly", () => {
      const displayValue = 50;
      const multiplier = PET_CONSTANTS.STAT_MULTIPLIER.SATIETY; // 100
      expect(GameMath.displayValueToTicks(displayValue, multiplier)).toBe(5000);
    });

    it("should handle zero display value", () => {
      const displayValue = 0;
      const multiplier = PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
      expect(GameMath.displayValueToTicks(displayValue, multiplier)).toBe(0);
    });
  });

  describe("calculateSatietyDisplay", () => {
    it("should calculate satiety display correctly", () => {
      const ticks = 5000; // 50 * 100
      expect(GameMath.calculateSatietyDisplay(ticks)).toBe(50);
    });
  });

  describe("calculateHydrationDisplay", () => {
    it("should calculate hydration display correctly", () => {
      const ticks = 4000; // 50 * 80
      expect(GameMath.calculateHydrationDisplay(ticks)).toBe(50);
    });
  });

  describe("calculateHappinessDisplay", () => {
    it("should calculate happiness display correctly", () => {
      const ticks = 6000; // 50 * 120
      expect(GameMath.calculateHappinessDisplay(ticks)).toBe(50);
    });
  });

  describe("subtractEnergy", () => {
    it("should subtract energy normally", () => {
      expect(GameMath.subtractEnergy(50, 10)).toBe(40);
    });

    it("should not go below zero", () => {
      expect(GameMath.subtractEnergy(5, 10)).toBe(0);
    });

    it("should handle exact zero", () => {
      expect(GameMath.subtractEnergy(10, 10)).toBe(0);
    });
  });

  describe("addToStat", () => {
    it("should add to stat normally", () => {
      expect(GameMath.addToStat(50, 20, 100)).toBe(70);
    });

    it("should cap at maximum", () => {
      expect(GameMath.addToStat(90, 20, 100)).toBe(100);
    });

    it("should handle exact maximum", () => {
      expect(GameMath.addToStat(80, 20, 100)).toBe(100);
    });
  });

  describe("calculatePercentageHeal", () => {
    it("should calculate percentage heal correctly", () => {
      expect(GameMath.calculatePercentageHeal(100, 25)).toBe(25);
    });

    it("should floor the result", () => {
      expect(GameMath.calculatePercentageHeal(100, 33)).toBe(33); // 33.33 floored
    });

    it("should handle zero percentage", () => {
      expect(GameMath.calculatePercentageHeal(100, 0)).toBe(0);
    });
  });

  describe("randomBetween", () => {
    it("should generate number within range", () => {
      for (let i = 0; i < 100; i++) {
        const result = GameMath.randomBetween(5, 10);
        expect(result).toBeGreaterThanOrEqual(5);
        expect(result).toBeLessThanOrEqual(10);
      }
    });

    it("should handle single value range", () => {
      expect(GameMath.randomBetween(5, 5)).toBe(5);
    });
  });

  describe("randomChance", () => {
    it("should always succeed with probability 1", () => {
      expect(GameMath.randomChance(1)).toBe(true);
    });

    it("should never succeed with probability 0", () => {
      expect(GameMath.randomChance(0)).toBe(false);
    });

    it("should work with probability 0.5", () => {
      let successes = 0;
      const trials = 1000;
      
      for (let i = 0; i < trials; i++) {
        if (GameMath.randomChance(0.5)) {
          successes++;
        }
      }
      
      // Should be roughly 50% (allowing for randomness)
      expect(successes).toBeGreaterThan(400);
      expect(successes).toBeLessThan(600);
    });
  });

  describe("calculateDamage", () => {
    it("should calculate basic damage correctly", () => {
      const damage = GameMath.calculateDamage(20, 10, 50, false);
      expect(damage).toBeGreaterThanOrEqual(1);
      expect(damage).toBeGreaterThan(50); // Should be more than move power due to ratio
    });

    it("should apply critical hit multiplier", () => {
      const normalDamage = GameMath.calculateDamage(20, 10, 50, false);
      const criticalDamage = GameMath.calculateDamage(20, 10, 50, true);
      expect(criticalDamage).toBeGreaterThan(normalDamage);
    });

    it("should ensure minimum damage of 1", () => {
      const damage = GameMath.calculateDamage(1, 1000, 1, false);
      expect(damage).toBe(1);
    });
  });

  describe("calculateAccuracy", () => {
    it("should return base accuracy when stats are equal", () => {
      expect(GameMath.calculateAccuracy(90, 10, 10)).toBe(90);
    });

    it("should increase accuracy with higher attacker accuracy", () => {
      expect(GameMath.calculateAccuracy(90, 20, 10)).toBe(91);
    });

    it("should decrease accuracy with higher defender evasion", () => {
      expect(GameMath.calculateAccuracy(90, 10, 20)).toBe(89);
    });

    it("should clamp between 5 and 100", () => {
      expect(GameMath.calculateAccuracy(90, 0, 1000)).toBe(5);
      expect(GameMath.calculateAccuracy(90, 1000, 0)).toBe(100);
    });
  });
});

describe("EnergyManager", () => {
  const createTestPet = (overrides: Partial<Pet> = {}): Pet => ({
    id: "test-pet",
    name: "Test Pet",
    species: "starter_dog",
    rarity: "common",
    growthStage: 0,
    satiety: 50,
    hydration: 50,
    happiness: 50,
    satietyTicksLeft: 50 * 100,
    hydrationTicksLeft: 50 * 80,
    happinessTicksLeft: 50 * 120,
    poopTicksLeft: 2000,
    sickByPoopTicksLeft: 17280,
    life: 1000000,
    maxEnergy: 100,
    currentEnergy: 50,
    health: "healthy",
    state: "idle",
    attack: 10,
    defense: 10,
    speed: 10,
    maxHealth: 100,
    currentHealth: 100,
    moves: [],
    level: 1,
    experience: 0,
    experienceToNext: 100,
    lastCareTime: Date.now(),
    createdAt: Date.now(),
    lifetime: 0,
    ...overrides,
  });

  describe("hasEnoughEnergy", () => {
    it("should return true when pet has enough energy", () => {
      const pet = createTestPet({ currentEnergy: 50 });
      expect(EnergyManager.hasEnoughEnergy(pet, 30)).toBe(true);
    });

    it("should return false when pet has insufficient energy", () => {
      const pet = createTestPet({ currentEnergy: 20 });
      expect(EnergyManager.hasEnoughEnergy(pet, 30)).toBe(false);
    });

    it("should return true when pet has exactly required energy", () => {
      const pet = createTestPet({ currentEnergy: 30 });
      expect(EnergyManager.hasEnoughEnergy(pet, 30)).toBe(true);
    });
  });

  describe("deductEnergy", () => {
    it("should deduct energy from pet", () => {
      const pet = createTestPet({ currentEnergy: 50 });
      EnergyManager.deductEnergy(pet, 20);
      expect(pet.currentEnergy).toBe(30);
    });

    it("should not go below zero", () => {
      const pet = createTestPet({ currentEnergy: 10 });
      EnergyManager.deductEnergy(pet, 20);
      expect(pet.currentEnergy).toBe(0);
    });

    it("should handle exact energy cost", () => {
      const pet = createTestPet({ currentEnergy: 30 });
      EnergyManager.deductEnergy(pet, 30);
      expect(pet.currentEnergy).toBe(0);
    });
  });

  describe("calculateTravelCost", () => {
    it("should calculate correct travel cost", () => {
      expect(EnergyManager.calculateTravelCost(100)).toBe(25);
    });

    it("should handle small travel times", () => {
      expect(EnergyManager.calculateTravelCost(3)).toBe(0);
    });

    it("should handle large travel times", () => {
      expect(EnergyManager.calculateTravelCost(400)).toBe(100);
    });
  });

  describe("validateAndDeductEnergy", () => {
    it("should succeed and deduct energy when sufficient", () => {
      const pet = createTestPet({ currentEnergy: 50 });
      const result = EnergyManager.validateAndDeductEnergy(pet, 20, "test action");
      expect(result).toBeNull();
      expect(pet.currentEnergy).toBe(30);
    });

    it("should fail when insufficient energy", () => {
      const pet = createTestPet({ currentEnergy: 10 });
      const result = EnergyManager.validateAndDeductEnergy(pet, 20, "test action");
      expect(result).toBe("Pet doesn't have enough energy for test action.");
      expect(pet.currentEnergy).toBe(10); // Should not be modified
    });

    it("should handle exact energy requirement", () => {
      const pet = createTestPet({ currentEnergy: 30 });
      const result = EnergyManager.validateAndDeductEnergy(pet, 30, "exact action");
      expect(result).toBeNull();
      expect(pet.currentEnergy).toBe(0);
    });
  });

  describe("ERROR_MESSAGES", () => {
    it("should have correct static error messages", () => {
      expect(EnergyManager.ERROR_MESSAGES.TRAVEL).toBe("Pet doesn't have enough energy for this journey");
      expect(EnergyManager.ERROR_MESSAGES.ACTIVITY).toBe("Pet doesn't have enough energy for this activity");
      expect(EnergyManager.ERROR_MESSAGES.BATTLE).toBe("Insufficient energy for this move");
      expect(EnergyManager.ERROR_MESSAGES.PLAY).toBe("Pet doesn't have enough energy to play");
    });

    it("should generate dynamic error messages", () => {
      expect(EnergyManager.ERROR_MESSAGES.GENERAL("custom action")).toBe("Pet doesn't have enough energy for custom action");
    });
  });
});