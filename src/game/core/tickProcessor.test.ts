/**
 * Tests for tick processor batch processing.
 */

import { expect, test } from "bun:test";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import type { Pet } from "@/game/types/pet";
import {
  processGameTick,
  processMultipleTicks,
  processOfflineCatchup,
} from "./tickProcessor";

function createTestPet(overrides: Partial<Pet> = {}): Pet {
  return {
    identity: {
      id: "test_pet",
      name: "Test Pet",
      speciesId: "florabit",
    },
    growth: {
      stage: "baby",
      substage: 1,
      birthTime: Date.now(),
      ageTicks: 0,
    },
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
    energyStats: {
      energy: 40_000,
    },
    careLifeStats: {
      careLife: 72_000,
    },
    battleStats: {
      strength: 10,
      endurance: 10,
      agility: 10,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    },
    resistances: {
      slashing: 0,
      piercing: 0,
      crushing: 0,
      chemical: 0,
      thermal: 0,
      electric: 0,
    },
    poop: {
      count: 0,
      ticksUntilNext: 480,
    },
    sleep: {
      isSleeping: false,
      sleepStartTime: null,
      sleepTicksToday: 0,
    },
    activityState: "idle",
    ...overrides,
  };
}

function createTestGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState(),
    ...overrides,
  };
}

// Tests for processGameTick

test("processGameTick updates state when no pet", () => {
  const state = createTestGameState({ pet: null, totalTicks: 5 });
  const newState = processGameTick(state);

  expect(newState.totalTicks).toBe(6);
  expect(newState.lastSaveTime).toBeGreaterThan(0);
  expect(newState.pet).toBeNull();
});

test("processGameTick updates totalTicks", () => {
  const state = createTestGameState({ pet: createTestPet(), totalTicks: 10 });
  const newState = processGameTick(state);

  expect(newState.totalTicks).toBe(11);
});

test("processGameTick updates lastSaveTime", () => {
  const state = createTestGameState({ pet: createTestPet(), lastSaveTime: 0 });
  const newState = processGameTick(state);

  expect(newState.lastSaveTime).toBeGreaterThan(0);
});

test("processGameTick processes pet tick", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet });
  const newState = processGameTick(state);

  // Pet should have been processed - age incremented
  expect(newState.pet?.growth.ageTicks).toBe(1);
  // Care stats should have decayed
  expect(newState.pet?.careStats.satiety).toBeLessThan(pet.careStats.satiety);
});

// Tests for processMultipleTicks

test("processMultipleTicks processes ticks sequentially", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const newState = processMultipleTicks(state, 5);

  expect(newState.totalTicks).toBe(5);
  expect(newState.pet?.growth.ageTicks).toBe(5);
});

test("processMultipleTicks handles 0 ticks", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 10 });
  const newState = processMultipleTicks(state, 0);

  expect(newState.totalTicks).toBe(10);
  expect(newState.pet?.growth.ageTicks).toBe(0);
});

test("processMultipleTicks applies cumulative stat decay", () => {
  const pet = createTestPet({
    careStats: {
      satiety: 40_000,
      hydration: 40_000,
      happiness: 40_000,
    },
  });
  const state = createTestGameState({ pet });
  const newState = processMultipleTicks(state, 10);

  // After 10 ticks, stats should have decayed significantly more than 1 tick
  const singleTickState = processGameTick(
    createTestGameState({
      pet: createTestPet({
        careStats: {
          satiety: 40_000,
          hydration: 40_000,
          happiness: 40_000,
        },
      }),
    }),
  );

  expect(newState.pet?.careStats.satiety).toBeLessThan(
    singleTickState.pet?.careStats.satiety ?? 0,
  );
});

// Tests for processOfflineCatchup

test("processOfflineCatchup processes correct number of ticks", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 100, 500);

  expect(result.ticksProcessed).toBe(100);
  expect(result.wasCapped).toBe(false);
  expect(result.state.pet?.growth.ageTicks).toBe(100);
});

test("processOfflineCatchup caps ticks at max", () => {
  const pet = createTestPet({
    growth: { stage: "baby", substage: 1, birthTime: Date.now(), ageTicks: 0 },
  });
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 1000, 500);

  expect(result.ticksProcessed).toBe(500);
  expect(result.wasCapped).toBe(true);
  expect(result.state.pet?.growth.ageTicks).toBe(500);
});

test("processOfflineCatchup sets wasCapped correctly when under cap", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 50, 100);

  expect(result.wasCapped).toBe(false);
});

test("processOfflineCatchup sets wasCapped correctly when at exact cap", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 0 });
  const result = processOfflineCatchup(state, 100, 100);

  expect(result.wasCapped).toBe(false);
});

test("processOfflineCatchup updates totalTicks correctly", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, totalTicks: 50 });
  const result = processOfflineCatchup(state, 30, 100);

  expect(result.state.totalTicks).toBe(80);
});

test("processOfflineCatchup updates lastSaveTime", () => {
  const pet = createTestPet();
  const state = createTestGameState({ pet, lastSaveTime: 0, totalTicks: 0 });
  const result = processOfflineCatchup(state, 5, 100);

  expect(result.state.lastSaveTime).toBeGreaterThan(0);
});

test("processOfflineCatchup handles state with no pet", () => {
  const state = createTestGameState({ pet: null, totalTicks: 10 });
  const result = processOfflineCatchup(state, 5, 100);

  expect(result.ticksProcessed).toBe(5);
  expect(result.state.totalTicks).toBe(15);
  expect(result.state.pet).toBeNull();
});
