// Unit tests for battle system pet state management using bun:test
import { describe, test, expect } from "bun:test";
import { BattleSystem } from "@/systems/BattleSystem";
import type { Pet, PetSpecies } from "@/types";

// Helper to create a test pet
function createTestPet(overrides: Partial<Pet> = {}): Pet {
  const testSpecies: PetSpecies = {
    id: "test_species",
    name: "Test Pet",
    rarity: "common",
    description: "A pet for testing",
    baseStats: { attack: 15, defense: 12, speed: 10, health: 80 },
    growthRates: { attack: 1.1, defense: 1.1, speed: 1.1, health: 1.2, energy: 1.1 },
    sprite: "test.png",
    icon: "test_icon.png",
  };

  return {
    id: "test_pet_1",
    name: "TestPet",
    species: testSpecies,
    rarity: "common",
    growthStage: 0,
    satiety: 75,
    hydration: 75,
    happiness: 75,
    satietyTicksLeft: 1200,
    hydrationTicksLeft: 800,
    happinessTicksLeft: 1000,
    poopTicksLeft: 300,
    poopCount: overrides.poopCount ?? 0,
    sickByPoopTicksLeft: 17280,
    life: 900000,
    maxEnergy: 100,
    currentEnergy: 80,
    health: "healthy",
    state: "idle", // Important: Pet starts in idle state
    attack: 15,
    defense: 12,
    speed: 10,
    maxHealth: 80,
    currentHealth: 80,
    moves: [],
    birthTime: Date.now() - 3600000,
    lastCareTime: Date.now() - 900000,
    totalLifetime: 240,
    ...overrides,
  };
}

describe("BattleSystem Pet State Management", () => {
  describe("Battle State Validation", () => {
    test("should allow idle pets to enter battle", () => {
      const playerPet = createTestPet({ state: "idle" });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test("should prevent sleeping pets from entering battle", () => {
      const playerPet = createTestPet({ state: "sleeping" });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Your pet is busy and cannot battle right now");
    });

    test("should prevent travelling pets from entering battle", () => {
      const playerPet = createTestPet({ state: "travelling" });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Your pet is busy and cannot battle right now");
    });

    test("should prevent exploring pets from entering battle", () => {
      const playerPet = createTestPet({ state: "exploring" });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Your pet is busy and cannot battle right now");
    });

    test("should prevent battling pets from entering new battles", () => {
      const playerPet = createTestPet({ state: "battling" });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Your pet is busy and cannot battle right now");
    });
  });

  describe("Battle Progression", () => {
    test("should start battle with in_progress status for immediate action selection", () => {
      const playerPet = createTestPet();
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(true);
      expect(result.data!.status).toBe("in_progress");
      expect(result.data!.turnPhase).toBe("select_action");
    });

    test("should create proper battle pets with battle moves", () => {
      const playerPet = createTestPet();
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(true);

      const battle = result.data!;
      expect(battle.playerPet.moves).toBeDefined();
      expect(battle.opponentPet.moves).toBeDefined();
      expect(battle.playerPet.moves.length).toBeGreaterThan(0);
      expect(battle.opponentPet.moves.length).toBeGreaterThan(0);
    });

    test("should have proper battle initialization values", () => {
      const playerPet = createTestPet();
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(true);

      const battle = result.data!;
      expect(battle.currentTurn).toBe(1);
      expect(battle.turns).toEqual([]);
      expect(battle.startTime).toBeDefined();
      expect(battle.experience).toBeGreaterThan(0);
      expect(battle.goldReward).toBeGreaterThan(0);
    });
  });

  describe("Pet Health and Energy Requirements", () => {
    test("should prevent pets with no health from battling", () => {
      const playerPet = createTestPet({ currentHealth: 0 });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Your pet is unable to battle - no health remaining");
    });

    test("should prevent pets with insufficient energy from battling", () => {
      const playerPet = createTestPet({ currentEnergy: 15 }); // Less than required 20
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Your pet is too tired to battle - needs at least 20 energy");
    });

    test("should allow pets with exactly minimum energy to battle", () => {
      const playerPet = createTestPet({ currentEnergy: 20 }); // Exactly the minimum
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");

      expect(result.success).toBe(true);
    });
  });

  describe("Battle Results Application", () => {
    test("should properly apply battle results to original pet", () => {
      const originalPet = createTestPet({ currentHealth: 80, currentEnergy: 100 });
      const playerPet = createTestPet({ currentHealth: 80, currentEnergy: 100 });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      // Create a battle
      const battleResult = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");
      expect(battleResult.success).toBe(true);

      const battle = battleResult.data!;

      // Simulate some damage and energy loss during battle
      battle.playerPet.currentHealth = 60; // Lost 20 health
      battle.playerPet.currentEnergy = 70; // Lost 30 energy
      battle.status = "victory"; // Battle ended in victory

      // Apply battle results to original pet
      const applyResult = BattleSystem.applyBattleResults(originalPet, battle);

      expect(applyResult.success).toBe(true);
      expect(applyResult.data!.currentHealth).toBe(60); // Health should be reduced
      expect(applyResult.data!.currentEnergy).toBe(70); // Energy should be reduced
    });

    test("should not allow negative health or energy after battle", () => {
      const originalPet = createTestPet({ currentHealth: 80, currentEnergy: 100 });
      const playerPet = createTestPet({ currentHealth: 80, currentEnergy: 100 });
      const opponentPet = createTestPet({ id: "opponent", name: "Opponent" });

      const battleResult = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");
      const battle = battleResult.data!;

      // Simulate extreme damage (more than current health)
      battle.playerPet.currentHealth = 0;
      battle.playerPet.currentEnergy = 0;
      battle.status = "defeat";

      const applyResult = BattleSystem.applyBattleResults(originalPet, battle);

      expect(applyResult.success).toBe(true);
      expect(applyResult.data!.currentHealth).toBe(0); // Should be 0, not negative
      expect(applyResult.data!.currentEnergy).toBe(0); // Should be 0, not negative
    });
  });
});
