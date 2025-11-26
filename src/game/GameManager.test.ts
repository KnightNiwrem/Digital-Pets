/**
 * Tests for GameManager class.
 */

import { expect, mock, test } from "bun:test";
import type { GameState } from "@/game/types/gameState";
import { createInitialGameState } from "@/game/types/gameState";
import type { Pet } from "@/game/types/pet";
import {
  createGameManager,
  GameManager,
  type StateUpdateCallback,
} from "./GameManager";

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

// Tests for GameManager lifecycle

test("GameManager starts not running", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  expect(manager.running).toBe(false);
});

test("GameManager.start() sets running to true", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  manager.start();

  expect(manager.running).toBe(true);

  manager.stop();
});

test("GameManager.stop() sets running to false", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  manager.start();
  manager.stop();

  expect(manager.running).toBe(false);
});

test("GameManager.start() does not create duplicate intervals when called twice", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  manager.start();
  manager.start(); // Second call should be ignored

  expect(manager.running).toBe(true);

  manager.stop();
});

test("GameManager.stop() can be called when not running", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  // Should not throw
  expect(() => manager.stop()).not.toThrow();
  expect(manager.running).toBe(false);
});

// Tests for tick() method

test("GameManager.tick() calls updateState with processGameTick", () => {
  let capturedUpdater: ((state: GameState) => GameState) | null = null;
  const updateState: StateUpdateCallback = (updater) => {
    capturedUpdater = updater;
  };

  const manager = new GameManager(updateState);
  manager.tick();

  // Verify updater was called
  expect(capturedUpdater).not.toBeNull();

  // Test that the updater works correctly
  const initialState = {
    ...createInitialGameState(),
    pet: createTestPet(),
    totalTicks: 5,
  };

  // biome-ignore lint/style/noNonNullAssertion: We verified capturedUpdater is not null above
  const newState = capturedUpdater!(initialState);

  expect(newState.totalTicks).toBe(6);
});

// Tests for processOffline method

test("GameManager.processOffline() returns early for future lastSaveTime", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  // Future timestamp - no ticks should be processed
  manager.processOffline(Date.now() + 60_000);

  expect(updateState).not.toHaveBeenCalled();
});

test("GameManager.processOffline() returns early for very recent lastSaveTime", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  // Just now - no full ticks elapsed
  manager.processOffline(Date.now());

  expect(updateState).not.toHaveBeenCalled();
});

test("GameManager.processOffline() calls updateState for elapsed ticks", () => {
  const updateState = mock(() => {});
  const manager = new GameManager(updateState);

  // 60 seconds ago = 2 ticks
  manager.processOffline(Date.now() - 60_000);

  expect(updateState).toHaveBeenCalled();
});

test("GameManager.processOffline() processes ticks correctly", () => {
  let capturedState: GameState | null = null;
  const updateState: StateUpdateCallback = (updater) => {
    const initialState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      totalTicks: 0,
    };
    capturedState = updater(initialState);
  };

  const manager = new GameManager(updateState);

  // 60 seconds ago = 2 ticks
  manager.processOffline(Date.now() - 60_000);

  expect(capturedState).not.toBeNull();
  // biome-ignore lint/style/noNonNullAssertion: We verified capturedState is not null above
  expect(capturedState!.totalTicks).toBe(2);
});

// Tests for createGameManager factory

test("createGameManager creates a GameManager instance", () => {
  const updateState = mock(() => {});
  const manager = createGameManager(updateState);

  expect(manager).toBeInstanceOf(GameManager);
  expect(manager.running).toBe(false);
});
