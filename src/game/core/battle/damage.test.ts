/**
 * Tests for damage calculation.
 */

import { expect, test } from "bun:test";
import { DamageType } from "@/game/types/constants";
import type { Move } from "@/game/types/move";
import {
  applyVariance,
  calculateBaseDamage,
  calculateDamage,
  calculateEnduranceMitigation,
  calculateHitChance,
  calculateResistanceMultiplier,
  DAMAGE_CONSTANTS,
} from "./damage";

const createTestMove = (overrides: Partial<Move> = {}): Move => ({
  id: "test_move",
  name: "Test Move",
  description: "A test move",
  power: 1.0,
  flatDamage: 5,
  damageType: DamageType.Crushing,
  staminaCost: 10,
  cooldown: 0,
  accuracyModifier: 0,
  effects: [],
  target: "enemy",
  ...overrides,
});

test("calculateBaseDamage uses power and flat damage", () => {
  const move = createTestMove({ power: 2.0, flatDamage: 10 });
  const damage = calculateBaseDamage(20, move);

  const expected = (20 * 2.0) / DAMAGE_CONSTANTS.POWER_DIVISOR + 10;
  expect(damage).toBe(expected);
});

test("calculateBaseDamage with zero power uses only flat damage", () => {
  const move = createTestMove({ power: 0, flatDamage: 15 });
  const damage = calculateBaseDamage(100, move);

  expect(damage).toBe(15);
});

test("calculateHitChance includes precision bonus", () => {
  const hitChance = calculateHitChance(20, 0, 0);

  const expected =
    DAMAGE_CONSTANTS.BASE_HIT_CHANCE +
    20 * DAMAGE_CONSTANTS.PRECISION_HIT_BONUS;
  expect(hitChance).toBe(expected);
});

test("calculateHitChance subtracts dodge chance", () => {
  const hitChance = calculateHitChance(10, 30, 0);

  const expected =
    DAMAGE_CONSTANTS.BASE_HIT_CHANCE +
    10 * DAMAGE_CONSTANTS.PRECISION_HIT_BONUS -
    30;
  expect(hitChance).toBe(expected);
});

test("calculateHitChance applies accuracy modifier", () => {
  const hitChanceWithMod = calculateHitChance(10, 0, 10);
  const hitChanceWithoutMod = calculateHitChance(10, 0, 0);

  expect(hitChanceWithMod).toBeGreaterThan(hitChanceWithoutMod);
});

test("calculateHitChance clamps minimum to 5%", () => {
  const hitChance = calculateHitChance(0, 100, -50);
  expect(hitChance).toBe(5);
});

test("calculateHitChance clamps maximum to 100%", () => {
  const hitChance = calculateHitChance(100, 0, 50);
  expect(hitChance).toBe(100);
});

test("calculateResistanceMultiplier returns 1 for 0 resistance", () => {
  const resistances = {
    slashing: 0,
    piercing: 0,
    crushing: 0,
    chemical: 0,
    thermal: 0,
    electric: 0,
  };
  const multiplier = calculateResistanceMultiplier(
    resistances,
    DamageType.Crushing,
  );
  expect(multiplier).toBe(1);
});

test("calculateResistanceMultiplier reduces damage for resistance", () => {
  const resistances = {
    slashing: 0,
    piercing: 0,
    crushing: 50,
    chemical: 0,
    thermal: 0,
    electric: 0,
  };
  const multiplier = calculateResistanceMultiplier(
    resistances,
    DamageType.Crushing,
  );
  expect(multiplier).toBe(0.5);
});

test("calculateResistanceMultiplier caps at max resistance", () => {
  const resistances = {
    slashing: 0,
    piercing: 0,
    crushing: 100,
    chemical: 0,
    thermal: 0,
    electric: 0,
  };
  const multiplier = calculateResistanceMultiplier(
    resistances,
    DamageType.Crushing,
  );
  expect(multiplier).toBe(1 - DAMAGE_CONSTANTS.MAX_RESISTANCE / 100);
});

test("calculateEnduranceMitigation reduces damage", () => {
  const mitigation = calculateEnduranceMitigation(100);
  expect(mitigation).toBe(0.5);
});

test("calculateEnduranceMitigation returns 1 for 0 endurance", () => {
  const mitigation = calculateEnduranceMitigation(0);
  expect(mitigation).toBe(1);
});

// Tests for applyVariance
test("applyVariance returns value within variance range", () => {
  const baseDamage = 100;
  const results: number[] = [];

  for (let i = 0; i < 100; i++) {
    results.push(applyVariance(baseDamage));
  }

  const minExpected = Math.round(baseDamage * DAMAGE_CONSTANTS.MIN_VARIANCE);
  const maxExpected = Math.round(baseDamage * DAMAGE_CONSTANTS.MAX_VARIANCE);

  for (const result of results) {
    expect(result).toBeGreaterThanOrEqual(minExpected);
    expect(result).toBeLessThanOrEqual(maxExpected);
  }
});

test("applyVariance returns rounded integer", () => {
  const baseDamage = 100;

  for (let i = 0; i < 10; i++) {
    const result = applyVariance(baseDamage);
    expect(Number.isInteger(result)).toBe(true);
  }
});

// Tests for calculateDamage (full pipeline)
test("calculateDamage returns 0 damage for self-targeting moves", () => {
  const attacker = {
    battleStats: {
      strength: 20,
      endurance: 10,
      agility: 10,
      precision: 30,
      fortitude: 10,
      cunning: 10,
    },
    criticalChance: 10,
    criticalDamage: 1.5,
  };
  const defender = {
    battleStats: {
      strength: 10,
      endurance: 20,
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
    dodgeChance: 10,
  };
  const move = createTestMove({ target: "self", power: 2.0 });

  const result = calculateDamage(attacker, defender, move);

  expect(result.damage).toBe(0);
  expect(result.isHit).toBe(true);
  expect(result.isCritical).toBe(false);
  expect(result.isDodged).toBe(false);
});

test("calculateDamage returns 0 damage for zero power and zero flat damage moves", () => {
  const attacker = {
    battleStats: {
      strength: 20,
      endurance: 10,
      agility: 10,
      precision: 30,
      fortitude: 10,
      cunning: 10,
    },
    criticalChance: 10,
    criticalDamage: 1.5,
  };
  const defender = {
    battleStats: {
      strength: 10,
      endurance: 20,
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
    dodgeChance: 10,
  };
  const move = createTestMove({ power: 0, flatDamage: 0 });

  const result = calculateDamage(attacker, defender, move);

  expect(result.damage).toBe(0);
});

test("calculateDamage deals damage for zero power moves with flat damage", () => {
  const attacker = {
    battleStats: {
      strength: 10,
      endurance: 10,
      agility: 10,
      precision: 100, // Guarantee hit
      fortitude: 10,
      cunning: 10,
    },
    criticalChance: 0,
    criticalDamage: 1.5,
  };
  const defender = {
    battleStats: {
      strength: 10,
      endurance: 0, // No mitigation
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
    dodgeChance: 0,
  };
  const move = createTestMove({ power: 0, flatDamage: 15 });

  const result = calculateDamage(attacker, defender, move);

  // Damage should be based on flatDamage, variance, and mitigations
  expect(result.damage).toBeGreaterThan(0);
  expect(result.isHit).toBe(true);
});

test("calculateDamage deals at least 1 damage on hit", () => {
  const attacker = {
    battleStats: {
      strength: 1,
      endurance: 10,
      agility: 10,
      precision: 100, // Guarantee hit
      fortitude: 10,
      cunning: 10,
    },
    criticalChance: 0,
    criticalDamage: 1.5,
  };
  const defender = {
    battleStats: {
      strength: 10,
      endurance: 1000, // Very high endurance
      agility: 10,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    },
    resistances: {
      slashing: 0,
      piercing: 0,
      crushing: 75, // Max resistance
      chemical: 0,
      thermal: 0,
      electric: 0,
    },
    dodgeChance: 0,
  };
  const move = createTestMove({ power: 0.1, flatDamage: 0 });

  const result = calculateDamage(attacker, defender, move);

  if (result.isHit) {
    expect(result.damage).toBeGreaterThanOrEqual(1);
  }
});

test("calculateDamage applies resistance reduction", () => {
  const attacker = {
    battleStats: {
      strength: 20,
      endurance: 10,
      agility: 10,
      precision: 100,
      fortitude: 10,
      cunning: 10,
    },
    criticalChance: 0,
    criticalDamage: 1.5,
  };
  const noResistDefender = {
    battleStats: {
      strength: 10,
      endurance: 0,
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
    dodgeChance: 0,
  };
  const resistDefender = {
    ...noResistDefender,
    resistances: {
      slashing: 0,
      piercing: 0,
      crushing: 50,
      chemical: 0,
      thermal: 0,
      electric: 0,
    },
  };
  const move = createTestMove({ power: 2.0, flatDamage: 10 });

  // Run multiple times and compare averages
  let noResistTotal = 0;
  let resistTotal = 0;
  for (let i = 0; i < 50; i++) {
    noResistTotal += calculateDamage(attacker, noResistDefender, move).damage;
    resistTotal += calculateDamage(attacker, resistDefender, move).damage;
  }

  // Resistant defender should take less damage on average
  expect(resistTotal / 50).toBeLessThan(noResistTotal / 50);
});
