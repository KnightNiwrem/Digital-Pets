// Test for offline travel log completion bug
// Issue: Log does not update to "complete" status when travel is completed offline

import { describe, it, expect, beforeEach } from "bun:test";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import type { GameState } from "@/types";
import { ActionFactory } from "@/types/UnifiedActions";

describe("Offline Travel Log Bug (Issue #96)", () => {
  let gameState: GameState;
  let gameLoop: GameLoop;

  beforeEach(() => {
    gameState = GameStateFactory.createTestGame();
    gameLoop = GameLoop.getInstance();
    gameLoop.initialize(gameState);
  });

  it("should update travel log to 'completed' when travel finishes during offline progression", async () => {
    // Start travel
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    const travelAction = ActionFactory.createWorldAction("travel", {
      destinationId: "forest_path",
    });

    const startResult = await ActionCoordinator.dispatchAction(gameState, travelAction);
    expect(startResult.success).toBe(true);
    gameState = startResult.data!.gameState;

    // Verify we have a "started" log entry
    expect(gameState.activityLog).toHaveLength(1);
    const originalLogEntry = gameState.activityLog[0];
    expect(originalLogEntry.status).toBe("started");
    expect(originalLogEntry.activityId).toBe("Forest Path");
    expect(originalLogEntry.endTime).toBeUndefined();

    // Simulate going offline - set save time to past
    const travelTime = gameState.world.travelState!.ticksRemaining * 15000; // Convert ticks to milliseconds
    gameState.metadata.lastSaveTime = Date.now() - travelTime - 30000; // 30 seconds extra to ensure completion

    // Process offline progression (this is where the bug occurs)
    const offlineResult = GameLoop.calculateOfflineProgression(gameState);

    // Verify offline progression was applied and travel completed
    expect(offlineResult.progressionApplied).toBe(true);
    expect(offlineResult.majorEvents).toContain("travel_completed");
    expect(gameState.world.travelState).toBeUndefined(); // Travel should be cleared
    expect(gameState.world.currentLocationId).toBe("forest_path"); // Should be at destination

    // BUG: Log entry should be updated to "completed" but currently isn't
    expect(gameState.activityLog).toHaveLength(1);
    const updatedLogEntry = gameState.activityLog[0];
    
    // This test will fail until the bug is fixed
    expect(updatedLogEntry.status).toBe("completed"); // Should be "completed", not "started"
    expect(updatedLogEntry.id).toBe(originalLogEntry.id); // Same log entry
    expect(updatedLogEntry.endTime).toBeDefined(); // Should have end time
    expect(updatedLogEntry.results).toHaveLength(1); // Should have arrival result
    expect(updatedLogEntry.results[0].description).toBe("Arrived at Forest Path");
  });

  it("should work correctly for different destinations during offline progression", async () => {
    // Test with town_garden
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    const travelAction = ActionFactory.createWorldAction("travel", {
      destinationId: "town_garden",
    });

    const startResult = await ActionCoordinator.dispatchAction(gameState, travelAction);
    gameState = startResult.data!.gameState;

    // Simulate offline progression
    const travelTime = gameState.world.travelState!.ticksRemaining * 15000;
    gameState.metadata.lastSaveTime = Date.now() - travelTime - 30000;

    GameLoop.calculateOfflineProgression(gameState);

    // Verify log was updated correctly
    expect(gameState.activityLog).toHaveLength(1);
    const logEntry = gameState.activityLog[0];
    expect(logEntry.status).toBe("completed");
    expect(logEntry.activityId).toBe("Town Garden");
    expect(logEntry.results[0].description).toBe("Arrived at Town Garden");
  });

  it("should maintain same log entry ID when updating from started to completed", async () => {
    // Start travel
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    const travelAction = ActionFactory.createWorldAction("travel", {
      destinationId: "forest_path",
    });

    const startResult = await ActionCoordinator.dispatchAction(gameState, travelAction);
    gameState = startResult.data!.gameState;

    const originalLogId = gameState.activityLog[0].id;
    const originalStartTime = gameState.activityLog[0].startTime;

    // Simulate offline progression
    const travelTime = gameState.world.travelState!.ticksRemaining * 15000;
    gameState.metadata.lastSaveTime = Date.now() - travelTime - 30000;

    GameLoop.calculateOfflineProgression(gameState);

    // Verify same log entry was updated, not a new one created
    expect(gameState.activityLog).toHaveLength(1);
    expect(gameState.activityLog[0].id).toBe(originalLogId);
    expect(gameState.activityLog[0].startTime).toBe(originalStartTime);
    expect(gameState.activityLog[0].status).toBe("completed");
  });
});