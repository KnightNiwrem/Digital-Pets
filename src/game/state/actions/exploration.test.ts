/**
 * Tests for exploration state actions.
 */

import { describe, expect, test } from "bun:test";
import type { CompleteExplorationResult } from "@/game/core/exploration/exploration";
import { ActivityId } from "@/game/data/exploration/activities";
import { FOOD_ITEMS } from "@/game/data/items/food";
import {
  applyExplorationResults,
  cancelExploration,
  canStartExploration,
  startExploration,
} from "@/game/state/actions/exploration";
import { createTestPet } from "@/game/testing/createTestPet";
import type { ActiveExploration } from "@/game/types/activity";
import { type Tick, toMicro } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import type { Pet } from "@/game/types/pet";
import { SkillType } from "@/game/types/skill";

function createTestState(petOverrides?: Partial<Pet>): GameState {
  const pet = createTestPet({
    energyStats: { energy: toMicro(100) },
    ...petOverrides,
  });
  return {
    ...createInitialGameState(),
    pet,
    isInitialized: true,
  };
}

describe("canStartExploration", () => {
  test("returns false when no pet", () => {
    const state = { ...createInitialGameState(), pet: null };
    const result = canStartExploration(
      state,
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
    expect(result.reason).toContain("No pet");
  });

  test("returns true when conditions met", () => {
    const state = createTestState();
    const result = canStartExploration(
      state,
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(true);
  });

  test("returns false when pet not idle", () => {
    const state = createTestState({ activityState: ActivityState.Training });
    const result = canStartExploration(
      state,
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.canStart).toBe(false);
  });
});

describe("startExploration", () => {
  test("returns failure when no pet", () => {
    const state = { ...createInitialGameState(), pet: null };
    const result = startExploration(
      state,
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );
    expect(result.success).toBe(false);
    expect(result.message).toContain("No pet");
  });

  test("starts exploration successfully", () => {
    const state = createTestState();
    const result = startExploration(
      state,
      "meadow",
      ActivityId.Foraging,
      10 as Tick,
    );

    expect(result.success).toBe(true);
    expect(result.state.pet?.activityState).toBe(ActivityState.Exploring);
    expect(result.state.pet?.activeExploration).toBeDefined();
    expect(result.state.pet?.activeExploration?.activityId).toBe(
      ActivityId.Foraging,
    );
  });

  test("deducts energy when starting exploration", () => {
    const initialEnergy = toMicro(100);
    const state = createTestState({ energyStats: { energy: initialEnergy } });
    const result = startExploration(
      state,
      "meadow",
      ActivityId.Foraging,
      0 as Tick,
    );

    expect(result.success).toBe(true);
    // Foraging costs 15 energy
    expect(result.state.pet?.energyStats.energy).toBe(
      initialEnergy - toMicro(15),
    );
  });
});

describe("cancelExploration", () => {
  test("returns failure when no pet", () => {
    const state = { ...createInitialGameState(), pet: null };
    const result = cancelExploration(state);
    expect(result.success).toBe(false);
    expect(result.message).toContain("No pet");
  });

  test("returns failure when no active exploration", () => {
    const state = createTestState();
    const result = cancelExploration(state);
    expect(result.success).toBe(false);
    expect(result.message).toContain("No exploration");
  });

  test("refunds energy on cancel", () => {
    const initialEnergy = toMicro(50);
    const energyCost = toMicro(15);
    const exploration: ActiveExploration = {
      activityId: ActivityId.Foraging,
      locationId: "meadow",
      startTick: 0 as Tick,
      durationTicks: 10 as Tick,
      ticksRemaining: 5 as Tick,
      energyCost,
    };

    const state = createTestState({
      activityState: ActivityState.Exploring,
      energyStats: { energy: initialEnergy },
      activeExploration: exploration,
    });

    const result = cancelExploration(state);

    expect(result.success).toBe(true);
    expect(result.state.pet?.activityState).toBe(ActivityState.Idle);
    expect(result.state.pet?.activeExploration).toBeUndefined();
    expect(result.state.pet?.energyStats.energy).toBe(
      initialEnergy + energyCost,
    );
    expect(result.message).toContain("refunded");
  });
});

describe("applyExplorationResults", () => {
  function createCompletionResult(
    pet: Pet,
    overrides?: Partial<CompleteExplorationResult>,
  ): CompleteExplorationResult {
    return {
      success: true,
      pet: {
        ...pet,
        activityState: ActivityState.Idle,
        activeExploration: undefined,
      },
      itemsFound: [],
      skillXpGains: {},
      message: "Exploration complete",
      ...overrides,
    };
  }

  function getPet(state: GameState): Pet {
    if (!state.pet) {
      throw new Error("Test state must have a pet");
    }
    return state.pet;
  }

  test("returns failure when no pet", () => {
    const state = { ...createInitialGameState(), pet: null };
    const pet = createTestPet();
    const completionResult = createCompletionResult(pet);

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("No pet");
  });

  test("returns failure when completion result is unsuccessful", () => {
    const state = createTestState();
    const pet = getPet(state);
    const completionResult = createCompletionResult(pet, {
      success: false,
      message: "No active exploration",
    });

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("No active exploration");
  });

  test("updates pet state from completion result", () => {
    const state = createTestState({
      activityState: ActivityState.Exploring,
    });
    const pet = getPet(state);
    const completionResult = createCompletionResult(pet);

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(true);
    expect(result.state.pet?.activityState).toBe(ActivityState.Idle);
    expect(result.state.pet?.activeExploration).toBeUndefined();
  });

  test("adds found items to inventory", () => {
    const state = createTestState();
    const pet = getPet(state);
    const completionResult = createCompletionResult(pet, {
      itemsFound: [
        { itemId: FOOD_ITEMS.APPLE.id, quantity: 3 },
        { itemId: FOOD_ITEMS.BERRIES.id, quantity: 1 },
      ],
    });

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(true);
    expect(result.itemsFound).toEqual([
      { itemId: FOOD_ITEMS.APPLE.id, quantity: 3 },
      { itemId: FOOD_ITEMS.BERRIES.id, quantity: 1 },
    ]);

    // Check inventory was updated
    const appleItem = result.state.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.APPLE.id,
    );
    const berriesItem = result.state.player.inventory.items.find(
      (item) => item.itemId === FOOD_ITEMS.BERRIES.id,
    );
    expect(appleItem?.quantity).toBe(3);
    expect(berriesItem?.quantity).toBe(1);
  });

  test("applies skill XP gains", () => {
    const state = createTestState();
    const pet = getPet(state);
    const initialForagingXp = state.player.skills[SkillType.Foraging].currentXp;
    const completionResult = createCompletionResult(pet, {
      skillXpGains: { [SkillType.Foraging]: 15 },
    });

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(true);
    expect(result.skillXpGains).toEqual({ [SkillType.Foraging]: 15 });
    expect(result.state.player.skills[SkillType.Foraging].currentXp).toBe(
      initialForagingXp + 15,
    );
  });

  test("returns skill level ups", () => {
    const state = createTestState();
    const pet = getPet(state);
    // Large XP gain to trigger level up
    const completionResult = createCompletionResult(pet, {
      skillXpGains: { [SkillType.Foraging]: 1000 },
    });

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(true);
    expect(result.skillLevelUps?.[SkillType.Foraging]).toBe(true);
    expect(
      result.state.player.skills[SkillType.Foraging].level,
    ).toBeGreaterThan(1);
  });

  test("handles successful completion with no items found", () => {
    const state = createTestState();
    const pet = getPet(state);
    const completionResult = createCompletionResult(pet, {
      itemsFound: [],
      skillXpGains: { [SkillType.Foraging]: 15 },
      message: "Nothing found this time",
    });

    const result = applyExplorationResults(
      state,
      completionResult,
      ActivityId.Foraging,
    );

    expect(result.success).toBe(true);
    expect(result.itemsFound).toEqual([]);
    expect(result.message).toBe("Nothing found this time");
  });
});
