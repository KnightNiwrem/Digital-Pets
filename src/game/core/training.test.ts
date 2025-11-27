/**
 * Tests for training system core logic.
 */

import { expect, test } from "bun:test";
import {
  applyTrainingCompletion,
  cancelTraining,
  canStartTraining,
  completeTraining,
  getTrainingProgress,
  isSessionAvailable,
  processTrainingTick,
  startTraining,
} from "@/game/core/training";
import { createTestPet } from "@/game/testing/createTestPet";
import type { ActiveTraining } from "@/game/types/activity";
import { TrainingSessionType } from "@/game/types/activity";
import { TICKS_PER_HOUR, toMicro } from "@/game/types/common";
import { ActivityState, GrowthStage } from "@/game/types/constants";

// canStartTraining tests
test("canStartTraining returns true when pet is idle with enough energy", () => {
  const pet = createTestPet();
  const result = canStartTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
  );
  expect(result.canTrain).toBe(true);
});

test("canStartTraining fails when pet is sleeping", () => {
  const pet = createTestPet({
    activityState: ActivityState.Sleeping,
    sleep: { isSleeping: true, sleepStartTime: Date.now(), sleepTicksToday: 0 },
  });
  const result = canStartTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
  );
  expect(result.canTrain).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("canStartTraining fails when pet is already training", () => {
  const pet = createTestPet({ activityState: ActivityState.Training });
  const result = canStartTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
  );
  expect(result.canTrain).toBe(false);
  expect(result.message).toContain("training");
});

test("canStartTraining fails when not enough energy", () => {
  const pet = createTestPet({ energyStats: { energy: toMicro(5) } });
  const result = canStartTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
  );
  expect(result.canTrain).toBe(false);
  expect(result.message).toContain("Not enough energy");
});

test("canStartTraining fails when growth stage is insufficient", () => {
  const pet = createTestPet({
    growth: { ...createTestPet().growth, stage: GrowthStage.Baby },
  });
  const result = canStartTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Intensive,
  );
  expect(result.canTrain).toBe(false);
  expect(result.message).toContain("stage");
});

test("canStartTraining fails for unknown facility", () => {
  const pet = createTestPet();
  const result = canStartTraining(
    pet,
    "unknown_facility",
    TrainingSessionType.Basic,
  );
  expect(result.canTrain).toBe(false);
  expect(result.message).toContain("not found");
});

// startTraining tests
test("startTraining succeeds and deducts energy", () => {
  const pet = createTestPet();
  const result = startTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
    100,
  );
  expect(result.success).toBe(true);
  expect(result.pet.activityState).toBe(ActivityState.Training);
  expect(result.pet.activeTraining).toBeDefined();
  expect(result.pet.energyStats.energy).toBeLessThan(pet.energyStats.energy);
});

test("startTraining sets correct training state", () => {
  const pet = createTestPet();
  const result = startTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
    100,
  );
  expect(result.pet.activeTraining?.facilityId).toBe("facility_strength");
  expect(result.pet.activeTraining?.sessionType).toBe(
    TrainingSessionType.Basic,
  );
  expect(result.pet.activeTraining?.startTick).toBe(100);
  expect(result.pet.activeTraining?.durationTicks).toBe(TICKS_PER_HOUR);
});

test("startTraining fails when cannot start", () => {
  const pet = createTestPet({ activityState: ActivityState.Sleeping });
  const result = startTraining(
    pet,
    "facility_strength",
    TrainingSessionType.Basic,
    100,
  );
  expect(result.success).toBe(false);
  expect(result.pet.activityState).toBe(ActivityState.Sleeping);
});

// processTrainingTick tests
test("processTrainingTick decrements ticksRemaining", () => {
  const training: ActiveTraining = {
    facilityId: "facility_strength",
    sessionType: TrainingSessionType.Basic,
    startTick: 0,
    durationTicks: 120,
    ticksRemaining: 120,
  };
  const result = processTrainingTick(training);
  expect(result?.ticksRemaining).toBe(119);
});

test("processTrainingTick returns null when training completes", () => {
  const training: ActiveTraining = {
    facilityId: "facility_strength",
    sessionType: TrainingSessionType.Basic,
    startTick: 0,
    durationTicks: 120,
    ticksRemaining: 1,
  };
  const result = processTrainingTick(training);
  expect(result).toBeNull();
});

// completeTraining tests
test("completeTraining returns correct stat gains", () => {
  const pet = createTestPet({
    activityState: ActivityState.Training,
    activeTraining: {
      facilityId: "facility_strength",
      sessionType: TrainingSessionType.Basic,
      startTick: 0,
      durationTicks: 120,
      ticksRemaining: 0,
    },
  });
  const result = completeTraining(pet);
  expect(result.success).toBe(true);
  expect(result.statsGained?.strength).toBe(1);
});

test("completeTraining fails when no active training", () => {
  const pet = createTestPet();
  const result = completeTraining(pet);
  expect(result.success).toBe(false);
});

// applyTrainingCompletion tests
test("applyTrainingCompletion clears training and applies stats", () => {
  const pet = createTestPet({
    activityState: ActivityState.Training,
    activeTraining: {
      facilityId: "facility_strength",
      sessionType: TrainingSessionType.Basic,
      startTick: 0,
      durationTicks: 120,
      ticksRemaining: 0,
    },
  });
  const result = applyTrainingCompletion(pet);
  expect(result.activityState).toBe(ActivityState.Idle);
  expect(result.activeTraining).toBeUndefined();
  expect(result.battleStats.strength).toBe(11);
});

// cancelTraining tests
test("cancelTraining clears training state", () => {
  const pet = createTestPet({
    activityState: ActivityState.Training,
    activeTraining: {
      facilityId: "facility_strength",
      sessionType: TrainingSessionType.Basic,
      startTick: 0,
      durationTicks: 120,
      ticksRemaining: 60,
    },
  });
  const result = cancelTraining(pet);
  expect(result.success).toBe(true);
  expect(result.pet.activityState).toBe(ActivityState.Idle);
  expect(result.pet.activeTraining).toBeUndefined();
});

test("cancelTraining fails when no training active", () => {
  const pet = createTestPet();
  const result = cancelTraining(pet);
  expect(result.success).toBe(false);
});

// getTrainingProgress tests
test("getTrainingProgress returns correct percentage", () => {
  const training: ActiveTraining = {
    facilityId: "facility_strength",
    sessionType: TrainingSessionType.Basic,
    startTick: 0,
    durationTicks: 100,
    ticksRemaining: 50,
  };
  expect(getTrainingProgress(training)).toBe(50);
});

test("getTrainingProgress returns 0 at start", () => {
  const training: ActiveTraining = {
    facilityId: "facility_strength",
    sessionType: TrainingSessionType.Basic,
    startTick: 0,
    durationTicks: 100,
    ticksRemaining: 100,
  };
  expect(getTrainingProgress(training)).toBe(0);
});

test("getTrainingProgress returns 100 at end", () => {
  const training: ActiveTraining = {
    facilityId: "facility_strength",
    sessionType: TrainingSessionType.Basic,
    startTick: 0,
    durationTicks: 100,
    ticksRemaining: 0,
  };
  expect(getTrainingProgress(training)).toBe(100);
});

// isSessionAvailable tests
test("isSessionAvailable returns true when no minStage required", () => {
  const session = {
    type: TrainingSessionType.Basic,
    name: "Basic",
    description: "Basic session",
    durationTicks: 120,
    energyCost: 10,
    primaryStatGain: 1,
    secondaryStatGain: 0,
  };
  expect(isSessionAvailable(session, GrowthStage.Baby)).toBe(true);
});

test("isSessionAvailable returns false when stage is insufficient", () => {
  const session = {
    type: TrainingSessionType.Advanced,
    name: "Advanced",
    description: "Advanced session",
    durationTicks: 480,
    energyCost: 50,
    primaryStatGain: 6,
    secondaryStatGain: 2,
    minStage: GrowthStage.Teen,
  };
  expect(isSessionAvailable(session, GrowthStage.Child)).toBe(false);
});

test("isSessionAvailable returns true when stage meets requirement", () => {
  const session = {
    type: TrainingSessionType.Intensive,
    name: "Intensive",
    description: "Intensive session",
    durationTicks: 240,
    energyCost: 25,
    primaryStatGain: 3,
    secondaryStatGain: 1,
    minStage: GrowthStage.Child,
  };
  expect(isSessionAvailable(session, GrowthStage.Teen)).toBe(true);
});
