/**
 * Tests for battle tick processor.
 */

import { expect, test } from "bun:test";
import { basicAttack } from "@/game/data/moves";
import { SPECIES } from "@/game/data/species";
import { createTestCombatant } from "@/game/testing/createTestCombatant";
import { DamageType } from "@/game/types/constants";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import { StatusEffectType } from "@/game/types/move";
import { BattlePhase, type BattleState, initializeBattle } from "./battle";
import { processBattleTick } from "./battleProcessor";

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

test("processBattleTick returns unchanged state when no active battle", () => {
  const state = createTestGameState(null);

  const newState = processBattleTick(state, 1000);

  expect(newState).toBe(state);
});

test("processBattleTick returns unchanged state during player turn", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.PlayerTurn,
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  expect(newState).toBe(state);
});

test("processBattleTick returns unchanged state when battle is complete (Victory)", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Victory,
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  expect(newState).toBe(state);
});

test("processBattleTick returns unchanged state when battle is complete (Defeat)", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.Defeat,
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  expect(newState).toBe(state);
});

test("processBattleTick processes enemy turn automatically", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.EnemyTurn,
    turnOrderIndex: 0,
    turnOrder: ["enemy", "player"],
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  expect(newState).not.toBe(state);
  expect(newState.activeBattle?.battleState.phase).not.toBe(
    BattlePhase.EnemyTurn,
  );
  expect(newState.activeBattle?.battleState.enemyActed).toBe(true);
});

test("processBattleTick emits battleAction event for enemy turn", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.EnemyTurn,
    turnOrderIndex: 0,
    turnOrder: ["enemy", "player"],
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  const battleEvent = newState.pendingEvents.find(
    (e) => e.type === "battleAction",
  );
  expect(battleEvent).toBeDefined();
  expect(battleEvent?.type).toBe("battleAction");
});

test("processBattleTick processes turn resolution automatically", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.TurnResolution,
    playerActed: true,
    enemyActed: true,
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  expect(newState).not.toBe(state);
  // Should advance to next turn
  expect(newState.activeBattle?.battleState.turn).toBe(battleState.turn + 1);
});

test("processBattleTick emits battleAction event during turn resolution", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.TurnResolution,
    playerActed: true,
    enemyActed: true,
  });
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  const battleEvent = newState.pendingEvents.find(
    (e) => e.type === "battleAction",
  );
  expect(battleEvent).toBeDefined();
});

test("processBattleTick emits battleEnd event when enemy is defeated by DoT", () => {
  const player = createTestCombatant({
    name: "Player Pet",
    isPlayer: true,
    moveSlots: [{ move: basicAttack, currentCooldown: 0 }],
  });
  const enemy = createTestCombatant({
    name: "Enemy Pet",
    isPlayer: false,
    derivedStats: {
      currentHealth: 5, // Low health
      maxHealth: 100,
      currentStamina: 50,
      maxStamina: 50,
      initiative: 10,
      criticalChance: 5,
      criticalDamage: 1.5,
      dodgeChance: 0,
    },
    statusEffects: [
      {
        id: "dot-1",
        type: StatusEffectType.DamageOverTime,
        name: "Poison",
        duration: 2,
        value: 10, // Lethal DoT
        damageType: DamageType.Chemical,
      },
    ],
    moveSlots: [{ move: basicAttack, currentCooldown: 0 }],
  });

  const battleState: BattleState = {
    ...initializeBattle(player, enemy),
    phase: BattlePhase.TurnResolution, // Test end-of-turn processing
    playerActed: true,
    enemyActed: true,
    player,
    enemy,
  };
  const state = createTestGameState(battleState);

  const newState = processBattleTick(state, 1000);

  // Check that battle ended in victory
  expect(newState.activeBattle?.battleState.phase).toBe(BattlePhase.Victory);

  // Check for battleEnd event
  const endEvent = newState.pendingEvents.find((e) => e.type === "battleEnd");
  expect(endEvent).toBeDefined();
  if (endEvent?.type === "battleEnd") {
    expect(endEvent.isVictory).toBe(true);
  }
});

test("processBattleTick uses provided currentTime for events", () => {
  const battleState = createTestBattleState({
    phase: BattlePhase.EnemyTurn,
    turnOrderIndex: 0,
    turnOrder: ["enemy", "player"],
  });
  const state = createTestGameState(battleState);
  const testTime = 12345678;

  const newState = processBattleTick(state, testTime);

  const battleEvent = newState.pendingEvents.find(
    (e) => e.type === "battleAction",
  );
  expect(battleEvent?.timestamp).toBe(testTime);
});
