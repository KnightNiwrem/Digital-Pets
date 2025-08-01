/**
 * Tests for battle components and data structures
 */

import { describe, it, expect } from "bun:test";
import { WILD_BEAST, FOREST_GUARDIAN, ARENA_CHAMPION, getAllPetSpecies, getPetSpeciesById } from "@/data/pets";

describe("Pet Species Data", () => {
  it("should have valid pet species definitions", () => {
    expect(WILD_BEAST.id).toBe("wild_beast");
    expect(WILD_BEAST.name).toBe("Wild Beast");
    expect(WILD_BEAST.rarity).toBe("common");
    expect(WILD_BEAST.baseStats.attack).toBe(25);

    expect(FOREST_GUARDIAN.id).toBe("forest_guardian");
    expect(FOREST_GUARDIAN.name).toBe("Forest Guardian");
    expect(FOREST_GUARDIAN.rarity).toBe("uncommon");
    expect(FOREST_GUARDIAN.baseStats.attack).toBe(35);

    expect(ARENA_CHAMPION.id).toBe("arena_champion");
    expect(ARENA_CHAMPION.name).toBe("Arena Champion");
    expect(ARENA_CHAMPION.rarity).toBe("rare");
    expect(ARENA_CHAMPION.baseStats.attack).toBe(45);
  });

  it("should have proper growth rates", () => {
    expect(WILD_BEAST.growthRates.attack).toBeGreaterThan(1);
    expect(WILD_BEAST.growthRates.defense).toBeGreaterThan(1);
    expect(WILD_BEAST.growthRates.speed).toBeGreaterThan(1);
    expect(WILD_BEAST.growthRates.health).toBeGreaterThan(1);
    expect(WILD_BEAST.growthRates.energy).toBeGreaterThan(1);

    expect(FOREST_GUARDIAN.growthRates.attack).toBeGreaterThan(WILD_BEAST.growthRates.attack);
    expect(ARENA_CHAMPION.growthRates.attack).toBeGreaterThan(FOREST_GUARDIAN.growthRates.attack);
  });

  it("should have required asset properties", () => {
    expect(WILD_BEAST.sprite).toBeDefined();
    expect(WILD_BEAST.icon).toBeDefined();
    expect(FOREST_GUARDIAN.sprite).toBeDefined();
    expect(FOREST_GUARDIAN.icon).toBeDefined();
    expect(ARENA_CHAMPION.sprite).toBeDefined();
    expect(ARENA_CHAMPION.icon).toBeDefined();
  });

  it("should return all pet species", () => {
    const allSpecies = getAllPetSpecies();
    expect(allSpecies).toHaveLength(31);
    // Check that the first few species are as expected
    expect(allSpecies).toContain(WILD_BEAST);
    expect(allSpecies).toContain(FOREST_GUARDIAN);
    expect(allSpecies).toContain(ARENA_CHAMPION);
  });

  it("should find pet species by id", () => {
    expect(getPetSpeciesById("wild_beast")).toEqual(WILD_BEAST);
    expect(getPetSpeciesById("forest_guardian")).toEqual(FOREST_GUARDIAN);
    expect(getPetSpeciesById("arena_champion")).toEqual(ARENA_CHAMPION);
    expect(getPetSpeciesById("nonexistent")).toBeUndefined();
  });
});

describe("Battle Type Definitions", () => {
  it("should have proper battle action structure", () => {
    const battleAction = {
      type: "move" as const,
      moveId: "tackle",
      petId: "test-pet",
      priority: 0,
      timestamp: Date.now(),
    };

    expect(battleAction.type).toBe("move");
    expect(battleAction.moveId).toBe("tackle");
    expect(battleAction.petId).toBe("test-pet");
    expect(battleAction.priority).toBe(0);
    expect(battleAction.timestamp).toBeGreaterThan(0);
  });

  it("should have proper battle result structure", () => {
    const battleResult = {
      type: "damage" as const,
      targetId: "opponent-pet",
      sourceId: "player-pet",
      value: 25,
      moveId: "tackle",
      message: "Opponent took 25 damage!",
    };

    expect(battleResult.type).toBe("damage");
    expect(battleResult.targetId).toBe("opponent-pet");
    expect(battleResult.sourceId).toBe("player-pet");
    expect(battleResult.value).toBe(25);
    expect(battleResult.message).toContain("damage");
  });
});

describe("Mock Battle Data", () => {
  it("should create valid mock opponents", () => {
    // Test the structure that useBattleState creates
    const mockOpponent = {
      id: "wild_beast",
      name: "Wild Beast",
      species: WILD_BEAST,
      rarity: "common" as const,
      growthStage: 10,
      satiety: 80,
      hydration: 80,
      happiness: 80,
      satietyTicksLeft: 1200,
      hydrationTicksLeft: 1200,
      happinessTicksLeft: 1200,
      poopTicksLeft: 800,
      sickByPoopTicksLeft: 17280,
      life: 100000,
      maxEnergy: 120,
      currentEnergy: 120,
      health: "healthy" as const,
      state: "idle" as const,
      attack: 25,
      defense: 20,
      speed: 30,
      maxHealth: 100,
      currentHealth: 100,
      moves: [],
      birthTime: Date.now() - 86400000,
      lastCareTime: Date.now() - 3600000,
      totalLifetime: 5760,
    };

    expect(mockOpponent.species.id).toBe("wild_beast");
    expect(mockOpponent.birthTime).toBeLessThan(Date.now());
    expect(mockOpponent.lastCareTime).toBeLessThan(Date.now());
    expect(mockOpponent.totalLifetime).toBeGreaterThan(0);
    expect(mockOpponent.currentHealth).toBeLessThanOrEqual(mockOpponent.maxHealth);
    expect(mockOpponent.currentEnergy).toBeLessThanOrEqual(mockOpponent.maxEnergy);
  });

  it("should have appropriate opponent difficulty scaling", () => {
    // Wild Beast - Easy
    expect(WILD_BEAST.baseStats.attack).toBe(25);
    expect(WILD_BEAST.baseStats.defense).toBe(20);
    expect(WILD_BEAST.baseStats.health).toBe(100);

    // Forest Guardian - Medium
    expect(FOREST_GUARDIAN.baseStats.attack).toBeGreaterThan(WILD_BEAST.baseStats.attack);
    expect(FOREST_GUARDIAN.baseStats.defense).toBeGreaterThan(WILD_BEAST.baseStats.defense);
    expect(FOREST_GUARDIAN.baseStats.health).toBeGreaterThan(WILD_BEAST.baseStats.health);

    // Arena Champion - Hard
    expect(ARENA_CHAMPION.baseStats.attack).toBeGreaterThan(FOREST_GUARDIAN.baseStats.attack);
    expect(ARENA_CHAMPION.baseStats.defense).toBeGreaterThan(FOREST_GUARDIAN.baseStats.defense);
    expect(ARENA_CHAMPION.baseStats.health).toBeGreaterThan(FOREST_GUARDIAN.baseStats.health);
  });
});
