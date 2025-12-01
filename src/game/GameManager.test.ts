/**
 * Tests for GameManager class.
 */

import { expect, mock, test } from "bun:test";
import { BattlePhase, initializeBattle } from "@/game/core/battle/battle";
import { basicAttack } from "@/game/data/moves";
import { SPECIES } from "@/game/data/species";
import {
  createDefaultBattleStats,
  createTestPet,
} from "@/game/testing/createTestPet";
import type { GameState } from "@/game/types/gameState";
import { createInitialGameState } from "@/game/types/gameState";
import { createDefaultResistances } from "@/game/types/stats";
import { calculateDerivedStats } from "./core/battle/stats";
import type { Combatant } from "./core/battle/turn";
import {
  createGameManager,
  GameManager,
  type StateUpdateCallback,
} from "./GameManager";

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

// Tests for dispatchBattleAction method

function createTestCombatant(overrides: Partial<Combatant> = {}): Combatant {
  const battleStats = createDefaultBattleStats();
  battleStats.strength = 10;
  battleStats.endurance = 10;
  battleStats.agility = 10;
  battleStats.precision = 10;
  battleStats.fortitude = 10;
  battleStats.cunning = 10;

  return {
    name: "Test Pet",
    speciesId: SPECIES.FLORABIT.id,
    battleStats,
    derivedStats: calculateDerivedStats(battleStats),
    resistances: createDefaultResistances(),
    statusEffects: [],
    moveSlots: [{ move: basicAttack, currentCooldown: 0 }],
    isPlayer: true,
    ...overrides,
  };
}

test("GameManager.dispatchBattleAction() calls updateState with battleReducer", () => {
  let capturedUpdater: ((state: GameState) => GameState) | null = null;
  const updateState: StateUpdateCallback = (updater) => {
    capturedUpdater = updater;
  };

  const manager = new GameManager(updateState);
  manager.dispatchBattleAction({
    type: "BATTLE_PLAYER_ATTACK",
    payload: { moveName: "Basic Attack" },
  });

  // Verify updater was called
  expect(capturedUpdater).not.toBeNull();
});

test("GameManager.dispatchBattleAction() processes battle action correctly", () => {
  let capturedState: GameState | null = null;
  const updateState: StateUpdateCallback = (updater) => {
    const player = createTestCombatant({ name: "Player Pet", isPlayer: true });
    const enemy = createTestCombatant({ name: "Enemy Pet", isPlayer: false });
    const battleState = initializeBattle(player, enemy);
    // Ensure it's player turn
    const playerTurnBattle = {
      ...battleState,
      phase: BattlePhase.PlayerTurn,
    };
    const initialState: GameState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      activeBattle: {
        enemySpeciesId: SPECIES.FLORABIT.id,
        enemyLevel: 1,
        battleState: playerTurnBattle,
      },
    };
    capturedState = updater(initialState);
  };

  const manager = new GameManager(updateState);
  manager.dispatchBattleAction({
    type: "BATTLE_PLAYER_ATTACK",
    payload: { moveName: "Basic Attack" },
  });

  // Verify state was updated
  expect(capturedState).not.toBeNull();
  // biome-ignore lint/style/noNonNullAssertion: We verified capturedState is not null above
  const state = capturedState!;
  // Battle should have progressed (no longer player turn)
  expect(state.activeBattle?.battleState.phase).not.toBe(
    BattlePhase.PlayerTurn,
  );
  // Should have emitted an event
  expect(state.pendingEvents.length).toBeGreaterThan(0);
});
