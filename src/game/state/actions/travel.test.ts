/**
 * Tests for travel state actions.
 */

import { describe, expect, test } from "bun:test";
import {
  createTestGameState,
  createTestPet,
} from "@/game/testing/createTestPet";
import { toMicro } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import { QuestState } from "@/game/types/quest";
import { checkCanTravel, travelToLocation } from "./travel";

describe("checkCanTravel", () => {
  test("returns false when no pet", () => {
    const state = createTestGameState(null);
    const result = checkCanTravel(state, "meadow");

    expect(result.canTravel).toBe(false);
    expect(result.message).toContain("pet");
  });

  test("returns false for unknown destination", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
    });

    const result = checkCanTravel(state, "nonexistent_location");

    expect(result.canTravel).toBe(false);
  });

  test("returns false for unconnected destinations", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    // Home is only connected to meadow and willowbrook
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
    });

    // Try to travel to a location not directly connected to home
    const result = checkCanTravel(state, "ironhaven");

    expect(result.canTravel).toBe(false);
  });

  test("returns false when pet is not idle", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Training,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
      ],
    });

    const result = checkCanTravel(state, "meadow");

    expect(result.canTravel).toBe(false);
    // Message may vary based on activity state validation
  });

  test("returns false when pet has insufficient energy", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(1) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
      ],
    });

    const result = checkCanTravel(state, "meadow");

    expect(result.canTravel).toBe(false);
    expect(result.message).toContain("energy");
  });

  test("returns true when all conditions met", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
      ],
    });

    const result = checkCanTravel(state, "meadow");

    expect(result.canTravel).toBe(true);
    expect(result.energyCost).toBeDefined();
  });

  test("includes energy cost in result", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
      ],
    });

    const result = checkCanTravel(state, "meadow");

    // Home to meadow costs 5 energy
    expect(result.energyCost).toBe(5);
  });
});

describe("travelToLocation", () => {
  test("returns failure when no pet", () => {
    const state = createTestGameState(null);
    const result = travelToLocation(state, "meadow");

    expect(result.success).toBe(false);
    expect(result.message).toContain("pet");
  });

  test("travels successfully and deducts energy", () => {
    const initialEnergy = toMicro(100);
    const pet = createTestPet({
      energyStats: { energy: initialEnergy },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
      ],
    });

    const result = travelToLocation(state, "meadow");

    expect(result.success).toBe(true);
    expect(result.state.player.currentLocationId).toBe("meadow");
    // Energy should be reduced by travel cost (5 energy = 5_000 micro)
    expect(result.state.pet?.energyStats.energy).toBe(
      initialEnergy - toMicro(5),
    );
  });

  test("updates quest progress for Visit objectives", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
        {
          questId: "tutorial_exploration",
          state: QuestState.Active,
          objectiveProgress: {},
        },
      ],
    });

    const result = travelToLocation(state, "meadow");

    expect(result.success).toBe(true);
    // The Visit objective for "visit_meadow" should be incremented
    const questProgress = result.state.quests.find(
      (q) => q.questId === "tutorial_exploration",
    );
    expect(questProgress?.objectiveProgress.visit_meadow).toBe(1);
  });

  test("returns failure for requirements not met", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      // No completed tutorial quest, meadow requires it
      quests: [],
    });

    const result = travelToLocation(state, "meadow");

    expect(result.success).toBe(false);
  });

  test("does not modify original state", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet, {
      player: { currentLocationId: "home" },
      quests: [
        {
          questId: "tutorial_first_steps",
          state: QuestState.Completed,
          objectiveProgress: {},
        },
      ],
    });
    const originalLocation = state.player.currentLocationId;
    const originalEnergy = state.pet?.energyStats.energy;

    travelToLocation(state, "meadow");

    expect(state.player.currentLocationId).toBe(originalLocation);
    expect(state.pet?.energyStats.energy).toBe(originalEnergy);
  });
});
