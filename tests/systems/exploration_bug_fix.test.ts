// Test for exploration bug fix - pet state reset issue

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { WorldSystem } from "@/systems/WorldSystem";
import type { GameState } from "@/types";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
});

describe("Exploration Bug Fix Tests", () => {
  let gameLoop: GameLoop;
  let gameState: GameState;

  beforeEach(() => {
    mockLocalStorage.clear();

    // Initialize fresh game state
    gameState = GameStateFactory.createNewGameWithStarter("TestPet", "water_starter");
    gameLoop = GameLoop.getInstance();
    gameLoop.initialize(gameState);
  });

  afterEach(() => {
    gameLoop.stop();
  });

  describe("Activity State Persistence", () => {
    test("should maintain pet exploring state after starting activity", () => {
      // Ensure pet has enough energy and move to forest_path where activities are available
      gameState.currentPet!.currentEnergy = 100;
      gameState.currentPet!.growthStage = 5; // High enough level for travel

      // First travel to forest_path
      const travelResult = WorldSystem.startTravel(gameState.world, gameState.currentPet!, "forest_path");
      expect(travelResult.success).toBe(true);

      // Complete travel by processing ticks
      let currentWorldState = travelResult.data!.worldState;
      const travelDuration = currentWorldState.travelState!.totalTravelTime;
      for (let i = 0; i < travelDuration; i++) {
        const tickResult = WorldSystem.processTravelTick(currentWorldState);
        if (tickResult.success && tickResult.data) {
          currentWorldState = tickResult.data;
        }
      }

      // Update game state with completed travel
      gameState.world = currentWorldState;
      gameState.currentPet = travelResult.data!.pet;
      gameState.currentPet.state = "idle"; // Reset from travelling to idle

      // Now start activity at forest_path
      const result = WorldSystem.startActivity(gameState, "forest_foraging");

      expect(result.success).toBe(true);
      expect(result.data?.pet.state).toBe("exploring");
      expect(result.data?.worldState.activeActivities).toHaveLength(1);

      // Update game loop state to match (simulating the fix)
      const updatedGameState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };
      gameLoop.updateState(updatedGameState);

      // Verify GameLoop has the updated state
      expect(gameLoop.getCurrentGameState()?.currentPet?.state).toBe("exploring");
      expect(gameLoop.getCurrentGameState()?.world.activeActivities).toHaveLength(1);
    });

    test("should not reset pet state to idle immediately after starting activity", () => {
      // Ensure pet has enough energy and move to forest_path
      gameState.currentPet!.currentEnergy = 100;
      gameState.currentPet!.growthStage = 5;

      // Travel to forest_path and complete travel
      const travelResult = WorldSystem.startTravel(gameState.world, gameState.currentPet!, "forest_path");
      let currentWorldState = travelResult.data!.worldState;
      const travelDuration = currentWorldState.travelState!.totalTravelTime;
      for (let i = 0; i < travelDuration; i++) {
        const tickResult = WorldSystem.processTravelTick(currentWorldState);
        if (tickResult.success && tickResult.data) {
          currentWorldState = tickResult.data;
        }
      }
      gameState.world = currentWorldState;
      gameState.currentPet = travelResult.data!.pet;
      gameState.currentPet.state = "idle";

      // Start activity
      const result = WorldSystem.startActivity(gameState, "forest_foraging");

      // Update game loop state (simulating the fix)
      const updatedGameState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };
      gameLoop.updateState(updatedGameState);

      // Process one tick (should NOT complete activity immediately)
      gameLoop.tick();

      const currentState = gameLoop.getCurrentGameState();
      expect(currentState?.currentPet?.state).toBe("exploring");
      expect(currentState?.world.activeActivities).toHaveLength(1);
    });

    test("should properly reset pet state only when activity actually completes", () => {
      // Ensure pet has enough energy
      gameState.currentPet!.currentEnergy = 100;

      // Start activity with very short duration (1 tick for testing)
      const shortActivity = {
        id: "test_short_activity",
        name: "Quick Test",
        type: "foraging" as const,
        description: "Test activity",
        energyCost: 10,
        duration: 1, // 1 tick duration
        rewards: [{ type: "gold" as const, amount: 5, probability: 1.0 }],
      };

      // Add short activity to current location
      const currentLocation = WorldSystem.getCurrentLocation(gameState.world);
      if (currentLocation) {
        currentLocation.activities.push(shortActivity);
      }

      const result = WorldSystem.startActivity(gameState, "test_short_activity");

      // Update game loop state (simulating the fix)
      const updatedGameState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };
      gameLoop.updateState(updatedGameState);

      // Verify activity started
      expect(gameLoop.getCurrentGameState()?.currentPet?.state).toBe("exploring");
      expect(gameLoop.getCurrentGameState()?.world.activeActivities).toHaveLength(1);

      // Process one tick - activity should complete
      gameLoop.tick();

      const finalState = gameLoop.getCurrentGameState();
      expect(finalState?.currentPet?.state).toBe("idle"); // Should reset to idle after completion
      expect(finalState?.world.activeActivities).toHaveLength(0); // Activity should be removed
    });

    test("should maintain activity state across multiple ticks until completion", () => {
      // Ensure pet has enough energy and move to forest_path
      gameState.currentPet!.currentEnergy = 100;
      gameState.currentPet!.growthStage = 5;

      // Travel to forest_path and complete travel
      const travelResult = WorldSystem.startTravel(gameState.world, gameState.currentPet!, "forest_path");
      let currentWorldState = travelResult.data!.worldState;
      const travelDuration = currentWorldState.travelState!.totalTravelTime;
      for (let i = 0; i < travelDuration; i++) {
        const tickResult = WorldSystem.processTravelTick(currentWorldState);
        if (tickResult.success && tickResult.data) {
          currentWorldState = tickResult.data;
        }
      }
      gameState.world = currentWorldState;
      gameState.currentPet = travelResult.data!.pet;
      gameState.currentPet.state = "idle";

      // Start activity with longer duration
      const result = WorldSystem.startActivity(gameState, "forest_foraging"); // 30 tick duration

      // Update game loop state (simulating the fix)
      const updatedGameState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };
      gameLoop.updateState(updatedGameState);

      // Process multiple ticks (but not all 30)
      for (let i = 0; i < 10; i++) {
        gameLoop.tick();
      }

      const currentState = gameLoop.getCurrentGameState();
      expect(currentState?.currentPet?.state).toBe("exploring");
      expect(currentState?.world.activeActivities).toHaveLength(1);
      expect(currentState?.world.activeActivities[0].ticksRemaining).toBe(20); // 30 - 10 = 20
    });
  });

  describe("Travel State Persistence", () => {
    test("should maintain pet travelling state after starting travel", () => {
      // Ensure pet has enough energy and is at required level
      gameState.currentPet!.currentEnergy = 100;
      gameState.currentPet!.growthStage = 5; // High enough level

      // Start travel
      const result = WorldSystem.startTravel(gameState.world, gameState.currentPet!, "forest_path");

      expect(result.success).toBe(true);
      expect(result.data?.pet.state).toBe("travelling");
      expect(result.data?.worldState.travelState).toBeDefined();

      // Update game loop state (simulating the fix)
      const updatedGameState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };
      gameLoop.updateState(updatedGameState);

      // Verify GameLoop has the updated state
      expect(gameLoop.getCurrentGameState()?.currentPet?.state).toBe("travelling");
      expect(gameLoop.getCurrentGameState()?.world.travelState).toBeDefined();
    });

    test("should not reset travel state immediately after starting", () => {
      // Ensure pet has enough energy and is at required level
      gameState.currentPet!.currentEnergy = 100;
      gameState.currentPet!.growthStage = 5;

      // Start travel
      const result = WorldSystem.startTravel(gameState.world, gameState.currentPet!, "forest_path");

      // Update game loop state (simulating the fix)
      const updatedGameState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };
      gameLoop.updateState(updatedGameState);

      // Process one tick (should NOT complete travel immediately)
      gameLoop.tick();

      const currentState = gameLoop.getCurrentGameState();
      expect(currentState?.currentPet?.state).toBe("travelling");
      expect(currentState?.world.travelState).toBeDefined();
    });
  });

  describe("State Synchronization", () => {
    test("should synchronize React state changes with GameLoop state immediately", () => {
      // Ensure pet has enough energy and move to forest_path
      gameState.currentPet!.currentEnergy = 100;
      gameState.currentPet!.growthStage = 5;

      // Travel to forest_path and complete travel
      const travelResult = WorldSystem.startTravel(gameState.world, gameState.currentPet!, "forest_path");
      let currentWorldState = travelResult.data!.worldState;
      const travelDuration = currentWorldState.travelState!.totalTravelTime;
      for (let i = 0; i < travelDuration; i++) {
        const tickResult = WorldSystem.processTravelTick(currentWorldState);
        if (tickResult.success && tickResult.data) {
          currentWorldState = tickResult.data;
        }
      }
      gameState.world = currentWorldState;
      gameState.currentPet = travelResult.data!.pet;
      gameState.currentPet.state = "idle";

      // Simulate React state update (like in useGameState hook)
      const result = WorldSystem.startActivity(gameState, "forest_foraging");

      const newReactState = {
        ...gameState,
        world: result.data!.worldState,
        currentPet: result.data!.pet,
      };

      // This is the critical fix - immediate synchronization
      gameLoop.updateState(newReactState);

      // Verify synchronization worked
      const gameLoopState = gameLoop.getCurrentGameState();
      expect(gameLoopState?.currentPet?.state).toBe(newReactState.currentPet?.state);
      expect(gameLoopState?.world.activeActivities).toEqual(newReactState.world.activeActivities);
    });
  });
});
