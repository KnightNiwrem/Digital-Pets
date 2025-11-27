/**
 * Tests for travel logic.
 */

import { expect, test } from "bun:test";
import {
  createSleepingTestPet,
  createTestPet,
} from "@/game/testing/createTestPet";
import { toMicro } from "@/game/types/common";
import { GrowthStage } from "@/game/types/constants";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import type { Pet } from "@/game/types/pet";
import {
  calculateTravelCost,
  canTravel,
  checkLocationRequirements,
  travel,
} from "./travel";

function createTestState(options: {
  pet?: Pet | null;
  currentLocationId?: string;
  quests?: { questId: string; isCompleted: boolean }[];
}): GameState {
  const {
    pet = createTestPet(),
    currentLocationId = "home",
    quests = [],
  } = options;
  return {
    ...createInitialGameState(),
    pet,
    player: {
      ...createInitialGameState().player,
      inventory: { items: [] },
      currency: { coins: 0 },
      currentLocationId,
    },
    quests: quests.map((q) => ({
      questId: q.questId,
      state: q.isCompleted ? "completed" : "active",
      objectiveProgress: {},
    })),
    isInitialized: true,
  };
}

// checkLocationRequirements tests

test("checkLocationRequirements returns met for no requirements", () => {
  const state = createTestState({});
  const result = checkLocationRequirements(state, undefined);
  expect(result.met).toBe(true);
});

test("checkLocationRequirements returns not met when pet is null and stage required", () => {
  const state = createTestState({ pet: null });
  const result = checkLocationRequirements(state, { stage: GrowthStage.Child });
  expect(result.met).toBe(false);
  expect(result.reason).toBe("You need a pet to access this location.");
});

test("checkLocationRequirements returns not met when stage insufficient", () => {
  const state = createTestState({
    pet: createTestPet({ growth: { stage: GrowthStage.Baby } }),
  });
  const result = checkLocationRequirements(state, { stage: GrowthStage.Child });
  expect(result.met).toBe(false);
  expect(result.reason).toContain("must be at least");
});

test("checkLocationRequirements returns met when stage sufficient", () => {
  const state = createTestState({
    pet: createTestPet({ growth: { stage: GrowthStage.Child } }),
  });
  const result = checkLocationRequirements(state, { stage: GrowthStage.Child });
  expect(result.met).toBe(true);
});

test("checkLocationRequirements returns met when stage exceeds requirement", () => {
  const state = createTestState({
    pet: createTestPet({ growth: { stage: GrowthStage.Adult } }),
  });
  const result = checkLocationRequirements(state, { stage: GrowthStage.Child });
  expect(result.met).toBe(true);
});

test("checkLocationRequirements returns not met for incomplete quest", () => {
  const state = createTestState({
    quests: [{ questId: "test-quest", isCompleted: false }],
  });
  const result = checkLocationRequirements(state, { questId: "test-quest" });
  expect(result.met).toBe(false);
  expect(result.reason).toContain("complete a required quest");
});

test("checkLocationRequirements returns met for completed quest", () => {
  const state = createTestState({
    quests: [{ questId: "test-quest", isCompleted: true }],
  });
  const result = checkLocationRequirements(state, { questId: "test-quest" });
  expect(result.met).toBe(true);
});

// calculateTravelCost tests

test("calculateTravelCost returns null for unknown location", () => {
  const result = calculateTravelCost("unknown", "home");
  expect(result).toBeNull();
});

test("calculateTravelCost returns null for unconnected destination", () => {
  const result = calculateTravelCost("home", "misty_woods");
  expect(result).toBeNull();
});

test("calculateTravelCost returns base cost for connected location", () => {
  const result = calculateTravelCost("home", "meadow");
  expect(result).toBe(5);
});

test("calculateTravelCost applies terrain modifier", () => {
  const result = calculateTravelCost("meadow", "misty_woods");
  // Base cost 10 * terrain modifier 1.2 = 12
  expect(result).toBe(12);
});

// canTravel tests

test("canTravel fails when no pet", () => {
  const state = createTestState({ pet: null });
  const result = canTravel(state, "meadow");
  expect(result.success).toBe(false);
  expect(result.message).toBe("You need a pet to travel.");
});

test("canTravel fails when pet is sleeping", () => {
  const state = createTestState({ pet: createSleepingTestPet() });
  const result = canTravel(state, "meadow");
  expect(result.success).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("canTravel fails for unknown destination", () => {
  const state = createTestState({});
  const result = canTravel(state, "unknown-location");
  expect(result.success).toBe(false);
  expect(result.message).toBe("Unknown destination.");
});

test("canTravel fails for disconnected locations", () => {
  const state = createTestState({});
  const result = canTravel(state, "misty_woods");
  expect(result.success).toBe(false);
  expect(result.message).toContain("cannot travel there directly");
});

test("canTravel fails when energy insufficient", () => {
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: toMicro(2) } }),
  });
  const result = canTravel(state, "meadow");
  expect(result.success).toBe(false);
  expect(result.message).toContain("Not enough energy");
  expect(result.energyCost).toBe(5);
});

test("canTravel succeeds with sufficient energy", () => {
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: toMicro(50) } }),
  });
  const result = canTravel(state, "meadow");
  expect(result.success).toBe(true);
  expect(result.message).toBe("Ready to travel.");
  expect(result.energyCost).toBe(5);
});

test("canTravel fails when stage requirement not met", () => {
  const state = createTestState({
    pet: createTestPet({
      growth: { stage: GrowthStage.Baby },
      energyStats: { energy: toMicro(50) },
    }),
    currentLocationId: "meadow",
  });
  const result = canTravel(state, "misty_woods");
  expect(result.success).toBe(false);
  expect(result.message).toContain("must be at least");
});

test("canTravel succeeds when stage requirement met", () => {
  const state = createTestState({
    pet: createTestPet({
      growth: { stage: GrowthStage.Child },
      energyStats: { energy: toMicro(50) },
    }),
    currentLocationId: "meadow",
  });
  const result = canTravel(state, "misty_woods");
  expect(result.success).toBe(true);
});

// travel tests

test("travel fails when canTravel fails", () => {
  const state = createTestState({ pet: null });
  const result = travel(state, "meadow");
  expect(result.success).toBe(false);
  expect(result.state).toBe(state);
});

test("travel succeeds and deducts energy", () => {
  const initialEnergy = toMicro(50);
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: initialEnergy } }),
  });
  const result = travel(state, "meadow");

  expect(result.success).toBe(true);
  expect(result.state.player.currentLocationId).toBe("meadow");
  expect(result.state.pet?.energyStats.energy).toBe(initialEnergy - toMicro(5));
  expect(result.message).toContain("Traveled to");
});

test("travel preserves other state properties", () => {
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: toMicro(50) } }),
  });
  state.player.currency.coins = 100;
  const result = travel(state, "meadow");

  expect(result.success).toBe(true);
  expect(result.state.player.currency.coins).toBe(100);
});

test("travel does not mutate original state", () => {
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: toMicro(50) } }),
  });
  const originalLocation = state.player.currentLocationId;
  const originalEnergy = state.pet?.energyStats.energy;

  travel(state, "meadow");

  expect(state.player.currentLocationId).toBe(originalLocation);
  expect(state.pet?.energyStats.energy).toBe(originalEnergy);
});

test("travel energy cannot go below 0", () => {
  // Set energy to exactly the cost
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: toMicro(5) } }),
  });
  const result = travel(state, "meadow");

  expect(result.success).toBe(true);
  expect(result.state.pet?.energyStats.energy).toBe(0);
});

test("travel updates quest progress for Visit objectives", () => {
  const state = createTestState({
    pet: createTestPet({ energyStats: { energy: toMicro(50) } }),
    quests: [],
  });
  // Add an active quest with a visit objective for meadow
  state.quests = [
    {
      questId: "tutorial_exploration",
      state: "active",
      objectiveProgress: {},
    },
  ];

  const result = travel(state, "meadow");

  expect(result.success).toBe(true);
  expect(result.state.quests[0]?.objectiveProgress.visit_meadow).toBe(1);
});
