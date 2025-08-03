// ActivityLogSystem tests

import { describe, it, expect, beforeEach } from "bun:test";
import { ActivityLogSystem } from "@/systems/ActivityLogSystem";
import type { GameState } from "@/types";
import { GameStateFactory } from "@/engine/GameStateFactory";

describe("ActivityLogSystem", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameStateFactory.createNewGameWithStarter("TestPet", "wild_beast");
  });

  describe("addLogEntry", () => {
    it("should add a log entry with generated ID", () => {
      const entry = {
        activityId: "hometown_foraging",
        locationId: "hometown",
        status: "started" as const,
        energyCost: 10,
        startTime: Date.now(),
        results: [],
      };

      ActivityLogSystem.addLogEntry(gameState, entry);

      expect(gameState.activityLog).toHaveLength(1);
      expect(gameState.activityLog[0]).toMatchObject(entry);
      expect(gameState.activityLog[0].id).toBeDefined();
      expect(typeof gameState.activityLog[0].id).toBe("string");
    });

    it("should maintain chronological order (newest first)", () => {
      const baseTime = Date.now();

      const entry1 = {
        activityId: "hometown_foraging",
        locationId: "hometown",
        status: "started" as const,
        energyCost: 10,
        startTime: baseTime,
        results: [],
      };

      const entry2 = {
        activityId: "flower_picking",
        locationId: "hometown",
        status: "started" as const,
        energyCost: 8,
        startTime: baseTime + 1000,
        results: [],
      };

      ActivityLogSystem.addLogEntry(gameState, entry1);
      ActivityLogSystem.addLogEntry(gameState, entry2);

      expect(gameState.activityLog).toHaveLength(2);
      expect(gameState.activityLog[0].startTime).toBe(baseTime + 1000);
      expect(gameState.activityLog[1].startTime).toBe(baseTime);
    });

    it("should maintain maximum of 100 entries", () => {
      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        const entry = {
          activityId: "hometown_foraging",
          locationId: "hometown",
          status: "started" as const,
          energyCost: 10,
          startTime: Date.now() + i,
          results: [],
        };
        ActivityLogSystem.addLogEntry(gameState, entry);
      }

      expect(gameState.activityLog).toHaveLength(100);
    });
  });

  describe("updateLogEntry", () => {
    it("should update existing log entry", () => {
      const entry = {
        activityId: "hometown_foraging",
        locationId: "hometown",
        status: "started" as const,
        energyCost: 10,
        startTime: Date.now(),
        results: [],
      };

      ActivityLogSystem.addLogEntry(gameState, entry);
      const entryId = gameState.activityLog[0].id;

      ActivityLogSystem.updateLogEntry(gameState, entryId, {
        status: "completed",
        endTime: Date.now() + 5000,
      });

      expect(gameState.activityLog[0].status).toBe("completed");
      expect(gameState.activityLog[0].endTime).toBeDefined();
    });

    it("should handle non-existent entry gracefully", () => {
      // Just verify it doesn't throw an error
      expect(() => {
        ActivityLogSystem.updateLogEntry(gameState, "non-existent-id", {
          status: "completed",
        });
      }).not.toThrow();
    });
  });

  describe("getLogEntries", () => {
    beforeEach(() => {
      // Add several entries
      for (let i = 0; i < 5; i++) {
        const entry = {
          activityId: `activity_${i}`,
          locationId: "hometown",
          status: "completed" as const,
          energyCost: 10,
          startTime: Date.now() + i * 1000,
          results: [],
        };
        ActivityLogSystem.addLogEntry(gameState, entry);
      }
    });

    it("should return all entries when no limit specified", () => {
      const entries = ActivityLogSystem.getLogEntries(gameState);
      expect(entries).toHaveLength(5);
    });

    it("should return limited entries when limit specified", () => {
      const entries = ActivityLogSystem.getLogEntries(gameState, 3);
      expect(entries).toHaveLength(3);
    });

    it("should handle empty log", () => {
      gameState.activityLog = [];
      const entries = ActivityLogSystem.getLogEntries(gameState);
      expect(entries).toHaveLength(0);
    });
  });

  describe("findLogEntryByActivity", () => {
    it("should find matching activity log entry", () => {
      const startTime = Date.now();
      const entry = {
        activityId: "hometown_foraging",
        locationId: "hometown",
        status: "started" as const,
        energyCost: 10,
        startTime,
        results: [],
      };

      ActivityLogSystem.addLogEntry(gameState, entry);

      const found = ActivityLogSystem.findLogEntryByActivity(gameState, "hometown_foraging", "hometown", startTime);

      expect(found).toBeDefined();
      expect(found?.activityId).toBe("hometown_foraging");
      expect(found?.locationId).toBe("hometown");
      expect(found?.startTime).toBe(startTime);
    });

    it("should return undefined for non-matching entry", () => {
      const found = ActivityLogSystem.findLogEntryByActivity(
        gameState,
        "non_existent_activity",
        "hometown",
        Date.now()
      );

      expect(found).toBeUndefined();
    });
  });

  describe("createLogResult", () => {
    it("should create item result with proper description", () => {
      const result = ActivityLogSystem.createLogResult("item", 3, "apple", "Found apples");

      expect(result).toEqual({
        type: "item",
        amount: 3,
        itemId: "apple",
        description: "Found apples",
      });
    });

    it("should create gold result with auto-generated description", () => {
      const result = ActivityLogSystem.createLogResult("gold", 50);

      expect(result).toEqual({
        type: "gold",
        amount: 50,
        itemId: undefined,
        description: "Earned 50 gold",
      });
    });

    it("should create experience result with auto-generated description", () => {
      const result = ActivityLogSystem.createLogResult("experience", 25);

      expect(result).toEqual({
        type: "experience",
        amount: 25,
        itemId: undefined,
        description: "Gained 25 experience",
      });
    });

    it("should create none result", () => {
      const result = ActivityLogSystem.createLogResult("none");

      expect(result).toEqual({
        type: "none",
        amount: undefined,
        itemId: undefined,
        description: "No rewards received",
      });
    });
  });

  describe("createCancellationResult", () => {
    it("should create cancellation result with energy refund", () => {
      const result = ActivityLogSystem.createCancellationResult(5);

      expect(result).toEqual({
        type: "none",
        description: "Activity cancelled (5 energy refunded)",
      });
    });

    it("should create cancellation result without energy refund", () => {
      const result = ActivityLogSystem.createCancellationResult();

      expect(result).toEqual({
        type: "none",
        description: "Activity cancelled",
      });
    });
  });

  describe("getLogStatistics", () => {
    beforeEach(() => {
      // Add various activity entries
      const entries = [
        { activityId: "hometown_foraging", locationId: "hometown", status: "completed" as const },
        { activityId: "hometown_foraging", locationId: "hometown", status: "cancelled" as const },
        { activityId: "flower_picking", locationId: "hometown", status: "completed" as const },
        { activityId: "forest_foraging", locationId: "forest_path", status: "started" as const },
      ];

      entries.forEach((entry, index) => {
        ActivityLogSystem.addLogEntry(gameState, {
          ...entry,
          energyCost: 10,
          startTime: Date.now() + index * 1000,
          results: [],
        });
      });
    });

    it("should calculate correct statistics", () => {
      const stats = ActivityLogSystem.getLogStatistics(gameState);

      expect(stats.totalActivities).toBe(4);
      expect(stats.completedActivities).toBe(2);
      expect(stats.cancelledActivities).toBe(1);

      expect(stats.byType.hometown_foraging.completed).toBe(1);
      expect(stats.byType.hometown_foraging.cancelled).toBe(1);
      expect(stats.byType.flower_picking.completed).toBe(1);
      expect(stats.byType.forest_foraging.started).toBe(1);

      expect(stats.byLocation.hometown.completed).toBe(2);
      expect(stats.byLocation.hometown.cancelled).toBe(1);
      expect(stats.byLocation.forest_path.started).toBe(1);
    });
  });

  describe("cleanupOldEntries", () => {
    it("should remove entries beyond maximum limit", () => {
      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        gameState.activityLog.push({
          id: `entry_${i}`,
          activityId: "hometown_foraging",
          locationId: "hometown",
          status: "completed",
          energyCost: 10,
          startTime: Date.now() + i,
          results: [],
        });
      }

      ActivityLogSystem.cleanupOldEntries(gameState);

      expect(gameState.activityLog).toHaveLength(100);
    });

    it("should not modify log within limit", () => {
      for (let i = 0; i < 50; i++) {
        gameState.activityLog.push({
          id: `entry_${i}`,
          activityId: "hometown_foraging",
          locationId: "hometown",
          status: "completed",
          energyCost: 10,
          startTime: Date.now() + i,
          results: [],
        });
      }

      ActivityLogSystem.cleanupOldEntries(gameState);

      expect(gameState.activityLog).toHaveLength(50);
    });
  });

  describe("initializeActivityLog", () => {
    it("should initialize empty activity log if missing", () => {
      delete (gameState as any).activityLog;

      ActivityLogSystem.initializeActivityLog(gameState);

      expect(gameState.activityLog).toBeDefined();
      expect(gameState.activityLog).toEqual([]);
    });

    it("should not overwrite existing activity log", () => {
      const existingEntry = {
        id: "existing",
        activityId: "hometown_foraging",
        locationId: "hometown",
        status: "completed" as const,
        energyCost: 10,
        startTime: Date.now(),
        results: [],
      };
      gameState.activityLog = [existingEntry];

      ActivityLogSystem.initializeActivityLog(gameState);

      expect(gameState.activityLog).toHaveLength(1);
      expect(gameState.activityLog[0]).toEqual(existingEntry);
    });
  });
});
