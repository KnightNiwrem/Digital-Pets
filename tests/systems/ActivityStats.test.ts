// Unit tests for Activity Statistics Tracking (MEDIUM-003)

import { describe, it, expect, beforeEach } from "bun:test";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import type { GameState, ActivityReward } from "@/types";
import type { ActivityType } from "@/types/World";

describe("Activity Statistics Tracking", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameStateFactory.createNewGameWithStarter("Test Pet", "wild_beast");
  });

  describe("ActivityStats Interface", () => {
    it("should have default activity stats structure", () => {
      expect(gameState.activityStats).toBeDefined();
      expect(gameState.activityStats.foraging).toBeDefined();
      expect(gameState.activityStats.fishing).toBeDefined();
      expect(gameState.activityStats.mining).toBeDefined();
      expect(gameState.activityStats.training).toBeDefined();
      expect(gameState.activityStats.totals).toBeDefined();

      // Check all activity types have the correct structure
      const activityTypes: (keyof typeof gameState.activityStats)[] = ["foraging", "fishing", "mining", "training"];
      for (const activityType of activityTypes) {
        if (activityType === "totals") continue;
        const stats = gameState.activityStats[activityType];
        expect(stats.completions).toBe(0);
        expect(stats.timeSpent).toBe(0);
        expect(stats.goldEarned).toBe(0);
        expect(stats.itemsEarned).toBe(0);
        expect(stats.experienceEarned).toBe(0);
      }

      // Check totals structure
      expect(gameState.activityStats.totals.completions).toBe(0);
      expect(gameState.activityStats.totals.timeSpent).toBe(0);
      expect(gameState.activityStats.totals.goldEarned).toBe(0);
      expect(gameState.activityStats.totals.itemsEarned).toBe(0);
      expect(gameState.activityStats.totals.experienceEarned).toBe(0);
    });
  });

  describe("Activity Completion Tracking", () => {
    it("should update foraging statistics correctly", () => {
      const testGameState = GameStateFactory.createNewGameWithStarter("Fresh Pet", "wild_beast");
      const rewards: ActivityReward[] = [
        { type: "gold", amount: 10, probability: 1 },
        { type: "item", id: "herb", amount: 2, probability: 1 },
        { type: "experience", amount: 5, probability: 1 },
      ];

      // Simulate completing a foraging activity
      (GameLoop as any).updateActivityStatistics(testGameState, "foraging" as ActivityType, 20, rewards);

      expect(testGameState.activityStats.foraging.completions).toBe(1);
      expect(testGameState.activityStats.foraging.timeSpent).toBe(20);
      expect(testGameState.activityStats.foraging.goldEarned).toBe(10);
      expect(testGameState.activityStats.foraging.itemsEarned).toBe(2);
      expect(testGameState.activityStats.foraging.experienceEarned).toBe(5);

      // Check totals are updated
      expect(testGameState.activityStats.totals.completions).toBe(1);
      expect(testGameState.activityStats.totals.timeSpent).toBe(20);
      expect(testGameState.activityStats.totals.goldEarned).toBe(10);
      expect(testGameState.activityStats.totals.itemsEarned).toBe(2);
      expect(testGameState.activityStats.totals.experienceEarned).toBe(5);
    });

    it("should update fishing statistics correctly", () => {
      const testGameState = GameStateFactory.createNewGameWithStarter("Fresh Pet", "wild_beast");
      const rewards: ActivityReward[] = [
        { type: "gold", amount: 15, probability: 1 },
        { type: "item", id: "fish", amount: 1, probability: 1 },
        { type: "experience", amount: 8, probability: 1 },
      ];

      (GameLoop as any).updateActivityStatistics(testGameState, "fishing" as ActivityType, 30, rewards);

      expect(testGameState.activityStats.fishing.completions).toBe(1);
      expect(testGameState.activityStats.fishing.timeSpent).toBe(30);
      expect(testGameState.activityStats.fishing.goldEarned).toBe(15);
      expect(testGameState.activityStats.fishing.itemsEarned).toBe(1);
      expect(testGameState.activityStats.fishing.experienceEarned).toBe(8);
    });

    it("should update mining statistics correctly", () => {
      const testGameState = GameStateFactory.createNewGameWithStarter("Fresh Pet", "wild_beast");
      const rewards: ActivityReward[] = [
        { type: "gold", amount: 25, probability: 1 },
        { type: "item", id: "ore", amount: 3, probability: 1 },
        { type: "experience", amount: 12, probability: 1 },
      ];

      (GameLoop as any).updateActivityStatistics(testGameState, "mining" as ActivityType, 40, rewards);

      expect(testGameState.activityStats.mining.completions).toBe(1);
      expect(testGameState.activityStats.mining.timeSpent).toBe(40);
      expect(testGameState.activityStats.mining.goldEarned).toBe(25);
      expect(testGameState.activityStats.mining.itemsEarned).toBe(3);
      expect(testGameState.activityStats.mining.experienceEarned).toBe(12);
    });

    it("should update training statistics correctly", () => {
      const testGameState = GameStateFactory.createNewGameWithStarter("Fresh Pet", "wild_beast");
      const rewards: ActivityReward[] = [{ type: "experience", amount: 20, probability: 1 }];

      (GameLoop as any).updateActivityStatistics(testGameState, "training" as ActivityType, 60, rewards);

      expect(testGameState.activityStats.training.completions).toBe(1);
      expect(testGameState.activityStats.training.timeSpent).toBe(60);
      expect(testGameState.activityStats.training.goldEarned).toBe(0);
      expect(testGameState.activityStats.training.itemsEarned).toBe(0);
      expect(testGameState.activityStats.training.experienceEarned).toBe(20);
    });

    it("should accumulate statistics from multiple activities", () => {
      const testGameState = GameStateFactory.createNewGameWithStarter("Fresh Pet", "wild_beast");

      // Complete multiple activities of different types
      const foragingRewards: ActivityReward[] = [
        { type: "gold", amount: 5, probability: 1 },
        { type: "item", id: "herb", amount: 1, probability: 1 },
      ];
      const fishingRewards: ActivityReward[] = [
        { type: "gold", amount: 10, probability: 1 },
        { type: "experience", amount: 5, probability: 1 },
      ];

      (GameLoop as any).updateActivityStatistics(testGameState, "foraging" as ActivityType, 20, foragingRewards);
      (GameLoop as any).updateActivityStatistics(testGameState, "foraging" as ActivityType, 20, foragingRewards);
      (GameLoop as any).updateActivityStatistics(testGameState, "fishing" as ActivityType, 30, fishingRewards);

      // Check foraging accumulated
      expect(testGameState.activityStats.foraging.completions).toBe(2);
      expect(testGameState.activityStats.foraging.timeSpent).toBe(40);
      expect(testGameState.activityStats.foraging.goldEarned).toBe(10);
      expect(testGameState.activityStats.foraging.itemsEarned).toBe(2);

      // Check fishing
      expect(testGameState.activityStats.fishing.completions).toBe(1);
      expect(testGameState.activityStats.fishing.timeSpent).toBe(30);
      expect(testGameState.activityStats.fishing.goldEarned).toBe(10);
      expect(testGameState.activityStats.fishing.experienceEarned).toBe(5);

      // Check totals
      expect(testGameState.activityStats.totals.completions).toBe(3);
      expect(testGameState.activityStats.totals.timeSpent).toBe(70);
      expect(testGameState.activityStats.totals.goldEarned).toBe(20);
      expect(testGameState.activityStats.totals.itemsEarned).toBe(2);
      expect(testGameState.activityStats.totals.experienceEarned).toBe(5);
    });

    it("should handle empty rewards correctly", () => {
      const testGameState = GameStateFactory.createNewGameWithStarter("Fresh Pet", "wild_beast");
      const emptyRewards: ActivityReward[] = [];

      (GameLoop as any).updateActivityStatistics(testGameState, "foraging" as ActivityType, 20, emptyRewards);

      expect(testGameState.activityStats.foraging.completions).toBe(1);
      expect(testGameState.activityStats.foraging.timeSpent).toBe(20);
      expect(testGameState.activityStats.foraging.goldEarned).toBe(0);
      expect(testGameState.activityStats.foraging.itemsEarned).toBe(0);
      expect(testGameState.activityStats.foraging.experienceEarned).toBe(0);

      expect(testGameState.activityStats.totals.completions).toBe(1);
      expect(testGameState.activityStats.totals.timeSpent).toBe(20);
    });
  });

  describe("Save/Load Compatibility", () => {
    it("should include activityStats in new game state", () => {
      const newGameState = GameStateFactory.createNewGame();
      expect(newGameState.activityStats).toBeDefined();
      expect(newGameState.activityStats.totals.completions).toBe(0);
    });

    it("should validate game state includes activityStats", () => {
      const validGameState = GameStateFactory.createNewGame();
      expect(GameStateFactory.validateGameState(validGameState)).toBe(true);

      // Test that missing activityStats would fail validation
      const invalidGameState = { ...validGameState };
      delete (invalidGameState as any).activityStats;
      expect(GameStateFactory.validateGameState(invalidGameState)).toBe(false);
    });
  });
});
