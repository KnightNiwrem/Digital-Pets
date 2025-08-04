// Unit tests for PetSystem using bun:test

import { describe, test, expect, beforeEach } from "bun:test";
import { PetSystem } from "@/systems/PetSystem";
import type { Pet, PetSpecies } from "@/types";
import { PET_CONSTANTS } from "@/types";

// Test helper to create a standard test pet
function createTestPet(overrides: Partial<Pet> = {}): Pet {
  const testSpecies: PetSpecies = {
    id: "test_species",
    name: "Test Pet",
    rarity: "common",
    description: "A pet for testing",
    baseStats: { attack: 10, defense: 8, speed: 12, health: 50 },
    growthRates: { attack: 1.1, defense: 1.1, speed: 1.1, health: 1.2, energy: 1.1 },
    sprite: "test.png",
    icon: "test_icon.png",
  };

  return {
    id: "test_pet_1",
    name: "Test",
    species: testSpecies,
    rarity: "common",
    growthStage: 0,

    // Care stats
    satiety: 50,
    hydration: 50,
    happiness: 50,

    // Hidden counters
    satietyTicksLeft: 5000,
    hydrationTicksLeft: 4000,
    happinessTicksLeft: 6000,
    poopTicksLeft: 240,
    poopCount: 0,
    sickByPoopTicksLeft: PET_CONSTANTS.SICK_BY_POOP_TICKS,

    // Core stats
    life: PET_CONSTANTS.MAX_LIFE,
    maxEnergy: 100,
    currentEnergy: 100,
    health: "healthy",
    state: "idle",

    // Battle stats
    attack: 10,
    defense: 8,
    speed: 12,
    maxHealth: 50,
    currentHealth: 50,
    moves: [],

    // Metadata
    birthTime: Date.now(),
    lastCareTime: Date.now(),
    totalLifetime: 0,

    ...overrides,
  };
}

describe("PetSystem - Proposal Generation", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = createTestPet();
  });

  describe("generateCareProposals", () => {
    test("should generate feed proposal with correct values", () => {
      pet.satiety = 30;
      const proposals = PetSystem.generateCareProposals(pet, "feed", 25);
      
      expect(proposals).toHaveLength(1);
      expect(proposals[0].description).toContain("Feed pet (25 satiety)");
      
      const satietyChange = proposals[0].changes.find(c => c.property === "satietyTicksLeft");
      const careTimeChange = proposals[0].changes.find(c => c.property === "lastCareTime");
      expect(satietyChange).toBeDefined();
      expect(careTimeChange).toBeDefined();
    });

    test("should generate drink proposal with correct values", () => {
      pet.hydration = 30;
      const proposals = PetSystem.generateCareProposals(pet, "drink", 30);
      
      expect(proposals).toHaveLength(1);
      expect(proposals[0].description).toContain("Give drink to pet (30 hydration)");
      
      const hydrationChange = proposals[0].changes.find(c => c.property === "hydrationTicksLeft");
      expect(hydrationChange).toBeDefined();
    });

    test("should generate play proposal with energy cost", () => {
      pet.happiness = 30;
      pet.currentEnergy = 50;
      const proposals = PetSystem.generateCareProposals(pet, "play", 20);
      
      expect(proposals).toHaveLength(1);
      expect(proposals[0].description).toContain("Play with pet (20 happiness)");
      
      const happinessChange = proposals[0].changes.find(c => c.property === "happinessTicksLeft");
      const energyChange = proposals[0].changes.find(c => c.property === "currentEnergy");
      expect(happinessChange).toBeDefined();
      expect(energyChange).toBeDefined();
    });

    test("should generate clean proposal", () => {
      pet.poopCount = 2;
      const proposals = PetSystem.generateCareProposals(pet, "clean");
      
      expect(proposals).toHaveLength(1);
      expect(proposals[0].description).toBe("Clean pet");
      
      const poopChange = proposals[0].changes.find(c => c.property === "poopCount");
      const sickChange = proposals[0].changes.find(c => c.property === "sickByPoopTicksLeft");
      expect(poopChange?.newValue).toBe(0);
      expect(sickChange?.newValue).toBe(PET_CONSTANTS.SICK_BY_POOP_TICKS);
    });

    test("should generate medicine proposal with cure effect", () => {
      pet.health = "sick";
      const effects = [{ type: "cure" as const, value: 0 }];
      const proposals = PetSystem.generateCareProposals(pet, "medicine", undefined, effects);
      
      expect(proposals).toHaveLength(1);
      
      const healthChange = proposals[0].changes.find(c => c.property === "health");
      expect(healthChange?.newValue).toBe("healthy");
    });

    test("should generate sleep proposal", () => {
      pet.state = "idle";
      const proposals = PetSystem.generateCareProposals(pet, "sleep");
      
      expect(proposals).toHaveLength(1);
      
      const stateChange = proposals[0].changes.find(c => c.property === "state");
      expect(stateChange?.newValue).toBe("sleeping");
    });

    test("should generate wake proposal", () => {
      pet.state = "sleeping";
      const proposals = PetSystem.generateCareProposals(pet, "wake");
      
      expect(proposals).toHaveLength(1);
      
      const stateChange = proposals[0].changes.find(c => c.property === "state");
      expect(stateChange?.newValue).toBe("idle");
    });
  });

  describe("validateCareProposal", () => {
    test("should validate feed proposal successfully for hungry pet", () => {
      pet.satiety = 30;
      const proposals = PetSystem.generateCareProposals(pet, "feed", 25);
      const validation = PetSystem.validateCareProposal(proposals[0], pet, "feed");
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test("should reject feed proposal for full pet", () => {
      pet.satiety = 100;
      const proposals = PetSystem.generateCareProposals(pet, "feed", 25);
      const validation = PetSystem.validateCareProposal(proposals[0], pet, "feed");
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Pet is not hungry right now");
    });

    test("should reject play proposal for pet with insufficient energy", () => {
      pet.currentEnergy = 5;
      const proposals = PetSystem.generateCareProposals(pet, "play", 20);
      const validation = PetSystem.validateCareProposal(proposals[0], pet, "play");
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Pet has insufficient energy to play");
    });

    test("should reject clean proposal when no poop", () => {
      pet.poopCount = 0;
      const proposals = PetSystem.generateCareProposals(pet, "clean");
      const validation = PetSystem.validateCareProposal(proposals[0], pet, "clean");
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("There's no poop to clean right now");
    });

    test("should reject actions on dead pet", () => {
      pet.life = 0;
      const proposals = PetSystem.generateCareProposals(pet, "feed", 25);
      const validation = PetSystem.validateCareProposal(proposals[0], pet, "feed");
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Cannot perform actions on a deceased pet");
    });
  });

  describe("applyCareChanges", () => {
    test("should apply changes directly to pet", () => {
      const originalSatiety = pet.satietyTicksLeft;
      const changes = { satietyTicksLeft: originalSatiety + 1000, lastCareTime: Date.now() };
      
      PetSystem.applyCareChanges(pet, changes);
      
      expect(pet.satietyTicksLeft).toBe(originalSatiety + 1000);
      expect(pet.lastCareTime).toBe(changes.lastCareTime);
    });
  });

  describe("isActionEffective", () => {
    test("should return true for feed when pet is hungry", () => {
      pet.satiety = 50;
      expect(PetSystem.isActionEffective(pet, "feed")).toBe(true);
    });

    test("should return false for feed when pet is full", () => {
      pet.satiety = 100;
      expect(PetSystem.isActionEffective(pet, "feed")).toBe(false);
    });

    test("should return true for clean when pet has poop", () => {
      pet.poopCount = 1;
      expect(PetSystem.isActionEffective(pet, "clean")).toBe(true);
    });

    test("should return false for clean when pet is clean", () => {
      pet.poopCount = 0;
      expect(PetSystem.isActionEffective(pet, "clean")).toBe(false);
    });
  });
});

describe("PetSystem - Tick Processing", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = createTestPet();
  });

  test("should decrement hidden counters each tick", () => {
    const initialSatiety = pet.satietyTicksLeft;
    const initialHydration = pet.hydrationTicksLeft;
    const initialHappiness = pet.happinessTicksLeft;

    PetSystem.processPetTick(pet);

    expect(pet.satietyTicksLeft).toBe(initialSatiety - 1);
    expect(pet.hydrationTicksLeft).toBe(initialHydration - 1);
    expect(pet.happinessTicksLeft).toBe(initialHappiness - 1);
  });

  test("should update displayed stats based on tick counters", () => {
    pet.satietyTicksLeft = 100; // Should result in very low satiety
    pet.hydrationTicksLeft = 80;
    pet.happinessTicksLeft = 120;

    PetSystem.processPetTick(pet);

    expect(pet.satiety).toBe(Math.ceil(99 / PET_CONSTANTS.STAT_MULTIPLIER.SATIETY));
    expect(pet.hydration).toBe(Math.ceil(79 / PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION));
    expect(pet.happiness).toBe(Math.ceil(119 / PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS));
  });

  test("should handle pet pooping and increment poop count", () => {
    pet.poopTicksLeft = 1;
    pet.poopCount = 0; // No existing poop

    const changes = PetSystem.processPetTick(pet);

    expect(changes).toContain("pet_pooped");
    expect(pet.poopTicksLeft).toBeGreaterThan(0);
    expect(pet.poopCount).toBe(1); // Poop count incremented
  });

  test("should increment poop count when pooping with existing uncleaned poop", () => {
    pet.poopTicksLeft = 1;
    pet.poopCount = 2; // Already has uncleaned poop

    const changes = PetSystem.processPetTick(pet);

    expect(changes).toContain("pet_pooped");
    expect(pet.poopCount).toBe(3); // Poop count incremented
  });

  test("should accelerate sickness countdown with more poop", () => {
    pet.poopCount = 3;
    pet.sickByPoopTicksLeft = 100;

    PetSystem.processPetTick(pet);

    // Should decrement by (2 * poopCount) = 6
    expect(pet.sickByPoopTicksLeft).toBe(94);
  });

  test("should not accelerate sickness countdown with no poop", () => {
    pet.poopCount = 0;
    pet.sickByPoopTicksLeft = 100;

    PetSystem.processPetTick(pet);

    // Should decrement by normal 1
    expect(pet.sickByPoopTicksLeft).toBe(100);
  });

  test("should make pet sick from uncleaned poop", () => {
    pet.sickByPoopTicksLeft = 1;
    pet.poopCount = 1;
    pet.health = "healthy";

    const changes = PetSystem.processPetTick(pet);

    expect(changes).toContain("pet_sick_from_poop");
    expect(pet.health as string).toEqual("sick");
    expect(pet.sickByPoopTicksLeft).toBe(PET_CONSTANTS.SICK_BY_POOP_TICKS);
  });

  test("should decrease life when pet is sick", () => {
    pet.health = "sick";
    const initialLife = pet.life;

    PetSystem.processPetTick(pet);

    expect(pet.life).toBe(initialLife - PET_CONSTANTS.LIFE_DECREASE.sick);
  });

  test("should decrease life when pet has no satiety", () => {
    pet.satiety = 0;
    pet.satietyTicksLeft = 0;
    const initialLife = pet.life;

    PetSystem.processPetTick(pet);

    expect(pet.life).toBe(initialLife - PET_CONSTANTS.LIFE_DECREASE.noSatiety);
  });

  test("should decrease life when pet has no hydration", () => {
    pet.hydration = 0;
    pet.hydrationTicksLeft = 0;
    const initialLife = pet.life;

    PetSystem.processPetTick(pet);

    expect(pet.life).toBe(initialLife - PET_CONSTANTS.LIFE_DECREASE.noHydration);
  });

  test("should recover life when pet is healthy", () => {
    pet.health = "healthy";
    pet.satiety = 50;
    pet.hydration = 50;
    pet.life = 500000; // Less than max
    const initialLife = pet.life;

    PetSystem.processPetTick(pet);

    expect(pet.life).toBe(initialLife + PET_CONSTANTS.LIFE_RECOVERY);
  });

  test("should handle pet death", () => {
    pet.life = 1;
    pet.health = "sick";

    const changes = PetSystem.processPetTick(pet);

    expect(changes).toContain("pet_died");
    expect(pet.life).toBe(0);
  });

  test("should recover energy during sleep", () => {
    pet.state = "sleeping";
    pet.currentEnergy = 50;
    const initialEnergy = pet.currentEnergy;

    const changes = PetSystem.processPetTick(pet);

    expect(pet.currentEnergy).toBeGreaterThan(initialEnergy);
    expect(changes).toContain("energy_recovered");
  });

  test("should not recover energy when not sleeping", () => {
    pet.state = "idle";
    pet.currentEnergy = 50;
    const initialEnergy = pet.currentEnergy;

    const changes = PetSystem.processPetTick(pet);

    expect(pet.currentEnergy).toBe(initialEnergy);
    expect(changes).not.toContain("energy_recovered");
  });

  test("should handle pet growth", () => {
    pet.totalLifetime = 9999;
    pet.growthStage = 0;

    const changes = PetSystem.processPetTick(pet);

    expect(changes).toContain("pet_grew");
    expect(pet.growthStage).toBe(1);
    expect(pet.maxEnergy).toBeGreaterThan(100);
  });

  test("should increment lifetime each tick", () => {
    const initialLifetime = pet.totalLifetime;

    PetSystem.processPetTick(pet);

    expect(pet.totalLifetime).toBe(initialLifetime + 1);
  });
});

describe("PetSystem - Status and Events", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = createTestPet();
  });

  describe("getPetStatus", () => {
    test("should return excellent status for healthy pet", () => {
      pet.satiety = 100;
      pet.hydration = 100;
      pet.happiness = 100;
      pet.currentEnergy = 100;
      pet.health = "healthy";

      const status = PetSystem.getPetStatus(pet);

      expect(status.overall).toBe("excellent");
      expect(status.needs).toHaveLength(0);
      expect(status.warnings).toHaveLength(0);
    });

    test("should identify food need when satiety is low", () => {
      pet.satiety = 15;

      const status = PetSystem.getPetStatus(pet);

      expect(status.needs).toContain("food");
      expect(status.overall).toBe("good");
    });

    test("should identify water need when hydration is low", () => {
      pet.hydration = 15;

      const status = PetSystem.getPetStatus(pet);

      expect(status.needs).toContain("water");
    });

    test("should identify attention need when happiness is low", () => {
      pet.happiness = 15;

      const status = PetSystem.getPetStatus(pet);

      expect(status.needs).toContain("attention");
    });

    test("should identify rest need when energy is low", () => {
      pet.currentEnergy = 15;

      const status = PetSystem.getPetStatus(pet);

      expect(status.needs).toContain("rest");
    });

    test("should warn about sick pet", () => {
      pet.health = "sick";

      const status = PetSystem.getPetStatus(pet);

      expect(status.warnings).toContain("Pet is sick");
    });

    test("should warn about single poop", () => {
      pet.poopCount = 1;

      const status = PetSystem.getPetStatus(pet);

      expect(status.warnings).toContain("Pet needs cleaning");
    });

    test("should warn about multiple poops with count", () => {
      pet.poopCount = 3;

      const status = PetSystem.getPetStatus(pet);

      expect(status.warnings).toContain("Pet needs cleaning (3 poops)");
    });

    test("should not warn about poop when clean", () => {
      pet.poopCount = 0;

      const status = PetSystem.getPetStatus(pet);

      expect(status.warnings).not.toContain("Pet needs cleaning");
      expect(status.warnings.some(w => w.includes("poops"))).toBe(false);
    });

    test("should warn about critically low life", () => {
      pet.life = PET_CONSTANTS.MAX_LIFE * 0.1;

      const status = PetSystem.getPetStatus(pet);

      expect(status.warnings).toContain("Pet's life is critically low");
    });

    test("should return critical status for dead pet", () => {
      pet.life = 0;

      const status = PetSystem.getPetStatus(pet);

      expect(status.overall).toBe("critical");
    });

    test("should return poor status for multiple problems", () => {
      pet.satiety = 10;
      pet.hydration = 10;
      pet.happiness = 10;
      pet.health = "sick";

      const status = PetSystem.getPetStatus(pet);

      expect(status.overall).toBe("poor");
    });
  });

  describe("getNextCriticalEvent", () => {
    test("should return soonest critical event", () => {
      pet.satietyTicksLeft = 100;
      pet.hydrationTicksLeft = 50; // This should be soonest
      pet.happinessTicksLeft = 200;
      pet.poopTicksLeft = 150;

      const event = PetSystem.getNextCriticalEvent(pet);

      expect(event).toBeTruthy();
      expect(event?.event).toBe("hydration_will_reach_zero");
      expect(event?.ticksRemaining).toBe(50);
      expect(event?.severity).toBe("critical");
    });

    test("should return null when no events are pending", () => {
      pet.satietyTicksLeft = 0;
      pet.hydrationTicksLeft = 0;
      pet.happinessTicksLeft = 0;
      pet.poopTicksLeft = 0;
      pet.sickByPoopTicksLeft = 0;

      const event = PetSystem.getNextCriticalEvent(pet);

      expect(event).toBeNull();
    });

    test("should identify poop event with correct severity", () => {
      pet.poopTicksLeft = 10;
      pet.satietyTicksLeft = 100;
      pet.hydrationTicksLeft = 100;
      pet.happinessTicksLeft = 100;
      pet.sickByPoopTicksLeft = 100;

      const event = PetSystem.getNextCriticalEvent(pet);

      expect(event?.event).toBe("pet_will_poop");
      expect(event?.severity).toBe("low");
    });
  });

  describe("calculateDisplayStats", () => {
    test("should calculate display stats from tick counters", () => {
      pet.satietyTicksLeft = 1000;
      pet.hydrationTicksLeft = 800;
      pet.happinessTicksLeft = 1200;
      pet.poopCount = 2;

      const stats = PetSystem.calculateDisplayStats(pet);

      expect(stats.satiety).toBeGreaterThan(0);
      expect(stats.hydration).toBeGreaterThan(0);
      expect(stats.happiness).toBeGreaterThan(0);
      expect(stats.needsPoop).toBe(true);
    });

    test("should indicate no poop needed when clean", () => {
      pet.poopCount = 0;

      const stats = PetSystem.calculateDisplayStats(pet);

      expect(stats.needsPoop).toBe(false);
    });
  });
});

describe("PetSystem - Edge Cases", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = createTestPet();
  });

  test("should handle maximum growth stage", () => {
    pet.growthStage = PET_CONSTANTS.GROWTH_STAGES - 1;
    pet.totalLifetime = 999999;

    const changes = PetSystem.processPetTick(pet);

    expect(changes).not.toContain("pet_grew");
    expect(pet.growthStage).toBe(PET_CONSTANTS.GROWTH_STAGES - 1);
  });

  test("should prevent stats from going below zero", () => {
    pet.satietyTicksLeft = 0;
    pet.hydrationTicksLeft = 0;
    pet.happinessTicksLeft = 0;

    PetSystem.processPetTick(pet);

    expect(pet.satietyTicksLeft).toBe(0);
    expect(pet.hydrationTicksLeft).toBe(0);
    expect(pet.happinessTicksLeft).toBe(0);
  });

  test("should prevent life from going above maximum", () => {
    pet.life = PET_CONSTANTS.MAX_LIFE;
    pet.health = "healthy";

    PetSystem.processPetTick(pet);

    expect(pet.life).toBeLessThanOrEqual(PET_CONSTANTS.MAX_LIFE);
  });

  test("should prevent energy from going above maximum", () => {
    pet.state = "sleeping";
    pet.currentEnergy = pet.maxEnergy;

    PetSystem.processPetTick(pet);

    expect(pet.currentEnergy).toBeLessThanOrEqual(pet.maxEnergy);
  });

  test("should handle multiple life decrease conditions", () => {
    pet.health = "sick";
    pet.satiety = 0;
    pet.satietyTicksLeft = 0;
    pet.hydration = 0;
    pet.hydrationTicksLeft = 0;
    const initialLife = pet.life;

    PetSystem.processPetTick(pet);

    const expectedDecrease =
      PET_CONSTANTS.LIFE_DECREASE.sick +
      PET_CONSTANTS.LIFE_DECREASE.noSatiety +
      PET_CONSTANTS.LIFE_DECREASE.noHydration;

    expect(pet.life).toBe(Math.max(0, initialLife - expectedDecrease));
  });
});
