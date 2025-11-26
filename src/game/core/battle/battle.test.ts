/**
 * Tests for battle state machine.
 */

import { expect, test } from "bun:test";
import {
  createDefaultBattleStats,
  createDefaultResistances,
} from "@/game/types/stats";
import {
  BattlePhase,
  calculateBattleRewards,
  createWildCombatant,
  initializeBattle,
  isBattleComplete,
} from "./battle";
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
    speciesId: "florabit",
    battleStats,
    derivedStats: calculateDerivedStats(battleStats),
    resistances: createDefaultResistances(),
    statusEffects: [],
    moveSlots: [],
    isPlayer: true,
    ...overrides,
  };
}

test("initializeBattle sets phase to PlayerTurn", () => {
  const player = createTestCombatant({ name: "Player Pet", isPlayer: true });
  const enemy = createTestCombatant({ name: "Enemy Pet", isPlayer: false });

  const state = initializeBattle(player, enemy);

  expect(state.phase).toBe(BattlePhase.PlayerTurn);
  expect(state.turn).toBe(1);
});

test("initializeBattle sets correct combatants", () => {
  const player = createTestCombatant({ name: "Player Pet", isPlayer: true });
  const enemy = createTestCombatant({ name: "Enemy Pet", isPlayer: false });

  const state = initializeBattle(player, enemy);

  expect(state.player.name).toBe("Player Pet");
  expect(state.enemy.name).toBe("Enemy Pet");
});

test("initializeBattle creates initial log entry", () => {
  const player = createTestCombatant({ name: "Hero", isPlayer: true });
  const enemy = createTestCombatant({ name: "Villain", isPlayer: false });

  const state = initializeBattle(player, enemy);

  expect(state.log.length).toBeGreaterThan(0);
  expect(state.log[0]?.type).toBe("system");
});

test("isBattleComplete returns true for Victory phase", () => {
  const player = createTestCombatant();
  const enemy = createTestCombatant();
  const state = initializeBattle(player, enemy);

  const victoryState = { ...state, phase: BattlePhase.Victory };
  expect(isBattleComplete(victoryState)).toBe(true);
});

test("isBattleComplete returns true for Defeat phase", () => {
  const player = createTestCombatant();
  const enemy = createTestCombatant();
  const state = initializeBattle(player, enemy);

  const defeatState = { ...state, phase: BattlePhase.Defeat };
  expect(isBattleComplete(defeatState)).toBe(true);
});

test("isBattleComplete returns false for PlayerTurn phase", () => {
  const player = createTestCombatant();
  const enemy = createTestCombatant();
  const state = initializeBattle(player, enemy);

  expect(isBattleComplete(state)).toBe(false);
});

test("calculateBattleRewards returns coins for victory", () => {
  const player = createTestCombatant();
  const enemy = createTestCombatant();
  const state = initializeBattle(player, enemy);

  const rewards = calculateBattleRewards(state, true);

  expect(rewards.coins).toBeGreaterThan(0);
});

test("calculateBattleRewards returns 0 coins for defeat", () => {
  const player = createTestCombatant();
  const enemy = createTestCombatant();
  const state = initializeBattle(player, enemy);

  const rewards = calculateBattleRewards(state, false);

  expect(rewards.coins).toBe(0);
});

test("createWildCombatant creates combatant with scaled stats", () => {
  const level1 = createWildCombatant("florabit", 1);
  const level10 = createWildCombatant("florabit", 10);

  // Level 10 should have higher stats than level 1
  expect(level10.battleStats.strength).toBeGreaterThan(
    level1.battleStats.strength,
  );
});

test("createWildCombatant sets correct name format", () => {
  const combatant = createWildCombatant("florabit", 5);

  expect(combatant.name).toBe("Wild Florabit");
  expect(combatant.isPlayer).toBe(false);
});

test("createWildCombatant throws for unknown species", () => {
  expect(() => createWildCombatant("unknown_species", 1)).toThrow();
});
