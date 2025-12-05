/**
 * Tests for GameManager class.
 */

import { expect, mock, setSystemTime, test } from "bun:test";
import { BattlePhase, initializeBattle } from "@/game/core/battle/battle";
import { basicAttack } from "@/game/data/moves";
import { SPECIES } from "@/game/data/species";
import {
  createDefaultBattleStats,
  createTestPet,
} from "@/game/testing/createTestPet";
import { TICK_DURATION_MS } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";
import { createInitialGameState } from "@/game/types/gameState";
import { createDefaultResistances } from "@/game/types/stats";
import { calculateDerivedStats } from "./core/battle/stats";
import type { Combatant } from "./core/battle/turn";
import {
  createGameManager,
  GameManager,
  OFFLINE_CATCHUP_THRESHOLD_TICKS,
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

// Tests for offline catchup threshold behavior

test("GameManager uses offline catchup when ticks >= threshold", () => {
  // Freeze time to ensure deterministic behavior
  const frozenTime = 1000000;
  setSystemTime(frozenTime);

  let ticksProcessedByOfflineCatchup = 0;
  let regularTicksProcessed = 0;

  const updateState: StateUpdateCallback = (updater) => {
    const initialState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      totalTicks: 0,
    };
    const newState = updater(initialState);
    // If totalTicks increased by a large amount, offline catchup was used
    const ticksDelta = newState.totalTicks - initialState.totalTicks;
    if (ticksDelta >= OFFLINE_CATCHUP_THRESHOLD_TICKS) {
      ticksProcessedByOfflineCatchup = ticksDelta;
    } else if (ticksDelta === 1) {
      regularTicksProcessed++;
    }
  };

  const manager = new GameManager(updateState);

  // Set up accumulator to trigger offline catchup (exactly at threshold)
  const ticksNeeded = OFFLINE_CATCHUP_THRESHOLD_TICKS;
  manager._testSetAccumulator(ticksNeeded * TICK_DURATION_MS);
  manager._testSetLastTickTime(Date.now());

  // Trigger update
  manager._testUpdate();

  // Should have used offline catchup
  expect(ticksProcessedByOfflineCatchup).toBe(OFFLINE_CATCHUP_THRESHOLD_TICKS);
  expect(regularTicksProcessed).toBe(0);

  // Reset system time
  setSystemTime();
});

test("GameManager uses batch tick processing when ticks < threshold", () => {
  // Freeze time to ensure deterministic behavior
  const frozenTime = 1000000;
  setSystemTime(frozenTime);

  let updateCallCount = 0;
  let totalTicksProcessed = 0;

  const updateState: StateUpdateCallback = (updater) => {
    updateCallCount++;
    const initialState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      totalTicks: totalTicksProcessed,
    };
    const newState = updater(initialState);
    totalTicksProcessed = newState.totalTicks;
  };

  const manager = new GameManager(updateState);

  // Set up accumulator just below the threshold (29 ticks)
  const ticksNeeded = OFFLINE_CATCHUP_THRESHOLD_TICKS - 1;
  manager._testSetAccumulator(ticksNeeded * TICK_DURATION_MS);
  manager._testSetLastTickTime(Date.now());

  // Trigger update
  manager._testUpdate();

  // Should have processed all ticks in a single batch call
  expect(updateCallCount).toBe(1);
  expect(totalTicksProcessed).toBe(ticksNeeded);

  // Reset system time
  setSystemTime();
});

test("GameManager resets battle accumulator during offline catchup", () => {
  // Freeze time to ensure deterministic behavior
  const frozenTime = 1000000;
  setSystemTime(frozenTime);

  const updateState: StateUpdateCallback = (updater) => {
    const initialState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      totalTicks: 0,
    };
    updater(initialState);
  };

  const manager = new GameManager(updateState);

  // Set up accumulator to trigger offline catchup
  const ticksNeeded = OFFLINE_CATCHUP_THRESHOLD_TICKS;
  manager._testSetAccumulator(ticksNeeded * TICK_DURATION_MS);
  manager._testSetBattleAccumulator(5000); // 5 seconds of battle ticks
  manager._testSetLastTickTime(Date.now());

  // Trigger update
  manager._testUpdate();

  // Battle accumulator should be reset to 0
  expect(manager._testGetBattleAccumulator()).toBe(0);

  // Reset system time
  setSystemTime();
});

test("GameManager correctly decrements accumulator after offline catchup", () => {
  // Freeze time to ensure deterministic behavior
  const frozenTime = 1000000;
  setSystemTime(frozenTime);

  const updateState: StateUpdateCallback = (updater) => {
    const initialState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      totalTicks: 0,
    };
    updater(initialState);
  };

  const manager = new GameManager(updateState);

  // Set up accumulator with exact tick boundary (no remainder)
  const ticksNeeded = OFFLINE_CATCHUP_THRESHOLD_TICKS;
  manager._testSetAccumulator(ticksNeeded * TICK_DURATION_MS);
  manager._testSetLastTickTime(Date.now());

  // Trigger update
  manager._testUpdate();

  // Accumulator should be exactly 0 (no remainder since we set exact ticks)
  expect(manager._testGetAccumulator()).toBe(0);

  // Reset system time
  setSystemTime();
});

test("GameManager preserves accumulator remainder after offline catchup", () => {
  // Freeze time to ensure deterministic behavior
  const frozenTime = 1000000;
  setSystemTime(frozenTime);

  const updateState: StateUpdateCallback = (updater) => {
    const initialState = {
      ...createInitialGameState(),
      pet: createTestPet(),
      totalTicks: 0,
    };
    updater(initialState);
  };

  const manager = new GameManager(updateState);

  // Set up accumulator with extra partial tick
  const ticksNeeded = OFFLINE_CATCHUP_THRESHOLD_TICKS;
  const partialTickMs = 5000; // 5 seconds extra
  manager._testSetAccumulator(ticksNeeded * TICK_DURATION_MS + partialTickMs);
  manager._testSetLastTickTime(Date.now());

  // Trigger update
  manager._testUpdate();

  // Accumulator should have the partial tick remainder
  expect(manager._testGetAccumulator()).toBe(partialTickMs);

  // Reset system time
  setSystemTime();
});
