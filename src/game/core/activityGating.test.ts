/**
 * Tests for centralized activity gating utilities.
 */

import { expect, test } from "bun:test";
import { createTestPet } from "@/game/testing/createTestPet";
import { toMicro } from "@/game/types/common";
import { ActivityState } from "@/game/types/constants";
import {
  checkActivityIdle,
  checkActivityRequirements,
  checkEnergy,
} from "./activityGating";

test("checkActivityIdle allows when pet is idle", () => {
  const pet = createTestPet({ activityState: ActivityState.Idle });
  const result = checkActivityIdle(pet, "train");

  expect(result.allowed).toBe(true);
  expect(result.message).toBe("");
});

test("checkActivityIdle blocks when pet is sleeping", () => {
  const pet = createTestPet({ activityState: ActivityState.Sleeping });
  const result = checkActivityIdle(pet, "train");

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("sleeping");
});

test("checkActivityIdle blocks when pet is training", () => {
  const pet = createTestPet({ activityState: ActivityState.Training });
  const result = checkActivityIdle(pet, "forage");

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("training");
});

test("checkActivityIdle blocks when pet is exploring", () => {
  const pet = createTestPet({ activityState: ActivityState.Exploring });
  const result = checkActivityIdle(pet, "train");

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("exploring");
});

test("checkActivityIdle blocks when pet is battling", () => {
  const pet = createTestPet({ activityState: ActivityState.Battling });
  const result = checkActivityIdle(pet, "feed");

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("battling");
});

test("checkActivityIdle uses sameActivityState for clearer messaging", () => {
  const pet = createTestPet({ activityState: ActivityState.Training });
  const result = checkActivityIdle(pet, "train", ActivityState.Training);

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("already training");
});

test("checkEnergy allows when sufficient energy", () => {
  const currentEnergy = toMicro(50); // 50 display units
  const requiredEnergy = 30;
  const result = checkEnergy(currentEnergy, requiredEnergy);

  expect(result.allowed).toBe(true);
  expect(result.message).toBe("");
});

test("checkEnergy blocks when insufficient energy", () => {
  const currentEnergy = toMicro(20); // 20 display units
  const requiredEnergy = 30;
  const result = checkEnergy(currentEnergy, requiredEnergy);

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("Not enough energy");
  expect(result.message).toContain("30");
  expect(result.message).toContain("20");
});

test("checkActivityRequirements checks activity state first", () => {
  const pet = createTestPet({
    activityState: ActivityState.Training,
    energyStats: { energy: toMicro(100) },
  });
  const result = checkActivityRequirements(pet, "forage", 10);

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("training");
});

test("checkActivityRequirements checks energy when idle", () => {
  const pet = createTestPet({
    activityState: ActivityState.Idle,
    energyStats: { energy: toMicro(5) },
  });
  const result = checkActivityRequirements(pet, "train", 30);

  expect(result.allowed).toBe(false);
  expect(result.message).toContain("Not enough energy");
});

test("checkActivityRequirements allows when idle with sufficient energy", () => {
  const pet = createTestPet({
    activityState: ActivityState.Idle,
    energyStats: { energy: toMicro(50) },
  });
  const result = checkActivityRequirements(pet, "train", 30);

  expect(result.allowed).toBe(true);
  expect(result.message).toBe("");
});

test("checkActivityRequirements skips energy check when not provided", () => {
  const pet = createTestPet({
    activityState: ActivityState.Idle,
    energyStats: { energy: toMicro(0) }, // 0 energy
  });
  const result = checkActivityRequirements(pet, "feed");

  expect(result.allowed).toBe(true);
  expect(result.message).toBe("");
});
