/**
 * Tests for training state actions.
 */

import { describe, expect, test } from "bun:test";
import { strengthFacility } from "@/game/data/facilities/facilities";
import {
  createTestGameState,
  createTestPet,
} from "@/game/testing/createTestPet";
import { TrainingSessionType } from "@/game/types/activity";
import { toMicro } from "@/game/types/common";
import { ActivityState, GrowthStage } from "@/game/types/constants";
import { cancelTraining, startTraining } from "./training";

// Fixed timestamp for deterministic test fixtures
const FROZEN_TIME = 1_733_400_000_000;

describe("startTraining", () => {
  test("returns failure when no pet", () => {
    const state = createTestGameState(null);
    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Basic,
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("No pet");
  });

  test("starts training successfully with valid inputs", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet);

    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Basic,
    );

    expect(result.success).toBe(true);
    expect(result.state.pet?.activityState).toBe(ActivityState.Training);
    expect(result.state.pet?.activeTraining).toBeDefined();
    expect(result.state.pet?.activeTraining?.facilityId).toBe(
      strengthFacility.id,
    );
    expect(result.state.pet?.activeTraining?.sessionType).toBe(
      TrainingSessionType.Basic,
    );
  });

  test("deducts energy when starting training", () => {
    const initialEnergy = toMicro(100);
    const pet = createTestPet({
      energyStats: { energy: initialEnergy },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet);

    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Basic,
    );

    expect(result.success).toBe(true);
    expect(result.state.pet?.energyStats.energy).toBeLessThan(initialEnergy);
  });

  test("returns failure when pet is not idle", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Training,
    });
    const state = createTestGameState(pet);

    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Basic,
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("train");
  });

  test("returns failure when pet has insufficient energy", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(1) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet);

    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Basic,
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("energy");
  });

  test("returns failure for unknown facility", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
    });
    const state = createTestGameState(pet);

    const result = startTraining(
      state,
      "nonexistent_facility",
      TrainingSessionType.Basic,
    );

    expect(result.success).toBe(false);
  });

  test("returns failure when growth stage requirement not met", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
      growth: {
        stage: GrowthStage.Baby,
        substage: 1,
        birthTime: FROZEN_TIME,
        ageTicks: 0,
      },
    });
    const state = createTestGameState(pet);

    // Intensive session requires Child stage
    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Intensive,
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("stage");
  });

  test("allows intensive session when pet meets stage requirement", () => {
    const pet = createTestPet({
      energyStats: { energy: toMicro(100) },
      activityState: ActivityState.Idle,
      growth: {
        stage: GrowthStage.Child,
        substage: 1,
        birthTime: FROZEN_TIME,
        ageTicks: 1000,
      },
    });
    const state = createTestGameState(pet);

    const result = startTraining(
      state,
      strengthFacility.id,
      TrainingSessionType.Intensive,
    );

    expect(result.success).toBe(true);
    expect(result.state.pet?.activeTraining?.sessionType).toBe(
      TrainingSessionType.Intensive,
    );
  });
});

describe("cancelTraining", () => {
  test("returns failure when no pet", () => {
    const state = createTestGameState(null);
    const result = cancelTraining(state);

    expect(result.success).toBe(false);
    expect(result.message).toContain("No pet");
  });

  test("returns failure when no active training", () => {
    const pet = createTestPet({
      activityState: ActivityState.Idle,
      activeTraining: undefined,
    });
    const state = createTestGameState(pet);

    const result = cancelTraining(state);

    expect(result.success).toBe(false);
    expect(result.message).toContain("training");
  });

  test("cancels training and refunds energy", () => {
    const energyCost = toMicro(10);
    const currentEnergy = toMicro(30); // Lower energy so refund fits within max
    const pet = createTestPet({
      activityState: ActivityState.Training,
      energyStats: { energy: currentEnergy },
      activeTraining: {
        facilityId: strengthFacility.id,
        sessionType: TrainingSessionType.Basic,
        startTick: 0,
        durationTicks: 60,
        ticksRemaining: 30,
        energyCost,
      },
    });
    const state = createTestGameState(pet);

    const result = cancelTraining(state);

    expect(result.success).toBe(true);
    expect(result.state.pet?.activityState).toBe(ActivityState.Idle);
    expect(result.state.pet?.activeTraining).toBeUndefined();
    // Energy should be refunded (capped at max energy from pet's stage stats)
    expect(result.state.pet?.energyStats.energy).toBe(
      currentEnergy + energyCost,
    );
  });

  test("does not modify original state", () => {
    const pet = createTestPet({
      activityState: ActivityState.Training,
      energyStats: { energy: toMicro(50) },
      activeTraining: {
        facilityId: strengthFacility.id,
        sessionType: TrainingSessionType.Basic,
        startTick: 0,
        durationTicks: 60,
        ticksRemaining: 30,
        energyCost: toMicro(10),
      },
    });
    const state = createTestGameState(pet);
    const originalActivityState = state.pet?.activityState;

    cancelTraining(state);

    expect(state.pet?.activityState).toBe(originalActivityState);
  });
});
