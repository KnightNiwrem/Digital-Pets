/**
 * Tests for exploration state actions.
 */

import { describe, expect, test } from "bun:test";
import { ActivityId } from "@/game/data/exploration/activities";
import {
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
