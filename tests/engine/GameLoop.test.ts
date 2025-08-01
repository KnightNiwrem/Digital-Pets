// Tests for GameLoop offline progression and core functionality

import "../setup/localStorage"; // Setup localStorage mock
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import type { GameState, Pet } from "@/types";
import { GAME_CONSTANTS } from "@/types";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";

describe("GameLoop", () => {
  let testGameState: GameState;
  let testPet: Pet;

  beforeEach(() => {
    // Create a test game state with a pet
    testGameState = GameStateFactory.createTestGame();
    testPet = testGameState.currentPet!;

    // Set specific test conditions
    testPet.satietyTicksLeft = 100;
    testPet.hydrationTicksLeft = 100;
    testPet.happinessTicksLeft = 100;
    testPet.life = 1000000;
    testPet.health = "healthy";

    // Set a known save time
    testGameState.metadata.lastSaveTime = Date.now() - 60 * 60 * 1000; // 1 hour ago
  });

  afterEach(() => {
    // Clean up any game loop instance
    const gameLoop = GameLoop.getInstance();
    gameLoop.stop();
  });

  describe("Offline Progression", () => {
    it("should calculate correct number of ticks for offline time", () => {
      // Set save time to 1 hour ago
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      testGameState.metadata.lastSaveTime = oneHourAgo;

      const result = GameLoop.calculateOfflineProgression(testGameState);

      // 1 hour = 3600 seconds, with 15-second ticks = 240 ticks
      expect(result.ticksElapsed).toBe(240);
      expect(result.progressionApplied).toBe(true);
    });

    it("should not apply progression when disabled in settings", () => {
      testGameState.settings.offlineProgressEnabled = false;

      const result = GameLoop.calculateOfflineProgression(testGameState);

      expect(result.ticksElapsed).toBe(0);
      expect(result.progressionApplied).toBe(false);
      expect(result.majorEvents).toHaveLength(0);
    });

    it("should not apply progression for short offline times", () => {
      // Set save time to 5 seconds ago (less than one tick)
      testGameState.metadata.lastSaveTime = Date.now() - 5000;

      const result = GameLoop.calculateOfflineProgression(testGameState);

      expect(result.ticksElapsed).toBe(0);
      expect(result.progressionApplied).toBe(false);
    });

    it("should cap offline progression to maximum allowed time", () => {
      // Set save time to 10 days ago (more than 7 day cap)
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      testGameState.metadata.lastSaveTime = tenDaysAgo;

      const result = GameLoop.calculateOfflineProgression(testGameState);

      // Should be capped to 7 days worth of ticks
      const maxTicks = Math.floor((7 * 24 * 60 * 60 * 1000) / GAME_CONSTANTS.TICK_INTERVAL);
      expect(result.ticksElapsed).toBe(maxTicks);
    });

    it("should apply pet stat changes during offline progression", () => {
      // Set low tick counts so pet stats will decrease
      testPet.satietyTicksLeft = 10;
      testPet.hydrationTicksLeft = 10;
      testPet.happinessTicksLeft = 10;

      // Set save time to trigger progression
      testGameState.metadata.lastSaveTime = Date.now() - 30 * 60 * 1000; // 30 minutes ago

      const originalSatiety = testPet.satietyTicksLeft;
      const originalHydration = testPet.hydrationTicksLeft;
      const originalHappiness = testPet.happinessTicksLeft;

      GameLoop.calculateOfflineProgression(testGameState);

      // Stats should have decreased
      expect(testPet.satietyTicksLeft).toBeLessThan(originalSatiety);
      expect(testPet.hydrationTicksLeft).toBeLessThan(originalHydration);
      expect(testPet.happinessTicksLeft).toBeLessThan(originalHappiness);
    });

    it("should handle pet death during offline progression", () => {
      // Set pet to critical state that will cause death
      testPet.life = 100; // Very low life
      testPet.health = "sick"; // Sick state decreases life faster

      // Set save time to ensure enough ticks for death
      testGameState.metadata.lastSaveTime = Date.now() - 60 * 60 * 1000; // 1 hour ago

      const result = GameLoop.calculateOfflineProgression(testGameState);

      expect(result.majorEvents).toContain("pet_died");
      expect(testGameState.currentPet).toBeNull();
      expect(testGameState.world.currentLocationId).toBe("hometown");
    });

    it("should complete travel during offline progression", () => {
      // Set up travel state
      testGameState.world.travelState = {
        destinationId: "forest",
        ticksRemaining: 50,
        totalTravelTime: 100,
        startTime: Date.now() - 30 * 60 * 1000,
      };
      testPet.state = "travelling";

      // Set save time to ensure travel completion
      testGameState.metadata.lastSaveTime = Date.now() - 60 * 60 * 1000; // 1 hour ago

      const result = GameLoop.calculateOfflineProgression(testGameState);

      expect(result.majorEvents).toContain("travel_completed");
      expect(testGameState.world.currentLocationId).toBe("forest");
      expect(testGameState.world.travelState).toBeUndefined();
      // Pet should be back to idle after travel completion
      expect((testPet as Pet).state).toBe("idle");
    });

    it("should update game time and metrics", () => {
      const originalTotalTicks = testGameState.gameTime.totalTicks;
      const originalMetricsTicks = testGameState.metrics.totalTicks;

      // Set save time to 30 minutes ago
      testGameState.metadata.lastSaveTime = Date.now() - 30 * 60 * 1000;

      GameLoop.calculateOfflineProgression(testGameState);

      // Should have added ticks to both counters
      expect(testGameState.gameTime.totalTicks).toBeGreaterThan(originalTotalTicks);
      expect(testGameState.metrics.totalTicks).toBeGreaterThan(originalMetricsTicks);
      expect(testGameState.gameTime.lastTickTime).toBeCloseTo(Date.now(), -2); // Within 100ms
    });
  });

  describe("GameLoop Instance Management", () => {
    it("should create singleton instance", () => {
      const instance1 = GameLoop.getInstance();
      const instance2 = GameLoop.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should initialize with game state", () => {
      const gameLoop = GameLoop.getInstance();
      gameLoop.initialize(testGameState);

      const retrievedState = gameLoop.getGameState();
      expect(retrievedState).toBe(testGameState);
    });

    it("should start and stop correctly", () => {
      const gameLoop = GameLoop.getInstance();
      gameLoop.initialize(testGameState);

      gameLoop.start();
      // Note: We can't easily test the interval behavior in unit tests
      // but we can verify the start/stop state management

      gameLoop.stop();
      // Should be able to stop multiple times without error
      gameLoop.stop();
    });
  });

  describe("Listener Management", () => {
    it("should add and remove listeners", () => {
      const gameLoop = GameLoop.getInstance();
      let callbackExecuted = false;

      const callback = () => {
        callbackExecuted = true;
      };

      gameLoop.addListener(callback);
      gameLoop.removeListener(callback);

      // Callback should be removable without error
      expect(callbackExecuted).toBe(false);
    });
  });

  describe("Load Game with Progression", () => {
    it("should return error when no save exists", () => {
      // Clear localStorage to ensure no save exists
      localStorage.clear();

      const result = GameLoop.loadGameWithProgression();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
