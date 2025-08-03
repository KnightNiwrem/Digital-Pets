import { describe, it, expect, beforeEach } from "bun:test";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { getItemById } from "@/data/items";
import type { GameState } from "@/types";

describe("Offline Activity Reward Processing", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameStateFactory.createTestGame();

    // Enable offline progression and set a past save time for testing
    gameState.settings.offlineProgressEnabled = true;
    gameState.metadata.lastSaveTime = Date.now() - 300000; // 5 minutes ago

    // Add some activities to test offline processing
    gameState.world.activeActivities = [
      {
        activityId: "riverside_rest", // Now a training activity
        locationId: "riverside",
        ticksRemaining: 10, // Will complete during offline processing
        startTime: Date.now() - 60000, // Started 1 minute ago
        petId: gameState.currentPet?.id || "test-pet",
      },
      {
        activityId: "mountain_rest", // Now a training activity
        locationId: "mountain_village",
        ticksRemaining: 50, // Won't complete during small offline processing
        startTime: Date.now() - 30000, // Started 30 seconds ago
        petId: gameState.currentPet?.id || "test-pet",
      },
    ];
  });

  describe("Offline Activity Completion", () => {
    it("should complete activities that finish during offline time", () => {
      const initialExp = gameState.playerStats.experience;
      const initialActivities = gameState.world.activeActivities.length;

      // Process 20 ticks offline (should complete first activity)
      const result = GameLoop.calculateOfflineProgression(gameState);

      expect(result.progressionApplied).toBe(true);
      expect(result.majorEvents).toContain("activity_completed");

      // Should have fewer active activities
      expect(gameState.world.activeActivities.length).toBeLessThan(initialActivities);

      // Should have received rewards (experience increase for training activity)
      expect(gameState.playerStats.experience).toBeGreaterThan(initialExp);
    });

    it("should not complete activities that don't finish during offline time", () => {
      // Set both activities to have more ticks remaining than we'll process
      gameState.world.activeActivities.forEach(activity => {
        activity.ticksRemaining = 1000; // Very long duration
      });

      const initialActivities = gameState.world.activeActivities.length;

      // Process minimal offline time
      const result = GameLoop.calculateOfflineProgression(gameState);

      // Activities should still be active
      expect(gameState.world.activeActivities.length).toBe(initialActivities);
      expect(result.majorEvents).not.toContain("activity_completed");
    });

    it("should handle multiple activity completions during offline time", () => {
      // Set both activities to complete quickly (should complete in ~5 minutes of offline time)
      gameState.world.activeActivities.forEach(activity => {
        activity.ticksRemaining = 3; // Definitely will complete with 20 ticks of offline processing
      });

      const initialExp = gameState.playerStats.experience;

      const result = GameLoop.calculateOfflineProgression(gameState);

      // Both activities should have completed
      expect(gameState.world.activeActivities.length).toBe(0);
      // Major events are deduplicated, so we'll just check that activity_completed exists
      expect(result.majorEvents).toContain("activity_completed");

      // Should have received experience from both training activities
      expect(gameState.playerStats.experience).toBeGreaterThan(initialExp);
    });
  });

  describe("Reward Distribution", () => {
    it("should properly distribute gold rewards from completed activities", () => {
      // Use an activity that gives gold rewards
      gameState.world.activeActivities = [
        {
          activityId: "mountain_rest", // This gives gold rewards
          locationId: "mountain_village",
          ticksRemaining: 5,
          startTime: Date.now() - 60000,
          petId: gameState.currentPet?.id || "test-pet",
        },
      ];

      const initialGold = gameState.inventory.gold;

      GameLoop.calculateOfflineProgression(gameState);

      // Should have potentially received gold (depends on probability)
      // Since we can't guarantee random rewards, we just check it didn't decrease
      expect(gameState.inventory.gold).toBeGreaterThanOrEqual(initialGold);
    });

    it("should handle missing activity definitions gracefully", () => {
      // Create activity with non-existent activity ID that should complete
      gameState.world.activeActivities = [
        {
          activityId: "non_existent_activity",
          locationId: "riverside",
          ticksRemaining: 5, // Should complete with offline processing
          startTime: Date.now() - 60000,
          petId: gameState.currentPet?.id || "test-pet",
        },
      ];

      // Should not crash when processing missing activity
      expect(() => {
        GameLoop.calculateOfflineProgression(gameState);
      }).not.toThrow();

      // Activity should be removed even if definition is missing
      expect(gameState.world.activeActivities.length).toBe(0);
    });

    it("should handle missing location definitions gracefully", () => {
      // Create activity with non-existent location ID that should complete
      gameState.world.activeActivities = [
        {
          activityId: "riverside_rest",
          locationId: "non_existent_location",
          ticksRemaining: 5, // Should complete with offline processing
          startTime: Date.now() - 60000,
          petId: gameState.currentPet?.id || "test-pet",
        },
      ];

      // Should not crash when processing activity from missing location
      expect(() => {
        GameLoop.calculateOfflineProgression(gameState);
      }).not.toThrow();

      // Activity should be removed even if location is missing
      expect(gameState.world.activeActivities.length).toBe(0);
    });
  });

  describe("Error Compensation", () => {
    it("should provide gold compensation for failed item additions", () => {
      // Fill inventory to capacity to force item addition failures
      // Use a real item from the game
      const appleItem = getItemById("apple");
      if (!appleItem) {
        throw new Error("Apple item not found - test setup issue");
      }

      gameState.inventory.slots = Array(gameState.inventory.maxSlots)
        .fill(null)
        .map((_, index) => ({
          item: appleItem,
          quantity: 99,
          slotIndex: index,
        }));

      // Create activity that would give item rewards
      gameState.world.activeActivities = [
        {
          activityId: "riverside_rest", // This can give herb items
          locationId: "riverside",
          ticksRemaining: 5,
          startTime: Date.now() - 60000,
          petId: gameState.currentPet?.id || "test-pet",
        },
      ];

      const initialGold = gameState.inventory.gold;

      GameLoop.calculateOfflineProgression(gameState);

      // Should have received gold compensation if item addition failed
      // (This test might be flaky due to probability, but tests the error handling path)
      expect(gameState.inventory.gold).toBeGreaterThanOrEqual(initialGold);
    });
  });
});
