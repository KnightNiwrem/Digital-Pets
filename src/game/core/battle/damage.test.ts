/**
 * Tests for damage calculation.
 */

import { expect, test } from "bun:test";
import { DamageType } from "@/game/types/constants";
import type { Move } from "@/game/types/move";
import {
  calculateBaseDamage,
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
