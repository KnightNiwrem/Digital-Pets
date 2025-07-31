// Test for exploration state bug fix
// Verifies that pets in "exploring" state are not reset to "idle" prematurely during autosave

import { describe, it, expect, beforeEach } from "bun:test";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { WorldSystem } from "@/systems/WorldSystem";
import type { GameState, Pet, PetSpecies } from "@/types";

describe("Exploration State Bug Fix", () => {
  let gameState: GameState;
  let gameLoop: GameLoop;

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
      name: "Buddy",
      species: testSpecies,
      rarity: "common",
      growthStage: 5,
      satiety: 100,
      hydration: 100,
      happiness: 100,
      satietyTicksLeft: 2000,
      hydrationTicksLeft: 1600,
      happinessTicksLeft: 2400,
      poopTicksLeft: 100,
      sickByPoopTicksLeft: 17280,
      life: 1000000,
      maxEnergy: 120,
      currentEnergy: 100,
      health: "healthy",
      state: "idle",
      attack: 15,
      defense: 12,
      speed: 18,
      maxHealth: 60,
      currentHealth: 60,
      moves: [],
      birthTime: Date.now() - 86400000,
      lastCareTime: Date.now(),
      totalLifetime: 5760,
      ...overrides,
    };
  }

  beforeEach(() => {
    gameState = GameStateFactory.createNewGame();
    gameState.currentPet = createTestPet();
    gameState.currentPet.currentEnergy = 100; // Ensure pet has energy

    gameLoop = GameLoop.getInstance();
    gameLoop.initialize(gameState);
  });

  it("should keep pet in exploring state while activity is ongoing", () => {
    // Start an activity (foraging in hometown)
    const result = WorldSystem.startActivity(
      gameState.world,
      gameState.currentPet!,
      "hometown_foraging",
      gameState.inventory
    );

    expect(result.success).toBe(true);
    expect(result.data?.pet.state).toBe("exploring");

    // Update game state with the result
    gameState.world = result.data!.worldState;
    gameState.currentPet = result.data!.pet;
    gameLoop.updateState(gameState);

    // Verify activity is active and pet is exploring
    expect(gameState.world.activeActivities.length).toBe(1);
    expect(gameState.currentPet!.state).toBe("exploring");

    // Process several ticks while activity is still ongoing
    const activity = gameState.world.activeActivities[0];
    const initialTicksRemaining = activity.ticksRemaining;

    // Process ticks less than the total duration
    for (let i = 0; i < Math.min(5, initialTicksRemaining - 1); i++) {
      gameLoop.tick();
    }

    // Pet should still be in exploring state
    expect(gameState.currentPet!.state).toBe("exploring");
    expect(gameState.world.activeActivities.length).toBe(1);
  });

  it("should reset pet to idle only when exploration activity completes", () => {
    // Start an activity with short duration for testing
    const result = WorldSystem.startActivity(
      gameState.world,
      gameState.currentPet!,
      "hometown_foraging",
      gameState.inventory
    );

    expect(result.success).toBe(true);

    // Update game state
    gameState.world = result.data!.worldState;
    gameState.currentPet = result.data!.pet;
    gameLoop.updateState(gameState);

    expect(gameState.currentPet!.state).toBe("exploring");

    const activity = gameState.world.activeActivities[0];
    const totalTicks = activity.ticksRemaining;

    // Process all ticks to complete the activity
    for (let i = 0; i < totalTicks; i++) {
      gameLoop.tick();
    }

    // Now pet should be back to idle and no active activities
    expect(gameState.currentPet!.state).toBe("idle");
    expect(gameState.world.activeActivities.length).toBe(0);
  });

  it("should handle multiple activities correctly without premature state reset", () => {
    // This test ensures the fix handles the global activity check correctly
    // Start an activity
    const result = WorldSystem.startActivity(
      gameState.world,
      gameState.currentPet!,
      "hometown_foraging",
      gameState.inventory
    );

    expect(result.success).toBe(true);
    gameState.world = result.data!.worldState;
    gameState.currentPet = result.data!.pet;
    gameLoop.updateState(gameState);

    expect(gameState.currentPet!.state).toBe("exploring");
    expect(gameState.world.activeActivities.length).toBe(1);

    // Process one tick (activity should still be ongoing)
    gameLoop.tick();

    // Verify pet is still exploring
    expect(gameState.currentPet!.state).toBe("exploring");
    expect(gameState.world.activeActivities.length).toBe(1);

    // The activity should have decreased ticks remaining but not completed
    const remainingTicks = gameState.world.activeActivities[0]?.ticksRemaining;
    expect(remainingTicks).toBeGreaterThan(0);
  });

  it("should not reset pet state when processing rewards without completing activities", () => {
    // This test specifically targets the old bug where the pet state was reset
    // when processing rewards, even if activities weren't completed

    const result = WorldSystem.startActivity(
      gameState.world,
      gameState.currentPet!,
      "hometown_foraging",
      gameState.inventory
    );

    gameState.world = result.data!.worldState;
    gameState.currentPet = result.data!.pet;
    gameLoop.updateState(gameState);

    expect(gameState.currentPet!.state).toBe("exploring");

    // Manually process one tick to ensure the activity progresses but doesn't complete
    // This simulates the autosave scenario that was causing the bug
    gameLoop.tick();

    // The key assertion: pet should still be exploring
    expect(gameState.currentPet!.state).toBe("exploring");
    expect(gameState.world.activeActivities.length).toBe(1);
  });
});