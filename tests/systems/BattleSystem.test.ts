// Unit tests for BattleSystem using bun:test

import { describe, test, expect, beforeEach } from "bun:test";
import { BattleSystem } from "@/systems/BattleSystem";
import type { Pet, PetSpecies, Battle, BattleAction } from "@/types";
import { getStarterMoves } from "@/data/moves";

// Test helper to create a standard test pet
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

  const starterMoves = getStarterMoves();

  return {
    id: "test_pet_1",
    name: "TestPet",
    species: testSpecies,
    rarity: "common",
    growthStage: 0,

    // Care stats
    satiety: 75,
    hydration: 75,
    happiness: 75,

    // Hidden counters
    satietyTicksLeft: 1200,
    hydrationTicksLeft: 800,
    happinessTicksLeft: 1000,
    poopTicksLeft: 300,
    sickByPoopTicksLeft: 17280,

    // Core stats
    life: 900000,
    maxEnergy: 100,
    currentEnergy: 80,
    health: "healthy",
    state: "idle",

    // Battle stats
    attack: 15,
    defense: 12,
    speed: 10,
    maxHealth: 80,
    currentHealth: 80,
    moves: starterMoves,

    // Metadata
    birthTime: Date.now() - 3600000, // 1 hour ago
    lastCareTime: Date.now() - 900000, // 15 minutes ago
    totalLifetime: 240, // 240 ticks = 1 hour

    ...overrides,
  };
}

function createOpponentPet(overrides: Partial<Pet> = {}): Pet {
  const opponent = createTestPet({
    id: "opponent_pet",
    name: "Opponent",
    attack: 12,
    defense: 10,
    speed: 8,
    maxHealth: 60,
    currentHealth: 60,
    currentEnergy: 70,
    ...overrides,
  });
  return opponent;
}

describe("BattleSystem", () => {
  describe("Battle Initialization", () => {
    test("should successfully initiate battle with valid pets", () => {
      const playerPet = createTestPet();
      const opponentPet = createOpponentPet();

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest_path");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const battle = result.data!;
      expect(battle.type).toBe("wild");
      expect(battle.status).toBe("waiting");
      expect(battle.playerPet.name).toBe("TestPet");
      expect(battle.opponentPet.name).toBe("Opponent");
      expect(battle.currentTurn).toBe(1);
      expect(battle.turns).toHaveLength(0);
      expect(battle.turnPhase).toBe("select_action");
      expect(battle.location).toBe("forest_path");
    });

    test("should fail to initiate battle when player pet has no health", () => {
      const playerPet = createTestPet({ currentHealth: 0 });
      const opponentPet = createOpponentPet();

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "hometown");

      expect(result.success).toBe(false);
      expect(result.error).toContain("unable to battle - no health remaining");
    });

    test("should fail to initiate battle when player pet has insufficient energy", () => {
      const playerPet = createTestPet({ currentEnergy: 15 });
      const opponentPet = createOpponentPet();

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "hometown");

      expect(result.success).toBe(false);
      expect(result.error).toContain("too tired to battle");
    });

    test("should fail to initiate battle when player pet is not idle", () => {
      const playerPet = createTestPet({ state: "sleeping" });
      const opponentPet = createOpponentPet();

      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "hometown");

      expect(result.success).toBe(false);
      expect(result.error).toContain("busy and cannot battle");
    });

    test("should calculate appropriate rewards based on battle type", () => {
      const playerPet = createTestPet();
      const opponentPet = createOpponentPet({ maxHealth: 100 });

      const wildResult = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");
      const trainingResult = BattleSystem.initiateBattle(playerPet, opponentPet, "training", "hometown");
      const tournamentResult = BattleSystem.initiateBattle(playerPet, opponentPet, "tournament", "arena");

      expect(wildResult.success).toBe(true);
      expect(trainingResult.success).toBe(true);
      expect(tournamentResult.success).toBe(true);

      // Training should give more experience
      expect(trainingResult.data!.experience).toBeGreaterThan(wildResult.data!.experience);
      
      // Tournament should give more gold
      expect(tournamentResult.data!.goldReward).toBeGreaterThan(wildResult.data!.goldReward);
    });
  });

  describe("Action Processing", () => {
    let battle: Battle;
    let playerPet: Pet;
    let opponentPet: Pet;

    beforeEach(() => {
      playerPet = createTestPet();
      opponentPet = createOpponentPet();
      const result = BattleSystem.initiateBattle(playerPet, opponentPet, "wild", "forest");
      battle = result.data!;
      battle.status = "in_progress"; // Set to in progress for testing
    });

    test("should successfully process valid move action", () => {
      const action: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.playerPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const result = BattleSystem.processPlayerAction(battle, action);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const updatedBattle = result.data!;
      expect(updatedBattle.turns).toHaveLength(1);
      expect(updatedBattle.currentTurn).toBe(2);
    });

    test("should fail to process action when battle is not in progress", () => {
      battle.status = "victory";
      
      const action: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.playerPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const result = BattleSystem.processPlayerAction(battle, action);

      expect(result.success).toBe(false);
      expect(result.error).toContain("not in progress");
    });

    test("should fail to process action with invalid move", () => {
      const action: BattleAction = {
        type: "move",
        moveId: "nonexistent_move",
        petId: battle.playerPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const result = BattleSystem.processPlayerAction(battle, action);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid move selected");
    });

    test("should fail to process action when pet has insufficient energy", () => {
      battle.playerPet.currentEnergy = 5; // Less than tackle's cost
      
      const action: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.playerPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const result = BattleSystem.processPlayerAction(battle, action);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Insufficient energy");
    });

    test("should process flee action", () => {
      const action: BattleAction = {
        type: "flee",
        petId: battle.playerPet.id,
        priority: -1,
        timestamp: Date.now(),
      };

      const result = BattleSystem.processPlayerAction(battle, action);

      expect(result.success).toBe(true);
      // Note: Flee success is random, but the action should be processed
    });
  });

  describe("Move Execution", () => {
    test("should execute damage move correctly", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      const defender = BattleSystem["createBattlePet"](createOpponentPet());
      const initialHealth = defender.currentHealth;
      const initialEnergy = attacker.currentEnergy;

      const results = BattleSystem["executeMove"](attacker, defender, "tackle");

      expect(results).toHaveLength(1);
      expect(results[0].type).toMatch(/damage|critical/); // Can be either damage or critical
      expect(results[0].value).toBeGreaterThan(0);
      expect(defender.currentHealth).toBeLessThan(initialHealth);
      expect(attacker.currentEnergy).toBeLessThan(initialEnergy);
    });

    test("should handle move miss due to low accuracy", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      const defender = BattleSystem["createBattlePet"](createOpponentPet());
      
      // Mock the calculateAccuracy method to return very low accuracy for testing
      const originalCalculateAccuracy = BattleSystem["calculateAccuracy"];
      BattleSystem["calculateAccuracy"] = () => 5; // Return minimum accuracy
      
      // Mock Math.random to roll higher than 5%
      const originalRandom = Math.random;
      Math.random = () => 0.1; // 10% roll > 5% accuracy = miss
      
      const results = BattleSystem["executeMove"](attacker, defender, "tackle");
      
      // Restore original methods
      Math.random = originalRandom;
      BattleSystem["calculateAccuracy"] = originalCalculateAccuracy;
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("miss");
    });

    test("should handle insufficient energy for move", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      attacker.currentEnergy = 5; // Less than tackle's cost (10)
      const defender = BattleSystem["createBattlePet"](createOpponentPet());

      const results = BattleSystem["executeMove"](attacker, defender, "tackle");

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("miss");
      expect(results[0].message).toContain("doesn't have enough energy");
    });

    test("should execute status move correctly", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      const defender = BattleSystem["createBattlePet"](createOpponentPet());
      const initialAttack = attacker.tempStatModifiers.attack;

      const results = BattleSystem["executeMove"](attacker, defender, "focus");

      expect(results).toHaveLength(2); // Move use + stat change
      expect(attacker.tempStatModifiers.attack).toBeGreaterThan(initialAttack);
    });

    test("should execute healing move correctly", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      const defender = BattleSystem["createBattlePet"](createOpponentPet());
      attacker.currentHealth = 40; // Reduced health for healing test
      const initialHealth = attacker.currentHealth;

      const results = BattleSystem["executeMove"](attacker, defender, "recover");

      expect(results).toHaveLength(2); // Move use + heal
      expect(attacker.currentHealth).toBeGreaterThan(initialHealth);
      expect(results.some(r => r.type === "heal")).toBe(true);
    });

    test("should handle critical hits", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      const defender = BattleSystem["createBattlePet"](createOpponentPet());
      
      // Mock Math.random to force critical hit
      const originalRandom = Math.random;
      Math.random = () => 0.01; // Low value to force critical
      
      const results = BattleSystem["executeMove"](attacker, defender, "tackle");
      
      Math.random = originalRandom; // Restore original
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("critical");
    });

    test("should handle unknown move gracefully", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet());
      const defender = BattleSystem["createBattlePet"](createOpponentPet());

      const results = BattleSystem["executeMove"](attacker, defender, "unknown_move");

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("miss");
      expect(results[0].message).toContain("unknown move");
    });
  });

  describe("Battle End Conditions", () => {
    test("should detect victory when opponent health reaches zero", () => {
      const battle = BattleSystem.initiateBattle(
        createTestPet(),
        createOpponentPet({ currentHealth: 1 }),
        "wild",
        "forest"
      ).data!;

      battle.opponentPet.currentHealth = 0;

      const result = BattleSystem.checkBattleEnd(battle);

      expect(result.status).toBe("victory");
      expect(result.endTime).toBeDefined();
    });

    test("should detect defeat when player health reaches zero", () => {
      const battle = BattleSystem.initiateBattle(
        createTestPet({ currentHealth: 1 }),
        createOpponentPet(),
        "wild",
        "forest"
      ).data!;

      battle.playerPet.currentHealth = 0;

      const result = BattleSystem.checkBattleEnd(battle);

      expect(result.status).toBe("defeat");
      expect(result.endTime).toBeDefined();
    });

    test("should continue battle when both pets have health", () => {
      const battle = BattleSystem.initiateBattle(
        createTestPet(),
        createOpponentPet(),
        "wild",
        "forest"
      ).data!;

      const result = BattleSystem.checkBattleEnd(battle);

      expect(result.status).toBe("waiting"); // Original status maintained
      expect(result.endTime).toBeUndefined();
    });
  });

  describe("Battle Results Application", () => {
    test("should apply battle results to original pet", () => {
      const originalPet = createTestPet();
      const battle = BattleSystem.initiateBattle(
        originalPet,
        createOpponentPet(),
        "wild",
        "forest"
      ).data!;

      // Simulate battle damage
      battle.playerPet.currentHealth = 60; // Lost 20 health
      battle.playerPet.currentEnergy = 50; // Lost 30 energy
      battle.status = "victory";

      const result = BattleSystem.applyBattleResults(originalPet, battle);

      expect(result.success).toBe(true);
      expect(result.data!.currentHealth).toBe(60);
      expect(result.data!.currentEnergy).toBe(50);
    });

    test("should not allow negative health or energy", () => {
      const originalPet = createTestPet();
      const battle = BattleSystem.initiateBattle(
        originalPet,
        createOpponentPet(),
        "wild",
        "forest"
      ).data!;

      // Simulate excessive damage
      battle.playerPet.currentHealth = 0;
      battle.playerPet.currentEnergy = 0;

      const result = BattleSystem.applyBattleResults(originalPet, battle);

      expect(result.success).toBe(true);
      expect(result.data!.currentHealth).toBe(0);
      expect(result.data!.currentEnergy).toBe(0);
    });
  });

  describe("Action Order Determination", () => {
    test("should prioritize actions by priority value", () => {
      const battle = BattleSystem.initiateBattle(
        createTestPet(),
        createOpponentPet(),
        "wild",
        "forest"
      ).data!;

      const playerAction: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.playerPet.id,
        priority: 1,
        timestamp: Date.now(),
      };

      const opponentAction: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.opponentPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const order = BattleSystem["determineActionOrder"](battle, playerAction, opponentAction);

      expect(order[0].isPlayer).toBe(true); // Higher priority goes first
      expect(order[1].isPlayer).toBe(false);
    });

    test("should use speed as tiebreaker when priorities are equal", () => {
      const playerPet = createTestPet({ speed: 20 });
      const opponentPet = createOpponentPet({ speed: 10 });
      
      const battle = BattleSystem.initiateBattle(
        playerPet,
        opponentPet,
        "wild",
        "forest"
      ).data!;

      const playerAction: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.playerPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const opponentAction: BattleAction = {
        type: "move",
        moveId: "tackle",
        petId: battle.opponentPet.id,
        priority: 0,
        timestamp: Date.now(),
      };

      const order = BattleSystem["determineActionOrder"](battle, playerAction, opponentAction);

      expect(order[0].isPlayer).toBe(true); // Higher speed goes first
    });
  });

  describe("Damage Calculation", () => {
    test("should calculate damage based on attack, defense, and move power", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet({ attack: 20 }));
      const defender = BattleSystem["createBattlePet"](createOpponentPet({ defense: 10 }));
      const move = { power: 30 };

      const damage = BattleSystem["calculateDamage"](attacker, defender, move);

      expect(damage).toBeGreaterThan(0);
      expect(damage).toBeLessThanOrEqual(100); // Reasonable damage range
    });

    test("should ensure minimum damage of 1", () => {
      const attacker = BattleSystem["createBattlePet"](createTestPet({ attack: 1 }));
      const defender = BattleSystem["createBattlePet"](createOpponentPet({ defense: 100 }));
      const move = { power: 1 };

      const damage = BattleSystem["calculateDamage"](attacker, defender, move);

      expect(damage).toBe(1);
    });
  });

  describe("Status Effects", () => {
    test("should apply status effects and process them over time", () => {
      const pet = BattleSystem["createBattlePet"](createTestPet());
      const results: any[] = [];

      // Add a status effect with tick damage
      pet.statusEffects = [{
        id: "poison",
        name: "Poisoned",
        description: "Takes damage each turn",
        duration: 2,
        tickDamage: 5,
      }];

      const initialHealth = pet.currentHealth;

      BattleSystem["processStatusEffects"](pet, results);

      expect(pet.currentHealth).toBe(initialHealth - 5);
      expect(pet.statusEffects[0].duration).toBe(1);
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("damage");
    });

    test("should remove expired status effects", () => {
      const pet = BattleSystem["createBattlePet"](createTestPet());
      const results: any[] = [];

      pet.statusEffects = [{
        id: "poison",
        name: "Poisoned",
        description: "Takes damage each turn",
        duration: 1,
        tickDamage: 5,
      }];

      BattleSystem["processStatusEffects"](pet, results);

      expect(pet.statusEffects).toHaveLength(0);
      expect(results).toHaveLength(2); // Damage + removal message
      expect(results[1].type).toBe("status_removed");
    });
  });

  describe("AI Opponent Actions", () => {
    test("should generate valid opponent actions", () => {
      const battle = BattleSystem.initiateBattle(
        createTestPet(),
        createOpponentPet(),
        "wild",
        "forest"
      ).data!;

      const action = BattleSystem["generateOpponentAction"](battle);

      expect(action.type).toBeDefined();
      expect(action.petId).toBe(battle.opponentPet.id);
      expect(action.timestamp).toBeDefined();
    });

    test("should choose flee when opponent has no energy for moves", () => {
      const battle = BattleSystem.initiateBattle(
        createTestPet(),
        createOpponentPet({ currentEnergy: 5 }),
        "wild",
        "forest"
      ).data!;

      const action = BattleSystem["generateOpponentAction"](battle);

      expect(action.type).toBe("flee");
    });
  });
});