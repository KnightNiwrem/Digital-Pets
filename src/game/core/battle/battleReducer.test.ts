/**
 * Tests for battle reducer.
 */

import { expect, type Mock, mock, test } from "bun:test";
import { basicAttack } from "@/game/data/moves";
import { SPECIES } from "@/game/data/species";
import { createDefaultBattleStats } from "@/game/testing/createTestPet";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import { createDefaultResistances } from "@/game/types/stats";
import { BattlePhase, type BattleState, initializeBattle } from "./battle";
import { battleReducer } from "./battleReducer";
import { calculateDerivedStats } from "./stats";
import type { Combatant } from "./turn";

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

function createTestBattleState(): BattleState {
  const player = createTestCombatant({ name: "Player Pet", isPlayer: true });
  const enemy = createTestCombatant({ name: "Enemy Pet", isPlayer: false });
  return initializeBattle(player, enemy);
}

function createTestGameState(battleState: BattleState): GameState {
  return {
    ...createInitialGameState(),
    activeBattle: {
      enemySpeciesId: SPECIES.FLORABIT.id,
      enemyLevel: 1,
      battleState,
    },
  };
}

test("battleReducer returns unchanged state when no active battle", () => {
  const state = createInitialGameState();
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };

  const newState = battleReducer(state, action, 1000);

  expect(newState).toBe(state);
});

test("battleReducer returns unchanged state when not player turn", () => {
  const battleState = createTestBattleState();
  // Force enemy turn
  const enemyTurnState: BattleState = {
    ...battleState,
    phase: BattlePhase.EnemyTurn,
  };
  const state = createTestGameState(enemyTurnState);
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };

  const newState = battleReducer(state, action, 1000);

  expect(newState).toBe(state);
});

test("battleReducer returns unchanged state when move not found", () => {
  const originalWarn = console.warn;
  const mockWarn: Mock<(...args: unknown[]) => void> = mock();
  console.warn = mockWarn;

  try {
    const battleState = createTestBattleState();
    const state = createTestGameState(battleState);
    const action = {
      type: "BATTLE_PLAYER_ATTACK" as const,
      payload: { moveName: "Nonexistent Move" },
    };

    const newState = battleReducer(state, action, 1000);

    expect(newState).toBe(state);
    expect(mockWarn).toHaveBeenCalledWith("Move not found: Nonexistent Move");
  } finally {
    console.warn = originalWarn;
  }
});

test("battleReducer processes player attack action", () => {
  const battleState = createTestBattleState();
  // Ensure it's player turn
  const playerTurnState: BattleState = {
    ...battleState,
    phase: BattlePhase.PlayerTurn,
  };
  const state = createTestGameState(playerTurnState);
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };

  const newState = battleReducer(state, action, 1000);

  // State should be updated
  expect(newState).not.toBe(state);
  expect(newState.activeBattle).toBeDefined();
  // Battle should progress (no longer player turn after attack)
  expect(newState.activeBattle?.battleState.phase).not.toBe(
    BattlePhase.PlayerTurn,
  );
  // Log should have new entries
  expect(newState.activeBattle?.battleState.log.length).toBeGreaterThan(
    playerTurnState.log.length,
  );
});

test("battleReducer emits playerAttack event", () => {
  const battleState = createTestBattleState();
  const playerTurnState: BattleState = {
    ...battleState,
    phase: BattlePhase.PlayerTurn,
  };
  const state = createTestGameState(playerTurnState);
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };

  const newState = battleReducer(state, action, 1000);

  // Should have emitted a battleAction event
  const battleEvent = newState.pendingEvents.find(
    (e) => e.type === "battleAction",
  );
  expect(battleEvent).toBeDefined();
  expect(battleEvent?.type).toBe("battleAction");
});

test("battleReducer emits battleEnd event when battle completes", () => {
  const battleState = createTestBattleState();
  // Give player high precision to guarantee hit (need 30+ for 100% hit chance)
  const highPrecisionPlayer: Combatant = {
    ...battleState.player,
    battleStats: {
      ...battleState.player.battleStats,
      precision: 50,
    },
  };
  // Give enemy very low health so attack will defeat them
  // Set dodgeChance to 0 and high precision to guarantee hit
  const lowHealthEnemy: Combatant = {
    ...battleState.enemy,
    derivedStats: {
      ...battleState.enemy.derivedStats,
      currentHealth: 1,
      maxHealth: 100,
      dodgeChance: 0,
    },
  };
  const nearEndState: BattleState = {
    ...battleState,
    phase: BattlePhase.PlayerTurn,
    player: highPrecisionPlayer,
    enemy: lowHealthEnemy,
  };
  const state = createTestGameState(nearEndState);
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };

  const newState = battleReducer(state, action, 1000);

  // Should have emitted battleEnd event
  const endEvent = newState.pendingEvents.find((e) => e.type === "battleEnd");
  expect(endEvent).toBeDefined();
  expect(endEvent?.type).toBe("battleEnd");
});

test("battleReducer uses provided currentTime for events", () => {
  const battleState = createTestBattleState();
  const playerTurnState: BattleState = {
    ...battleState,
    phase: BattlePhase.PlayerTurn,
  };
  const state = createTestGameState(playerTurnState);
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };
  const testTime = 12345678;

  const newState = battleReducer(state, action, testTime);

  const battleEvent = newState.pendingEvents.find(
    (e) => e.type === "battleAction",
  );
  expect(battleEvent?.timestamp).toBe(testTime);
});

test("battleReducer marks playerActed true after attack", () => {
  const battleState = createTestBattleState();
  const playerTurnState: BattleState = {
    ...battleState,
    phase: BattlePhase.PlayerTurn,
    playerActed: false,
  };
  const state = createTestGameState(playerTurnState);
  const action = {
    type: "BATTLE_PLAYER_ATTACK" as const,
    payload: { moveName: "Basic Attack" },
  };

  const newState = battleReducer(state, action, 1000);

  expect(newState.activeBattle?.battleState.playerActed).toBe(true);
});
