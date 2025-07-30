// Test for investigating the specific scenario that might cause Issue 1

import { describe, it, expect } from "bun:test";
import { PetSystem } from "@/systems/PetSystem";
import { GameMath } from "@/lib/utils";
import { PET_CONSTANTS } from "@/types";
import { WILD_BEAST } from "@/data/pets";
import type { Pet } from "@/types";

// Helper to create a pet with specific tick/display values to test consistency
function createPetWithStats(satietyTicks: number, hydrationTicks: number, happinessTicks: number): Pet {
  return {
    id: "test-pet",
    name: "Test Pet",
    species: WILD_BEAST,
    rarity: "common",
    birthTime: Date.now(),
    lastCareTime: Date.now(),
    totalLifetime: 0,
    growthStage: 0,

    // Calculate display values from ticks to ensure consistency
    satiety: GameMath.calculateSatietyDisplay(satietyTicks),
    hydration: GameMath.calculateHydrationDisplay(hydrationTicks),  
    happiness: GameMath.calculateHappinessDisplay(happinessTicks),

    // Hidden Counters
    satietyTicksLeft: satietyTicks,
    hydrationTicksLeft: hydrationTicks,
    happinessTicksLeft: happinessTicks,
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

describe("Issue 1 Investigation: Stats Consistency and Increase", () => {
  describe("Stat Calculation Consistency", () => {
    it("should maintain consistency between tick values and display values", () => {
      // Test different tick values and their display equivalents
      const testCases = [
        { ticks: 5000, expected: 50, multiplier: PET_CONSTANTS.STAT_MULTIPLIER.SATIETY },
        { ticks: 4000, expected: 50, multiplier: PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION },
        { ticks: 6000, expected: 50, multiplier: PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS },
      ];

      testCases.forEach(({ ticks, expected, multiplier }) => {
        const displayValue = GameMath.ticksToDisplayValue(ticks, multiplier);
        expect(displayValue).toBe(expected);
        
        // Reverse calculation should be consistent
        const backToTicks = GameMath.displayValueToTicks(displayValue, multiplier);
        expect(backToTicks).toBe(displayValue * multiplier);
      });
    });

    it("should handle edge cases in stat calculations", () => {
      // Test edge cases that might cause inconsistencies
      const edgeCases = [
        { ticks: 1, multiplier: 100 }, // Very low ticks
        { ticks: 9999, multiplier: 100 }, // High ticks
        { ticks: 0, multiplier: 100 }, // Zero ticks
      ];

      edgeCases.forEach(({ ticks, multiplier }) => {
        const display = GameMath.ticksToDisplayValue(ticks, multiplier);
        expect(display).toBeGreaterThanOrEqual(0);
        expect(display).toBeLessThanOrEqual(100);
      });
    });
  });

  describe("Care Action Stat Increases", () => {
    it("should increase satiety correctly with various starting values", () => {
      // Test with pet at 50% satiety
      const pet = createPetWithStats(5000, 4000, 6000); // 50 display values
      expect(pet.satiety).toBe(50);
      
      const result = PetSystem.feedPet(pet, 20);
      expect(result.success).toBe(true);
      expect(pet.satiety).toBeGreaterThan(50);
      expect(pet.satiety).toBeLessThanOrEqual(100);
      
      // Verify tick consistency after feeding
      const expectedDisplay = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
      expect(pet.satiety).toBe(expectedDisplay);
    });

    it("should increase hydration correctly with various starting values", () => {
      // Test with pet at different hydration levels
      const pet = createPetWithStats(5000, 3200, 6000); // 40 hydration
      expect(pet.hydration).toBe(40);
      
      const result = PetSystem.giveDrink(pet, 25);
      expect(result.success).toBe(true);
      expect(pet.hydration).toBeGreaterThan(40);
      expect(pet.hydration).toBeLessThanOrEqual(100);
      
      // Verify tick consistency after drinking
      const expectedDisplay = GameMath.calculateHydrationDisplay(pet.hydrationTicksLeft);
      expect(pet.hydration).toBe(expectedDisplay);
    });

    it("should increase happiness correctly with various starting values", () => {
      // Test with pet at different happiness levels
      const pet = createPetWithStats(5000, 4000, 7200); // 60 happiness
      expect(pet.happiness).toBe(60);
      
      const result = PetSystem.playWithPet(pet, 15, 10);
      expect(result.success).toBe(true);
      expect(pet.happiness).toBeGreaterThan(60);
      expect(pet.happiness).toBeLessThanOrEqual(100);
      
      // Verify tick consistency after playing
      const expectedDisplay = GameMath.calculateHappinessDisplay(pet.happinessTicksLeft);
      expect(pet.happiness).toBe(expectedDisplay);
    });
  });

  describe("Potential Issue Scenarios", () => {
    it("should handle the case where display values don't match tick values", () => {
      // Create a pet with intentionally inconsistent display vs tick values
      // This might happen after save/load or tick processing
      const pet = createPetWithStats(5000, 4000, 6000);
      
      // Manually set display values to be inconsistent (simulating potential bug condition)
      pet.satiety = 30; // Should be 50 based on ticks
      pet.hydration = 25; // Should be 50 based on ticks
      pet.happiness = 35; // Should be 50 based on ticks
      
      // Test feeding - this should work based on ticks, not display values
      const feedResult = PetSystem.feedPet(pet, 20);
      expect(feedResult.success).toBe(true);
      
      // After feeding, display should be recalculated and consistent
      const expectedSatiety = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
      expect(pet.satiety).toBe(expectedSatiety);
      expect(pet.satiety).toBeGreaterThan(50); // Should increase from actual tick value
    });

    it("should handle very small stat increases", () => {
      // Test with pet very close to full to test edge cases
      // Use tick values that give exactly 99 display value
      const pet = createPetWithStats(9900, 7920, 11880); // 99, 99, 99 display values
      expect(pet.satiety).toBe(99);   // 9900 / 100 = 99
      expect(pet.hydration).toBe(99); // 7920 / 80 = 99  
      expect(pet.happiness).toBe(99); // 11880 / 120 = 99
      
      // Try small increases
      const feedResult = PetSystem.feedPet(pet, 1);
      expect(feedResult.success).toBe(true);
      expect(pet.satiety).toBe(100); // Should cap at 100
      
      const drinkResult = PetSystem.giveDrink(pet, 1);
      expect(drinkResult.success).toBe(true);
      expect(pet.hydration).toBe(100);
      
      const playResult = PetSystem.playWithPet(pet, 1, 5);
      expect(playResult.success).toBe(true);
      expect(pet.happiness).toBe(100);
    });

    it("should prevent increases when stats are already at maximum", () => {
      // Test with pet at maximum stats
      const pet = createPetWithStats(10000, 8000, 12000); // 100, 100, 100 display values
      expect(pet.satiety).toBe(100);
      expect(pet.hydration).toBe(100);
      expect(pet.happiness).toBe(100);
      
      // All care actions should fail when stats are full
      const feedResult = PetSystem.feedPet(pet, 20);
      expect(feedResult.success).toBe(false);
      expect(feedResult.error).toContain("not hungry");
      
      const drinkResult = PetSystem.giveDrink(pet, 20);
      expect(drinkResult.success).toBe(false);
      expect(drinkResult.error).toContain("not dehydrated");
      
      const playResult = PetSystem.playWithPet(pet, 20, 10);
      expect(playResult.success).toBe(false);
      expect(playResult.error).toContain("already very happy");
    });
  });
});