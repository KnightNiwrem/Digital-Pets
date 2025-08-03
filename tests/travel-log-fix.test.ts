// Test for travel log fix (Issue #94)
// Ensures travel logs start with "started" status and get updated to "completed" when travel finishes

import { describe, it, expect, beforeEach } from "bun:test";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import type { GameState, WorldAction } from "@/types";

describe("Travel Log Fix (Issue #94)", () => {
  let gameState: GameState;
  let gameLoop: GameLoop;

  beforeEach(() => {
    gameState = GameStateFactory.createTestGame();
    gameLoop = GameLoop.getInstance();
    gameLoop.initialize(gameState);
  });

  it("should create travel log with 'started' status and destination name when travel begins", async () => {
    // Ensure pet has enough energy and level for travel
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    // Verify no logs initially
    expect(gameState.activityLog).toHaveLength(0);

    // Create travel action to Forest Path
    const travelAction: WorldAction = {
      type: "world_action",
      payload: {
        actionType: "travel",
        destinationId: "forest_path",
      },
    };

    // Dispatch travel action
    const result = await ActionCoordinator.dispatchAction(gameState, travelAction);

    expect(result.success).toBe(true);
    if (result.success && result.data) {
      gameState = result.data.gameState;

      // Should have exactly one log entry
      expect(gameState.activityLog).toHaveLength(1);

      const logEntry = gameState.activityLog[0];
      
      // Verify log entry properties
      expect(logEntry.status).toBe("started");
      expect(logEntry.activityId).toBe("Forest Path"); // Should use destination name, not generic "Travel Started"
      expect(logEntry.locationId).toBe("hometown"); // Starting location
      expect(logEntry.energyCost).toBeGreaterThan(0); // Should have energy cost
      expect(logEntry.results).toHaveLength(0); // No results yet
      expect(logEntry.startTime).toBeDefined();
      expect(logEntry.endTime).toBeUndefined(); // Not completed yet
    }
  });

  it("should update the same travel log entry to 'completed' when travel finishes", async () => {
    // Start travel first
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    const travelAction: WorldAction = {
      type: "world_action",
      payload: {
        actionType: "travel",
        destinationId: "forest_path",
      },
    };

    const startResult = await ActionCoordinator.dispatchAction(gameState, travelAction);
    expect(startResult.success).toBe(true);
    gameState = startResult.data!.gameState;

    // Verify we have a started log entry
    expect(gameState.activityLog).toHaveLength(1);
    const originalLogId = gameState.activityLog[0].id;
    expect(gameState.activityLog[0].status).toBe("started");

    // Update GameLoop with new state and simulate travel completion
    gameLoop.updateState(gameState);

    // Fast-forward travel by setting ticksRemaining to 1
    gameState.world.travelState!.ticksRemaining = 1;

    // Process one game tick to complete travel
    await gameLoop.tick();

    // Get updated game state
    const updatedGameState = gameLoop.getCurrentGameState()!;

    // Should still have exactly one log entry (same one, updated)
    expect(updatedGameState.activityLog).toHaveLength(1);
    expect(updatedGameState.activityLog[0].id).toBe(originalLogId); // Same entry

    const completedLogEntry = updatedGameState.activityLog[0];
    
    // Verify log entry was updated to completed
    expect(completedLogEntry.status).toBe("completed");
    expect(completedLogEntry.activityId).toBe("Forest Path");
    expect(completedLogEntry.endTime).toBeDefined();
    expect(completedLogEntry.results).toHaveLength(1);
    expect(completedLogEntry.results[0].description).toBe("Arrived at Forest Path");

    // Verify travel state was cleared and pet is at destination
    expect(updatedGameState.world.travelState).toBeUndefined();
    expect(updatedGameState.world.currentLocationId).toBe("forest_path");
    expect(updatedGameState.currentPet!.state).toBe("idle");
  });

  it("should not create extra log entries - only one entry per travel", async () => {
    // Start travel
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    const travelAction: WorldAction = {
      type: "world_action",
      payload: {
        actionType: "travel",
        destinationId: "forest_path",
      },
    };

    const startResult = await ActionCoordinator.dispatchAction(gameState, travelAction);
    gameState = startResult.data!.gameState;
    gameLoop.updateState(gameState);

    // Verify single entry at start
    expect(gameState.activityLog).toHaveLength(1);

    // Complete travel
    gameState.world.travelState!.ticksRemaining = 1;
    await gameLoop.tick();

    const finalGameState = gameLoop.getCurrentGameState()!;

    // Should still have exactly one entry (no duplicates)
    expect(finalGameState.activityLog).toHaveLength(1);
    expect(finalGameState.activityLog[0].status).toBe("completed");
  });

  it("should work for different destinations", async () => {
    // Test with different destination
    gameState.currentPet!.currentEnergy = 100;
    gameState.currentPet!.growthStage = 5;

    const travelAction: WorldAction = {
      type: "world_action",
      payload: {
        actionType: "travel",
        destinationId: "town_garden",
      },
    };

    const result = await ActionCoordinator.dispatchAction(gameState, travelAction);
    gameState = result.data!.gameState;

    // Verify destination name is used in log
    expect(gameState.activityLog).toHaveLength(1);
    expect(gameState.activityLog[0].activityId).toBe("Town Garden");
    expect(gameState.activityLog[0].status).toBe("started");
  });
});