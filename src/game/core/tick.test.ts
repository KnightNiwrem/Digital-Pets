/**
 * Tests for single tick processing logic.
 */

import { expect, test } from "bun:test";
import {
  ENERGY_REGEN_AWAKE,
  ENERGY_REGEN_SLEEPING,
} from "@/game/core/care/constants";
import { createTestPet } from "@/game/testing/createTestPet";
import { processPetTick } from "./tick";

test("processPetTick increments ageTicks by 1", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 5 },
  });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.growth.ageTicks).toBe(6);
});

test("processPetTick applies care stat decay when awake", () => {
  const pet = createTestPet();
  const updatedPet = processPetTick(pet);

  // Care stats should have decreased
  expect(updatedPet.careStats.satiety).toBeLessThan(pet.careStats.satiety);
  expect(updatedPet.careStats.hydration).toBeLessThan(pet.careStats.hydration);
  expect(updatedPet.careStats.happiness).toBeLessThan(pet.careStats.happiness);
});

test("processPetTick applies care stat decay when sleeping (slower rate)", () => {
  const awakePet = createTestPet();
  const sleepingPet = createTestPet({
    sleep: {
      isSleeping: true,
      sleepStartTime: Date.now(),
      sleepTicksToday: 0,
    },
  });

  const awakeUpdated = processPetTick(awakePet);
  const sleepingUpdated = processPetTick(sleepingPet);

  // Sleeping pet should lose less stats than awake pet
  expect(sleepingUpdated.careStats.satiety).toBeGreaterThan(
    awakeUpdated.careStats.satiety,
  );
  expect(sleepingUpdated.careStats.hydration).toBeGreaterThan(
    awakeUpdated.careStats.hydration,
  );
  expect(sleepingUpdated.careStats.happiness).toBeGreaterThan(
    awakeUpdated.careStats.happiness,
  );
});

test("processPetTick regenerates energy when awake", () => {
  const pet = createTestPet({ energyStats: { energy: 10_000 } });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.energyStats.energy).toBe(10_000 + ENERGY_REGEN_AWAKE);
});

test("processPetTick regenerates energy faster when sleeping", () => {
  const pet = createTestPet({
    energyStats: { energy: 10_000 },
    sleep: {
      isSleeping: true,
      sleepStartTime: Date.now(),
      sleepTicksToday: 0,
    },
  });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.energyStats.energy).toBe(10_000 + ENERGY_REGEN_SLEEPING);
});

test("processPetTick clamps energy to max", () => {
  // Baby stage max energy is 50_000
  const pet = createTestPet({ energyStats: { energy: 49_999 } });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.energyStats.energy).toBe(50_000);
});

test("processPetTick evaluates care life before stat decay", () => {
  // Create a pet with stats at 80% - should recover care life
  const pet = createTestPet({
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
    careLifeStats: {
      careLife: 50_000,
    },
  });
  const updatedPet = processPetTick(pet);

  // Care life should have increased because stats were above 75% before decay
  expect(updatedPet.careLifeStats.careLife).toBeGreaterThan(50_000);
});

test("processPetTick drains care life when stats are at 0", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 0,
      hydration: 0,
      happiness: 0,
    },
    careLifeStats: {
      careLife: 50_000,
    },
  });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.careLifeStats.careLife).toBeLessThan(50_000);
});

test("processPetTick clamps care life to max for stage", () => {
  // Baby stage max care life is 72_000
  const pet = createTestPet({
    careStats: {
      satiety: 50_000,
      hydration: 50_000,
      happiness: 50_000,
    },
    careLifeStats: {
      careLife: 71_999,
    },
  });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.careLifeStats.careLife).toBe(72_000);
});

test("processPetTick returns new pet object without mutating original", () => {
  const pet = createTestPet();
  const originalAgeTicks = pet.growth.ageTicks;
  const originalEnergy = pet.energyStats.energy;

  const updatedPet = processPetTick(pet);

  // Original should not be mutated
  expect(pet.growth.ageTicks).toBe(originalAgeTicks);
  expect(pet.energyStats.energy).toBe(originalEnergy);

  // Updated should be different
  expect(updatedPet).not.toBe(pet);
  expect(updatedPet.growth.ageTicks).toBe(originalAgeTicks + 1);
});

test("processPetTick clamps care stats at 0 (not negative)", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 10,
      hydration: 10,
      happiness: 10,
    },
  });
  const updatedPet = processPetTick(pet);

  expect(updatedPet.careStats.satiety).toBeGreaterThanOrEqual(0);
  expect(updatedPet.careStats.hydration).toBeGreaterThanOrEqual(0);
  expect(updatedPet.careStats.happiness).toBeGreaterThanOrEqual(0);
});
