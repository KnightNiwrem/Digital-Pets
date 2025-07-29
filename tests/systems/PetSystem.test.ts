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

describe("PetSystem - Pet Care Actions", () => {
  let pet: Pet;

  beforeEach(() => {
    pet = createTestPet();
  });

  describe("feedPet", () => {
    test("should successfully feed a hungry pet", () => {
      pet.satiety = 30;
      pet.satietyTicksLeft = 3000;

      const result = PetSystem.feedPet(pet, 25);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("feed");
      expect(pet.satiety).toBeGreaterThan(30);
      expect(pet.satietyTicksLeft).toBeGreaterThan(3000);
    });

    test("should fail to feed a sick pet", () => {
      pet.health = "sick";
      pet.satiety = 30;

      const result = PetSystem.feedPet(pet, 25);

      expect(result.success).toBe(false);
      expect(result.error).toContain("too sick to eat");
    });

    test("should fail to feed a full pet", () => {
      pet.satiety = 100;

      const result = PetSystem.feedPet(pet, 25);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not hungry");
    });

    test("should cap satiety at maximum", () => {
      pet.satiety = 90;

      const result = PetSystem.feedPet(pet, 50);

      expect(result.success).toBe(true);
      expect(pet.satiety).toBeLessThanOrEqual(100);
    });

    test("should update lastCareTime", async () => {
      const beforeTime = pet.lastCareTime;
      pet.satiety = 30;

      // Add small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));

      PetSystem.feedPet(pet, 25);

      expect(pet.lastCareTime).toBeGreaterThan(beforeTime);
    });
  });

  describe("giveDrink", () => {
    test("should successfully give drink to thirsty pet", () => {
      pet.hydration = 30;
      pet.hydrationTicksLeft = 2400;

      const result = PetSystem.giveDrink(pet, 30);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("drink");
      expect(pet.hydration).toBeGreaterThan(30);
      expect(pet.hydrationTicksLeft).toBeGreaterThan(2400);
    });

    test("should fail to give drink to sick pet", () => {
      pet.health = "sick";
      pet.hydration = 30;

      const result = PetSystem.giveDrink(pet, 30);

      expect(result.success).toBe(false);
      expect(result.error).toContain("too sick to drink");
    });

    test("should fail to give drink to pet that's not thirsty", () => {
      pet.hydration = 100;

      const result = PetSystem.giveDrink(pet, 30);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not thirsty");
    });
  });

  describe("playWithPet", () => {
    test("should successfully play with pet", () => {
      pet.happiness = 30;
      pet.currentEnergy = 50;
      const initialEnergy = pet.currentEnergy;

      const result = PetSystem.playWithPet(pet, 20, 15);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("play");
      expect(result.data?.energyCost).toBe(15);
      expect(pet.happiness).toBeGreaterThan(30);
      expect(pet.currentEnergy).toBe(initialEnergy - 15);
    });

    test("should fail when pet has insufficient energy", () => {
      pet.currentEnergy = 5;

      const result = PetSystem.playWithPet(pet, 20, 10);

      expect(result.success).toBe(false);
      expect(result.error).toContain("doesn't have enough energy");
    });

    test("should fail when pet is sick", () => {
      pet.health = "sick";
      pet.currentEnergy = 50;

      const result = PetSystem.playWithPet(pet, 20);

      expect(result.success).toBe(false);
      expect(result.error).toContain("too sick to play");
    });

    test("should fail when pet is already very happy", () => {
      pet.happiness = 100;
      pet.currentEnergy = 50;

      const result = PetSystem.playWithPet(pet, 20);

      expect(result.success).toBe(false);
      expect(result.error).toContain("already very happy");
    });
  });

  describe("cleanPoop", () => {
    test("should successfully clean poop when needed", () => {
      pet.poopTicksLeft = 0; // Pet has pooped

      const result = PetSystem.cleanPoop(pet);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("clean");
      expect(pet.poopTicksLeft).toBeGreaterThan(0);
      expect(pet.sickByPoopTicksLeft).toBe(PET_CONSTANTS.SICK_BY_POOP_TICKS);
    });

    test("should fail when there's no poop to clean", () => {
      pet.poopTicksLeft = 100; // No poop yet

      const result = PetSystem.cleanPoop(pet);

      expect(result.success).toBe(false);
      expect(result.error).toContain("no poop to clean");
    });
  });

  describe("treatPet", () => {
    test("should successfully cure sick pet with medicine", () => {
      pet.health = "sick";
      const medicine = [{ type: "cure" as const, value: 0 }];

      const result = PetSystem.treatPet(pet, medicine);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("medicine");
      expect(pet.health as string).toEqual("healthy");
    });

    test("should successfully heal injured pet", () => {
      pet.health = "injured";
      pet.currentHealth = 30;
      const medicine = [{ type: "health" as const, value: 20 }];

      const result = PetSystem.treatPet(pet, medicine);

      expect(result.success).toBe(true);
      expect(pet.currentHealth).toBe(50); // Capped at maxHealth
    });

    test("should fail when pet doesn't need treatment", () => {
      pet.health = "healthy";
      pet.currentHealth = pet.maxHealth;
      const medicine = [{ type: "cure" as const, value: 0 }];

      const result = PetSystem.treatPet(pet, medicine);

      expect(result.success).toBe(false);
      expect(result.error).toContain("doesn't need this treatment");
    });

    test("should fail with invalid medicine", () => {
      pet.health = "sick";
      const notMedicine = [{ type: "satiety" as const, value: 20 }];

      const result = PetSystem.treatPet(pet, notMedicine);

      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot treat");
    });
  });

  describe("sleep and wake", () => {
    test("should put pet to sleep successfully", () => {
      pet.state = "idle";

      const result = PetSystem.putPetToSleep(pet);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("sleep");
      expect(pet.state as string).toEqual("sleeping");
    });

    test("should fail to put already sleeping pet to sleep", () => {
      pet.state = "sleeping";

      const result = PetSystem.putPetToSleep(pet);

      expect(result.success).toBe(false);
      expect(result.error).toContain("already sleeping");
    });

    test("should fail to put travelling pet to sleep", () => {
      pet.state = "travelling";

      const result = PetSystem.putPetToSleep(pet);

      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot sleep while travelling");
    });

    test("should wake sleeping pet successfully", () => {
      pet.state = "sleeping";

      const result = PetSystem.wakePetUp(pet);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("wake");
      expect(pet.state as string).toEqual("idle");
    });

    test("should fail to wake non-sleeping pet", () => {
      pet.state = "idle";

      const result = PetSystem.wakePetUp(pet);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not sleeping");
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

    expect(pet.satiety).toBe(Math.ceil(99 / PET_CONSTANTS.STAT_MULTIPLIER.satiety));
    expect(pet.hydration).toBe(Math.ceil(79 / PET_CONSTANTS.STAT_MULTIPLIER.hydration));
    expect(pet.happiness).toBe(Math.ceil(119 / PET_CONSTANTS.STAT_MULTIPLIER.happiness));
  });

  test("should handle pet pooping", () => {
    pet.poopTicksLeft = 1;

    const changes = PetSystem.processPetTick(pet);

    expect(changes).toContain("pet_pooped");
    expect(pet.poopTicksLeft).toBeGreaterThan(0);
  });

  test("should make pet sick from uncleaned poop", () => {
    pet.sickByPoopTicksLeft = 1;
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

    test("should warn about poop", () => {
      pet.poopTicksLeft = 0;

      const status = PetSystem.getPetStatus(pet);

      expect(status.warnings).toContain("Pet needs cleaning");
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
