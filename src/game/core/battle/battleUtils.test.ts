/**
 * Tests for battle utility functions.
 */

import { expect, test } from "bun:test";
import { basicAttack } from "@/game/data/moves";
import { SPECIES } from "@/game/data/species";
import { createTestCombatant } from "@/game/testing/createTestCombatant";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import { BattlePhase, type BattleState, initializeBattle } from "./battle";
import { emitBattleEndEvent, updateBattleState } from "./battleUtils";

function createTestBattleState(
  overrides: Partial<BattleState> = {},
): BattleState {
  const player = createTestCombatant({
    name: "Player Pet",
    isPlayer: true,
    moveSlots: [{ move: basicAttack, currentCooldown: 0 }],
  });
  const enemy = createTestCombatant({
    name: "Enemy Pet",
    isPlayer: false,
    moveSlots: [{ move: basicAttack, currentCooldown: 0 }],
  });
  return {
    ...initializeBattle(player, enemy),
    ...overrides,
  };
}

function createTestGameState(
  battleState: BattleState | null = null,
): GameState {
  const state = createInitialGameState();
  if (!battleState) return state;

  return {
    ...state,
    activeBattle: {
      enemySpeciesId: SPECIES.FLORABIT.id,
      enemyLevel: 1,
      battleState,
    },
  };
}

// Tests for updateBattleState
test("updateBattleState returns unchanged state when no active battle", () => {
  const state = createTestGameState(null);
  const newBattleState = createTestBattleState();

  const result = updateBattleState(state, newBattleState);

  expect(result).toBe(state);
});

test("updateBattleState updates battle state within game state", () => {
  const initialBattleState = createTestBattleState({
    turn: 1,
    phase: BattlePhase.PlayerTurn,
  });
  const state = createTestGameState(initialBattleState);
  const newBattleState = createTestBattleState({
    turn: 2,
    phase: BattlePhase.EnemyTurn,
  });

  const result = updateBattleState(state, newBattleState);

  expect(result).not.toBe(state);
  expect(result.activeBattle?.battleState.turn).toBe(2);
  expect(result.activeBattle?.battleState.phase).toBe(BattlePhase.EnemyTurn);
});

test("updateBattleState preserves other activeBattle properties", () => {
  const battleState = createTestBattleState();
  const state = createTestGameState(battleState);
  const newBattleState = createTestBattleState({ turn: 5 });

  const result = updateBattleState(state, newBattleState);

  expect(result.activeBattle?.enemySpeciesId).toBe(SPECIES.FLORABIT.id);
  expect(result.activeBattle?.enemyLevel).toBe(1);
});

test("updateBattleState creates immutable update", () => {
  const battleState = createTestBattleState();
  const state = createTestGameState(battleState);
  const newBattleState = createTestBattleState({ turn: 3 });

  const result = updateBattleState(state, newBattleState);

  // Original state should be unchanged
  expect(state.activeBattle?.battleState.turn).toBe(1);
  // New state should have updated value
  expect(result.activeBattle?.battleState.turn).toBe(3);
});

// Tests for emitBattleEndEvent
test("emitBattleEndEvent emits victory event when phase is Victory", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Victory,
  });
  const state = createTestGameState(battleState);

  const result = emitBattleEndEvent(state, battleState, 1000);

  const endEvent = result.pendingEvents.find((e) => e.type === "battleEnd");
  expect(endEvent).toBeDefined();
  expect(endEvent?.type).toBe("battleEnd");
  if (endEvent && "isVictory" in endEvent) {
    expect(endEvent.isVictory).toBe(true);
  }
});

test("emitBattleEndEvent emits defeat event when phase is Defeat", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Defeat,
  });
  const state = createTestGameState(battleState);

  const result = emitBattleEndEvent(state, battleState, 1000);

  const endEvent = result.pendingEvents.find((e) => e.type === "battleEnd");
  expect(endEvent).toBeDefined();
  if (endEvent && "isVictory" in endEvent) {
    expect(endEvent.isVictory).toBe(false);
  }
});

test("emitBattleEndEvent includes combatant names in event", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Victory,
  });
  const state = createTestGameState(battleState);

  const result = emitBattleEndEvent(state, battleState, 1000);

  const endEvent = result.pendingEvents.find((e) => e.type === "battleEnd");
  if (endEvent && "playerName" in endEvent && "enemyName" in endEvent) {
    expect(endEvent.playerName).toBe("Player Pet");
    expect(endEvent.enemyName).toBe("Enemy Pet");
  }
});

test("emitBattleEndEvent uses provided timestamp", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Victory,
  });
  const state = createTestGameState(battleState);
  const testTime = 9876543;

  const result = emitBattleEndEvent(state, battleState, testTime);

  const endEvent = result.pendingEvents.find((e) => e.type === "battleEnd");
  expect(endEvent?.timestamp).toBe(testTime);
});

test("emitBattleEndEvent preserves existing pending events", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Victory,
  });
  const state: GameState = {
    ...createTestGameState(battleState),
    pendingEvents: [
      {
        type: "careAction",
        action: "feed",
        itemId: "test-item",
        petName: "Test Pet",
        message: "Existing event",
        timestamp: 500,
      },
    ],
  };

  const result = emitBattleEndEvent(state, battleState, 1000);

  expect(result.pendingEvents.length).toBe(2);
  expect(result.pendingEvents[0]?.type).toBe("careAction");
  expect(result.pendingEvents[1]?.type).toBe("battleEnd");
});
