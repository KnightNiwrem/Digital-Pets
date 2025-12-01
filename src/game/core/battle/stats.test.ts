/**
 * Tests for derived battle stat calculations.
 */

import { expect, test } from "bun:test";
import {
  BATTLE_CONSTANTS,
  calculateDerivedStats,
  calculateStaminaRegen,
} from "./stats";

test("calculateDerivedStats calculates health from endurance", () => {
  const stats = {
    strength: 10,
    endurance: 20,
    agility: 10,
    precision: 10,
    fortitude: 10,
    cunning: 10,
  };
  const derived = calculateDerivedStats(stats);

  const expectedHealth =
    BATTLE_CONSTANTS.BASE_HEALTH + 20 * BATTLE_CONSTANTS.HEALTH_PER_ENDURANCE;
  expect(derived.maxHealth).toBe(expectedHealth);
  expect(derived.currentHealth).toBe(derived.maxHealth);
});

test("calculateDerivedStats calculates stamina from fortitude", () => {
  const stats = {
    strength: 10,
    endurance: 10,
    agility: 10,
    precision: 10,
    fortitude: 15,
    cunning: 10,
  };
  const derived = calculateDerivedStats(stats);

  const expectedStamina =
    BATTLE_CONSTANTS.BASE_STAMINA + 15 * BATTLE_CONSTANTS.STAMINA_PER_FORTITUDE;
  expect(derived.maxStamina).toBe(expectedStamina);
  expect(derived.currentStamina).toBe(derived.maxStamina);
});

test("calculateDerivedStats calculates initiative from agility and cunning", () => {
  const stats = {
    strength: 10,
    endurance: 10,
    agility: 20,
    precision: 10,
    fortitude: 10,
    cunning: 10,
  };
  const derived = calculateDerivedStats(stats);

  const expectedInitiative =
    20 + Math.floor(10 * BATTLE_CONSTANTS.CUNNING_INITIATIVE_FACTOR);
  expect(derived.initiative).toBe(expectedInitiative);
});

test("calculateDerivedStats caps dodge chance", () => {
  const stats = {
    strength: 10,
    endurance: 10,
    agility: 200,
    precision: 10,
    fortitude: 10,
    cunning: 10,
  };
  const derived = calculateDerivedStats(stats);

  expect(derived.dodgeChance).toBe(BATTLE_CONSTANTS.MAX_DODGE_CHANCE);
});

test("calculateDerivedStats calculates critical chance from precision", () => {
  const stats = {
    strength: 10,
    endurance: 10,
    agility: 10,
    precision: 20,
    fortitude: 10,
    cunning: 10,
  };
  const derived = calculateDerivedStats(stats);

  const expectedCrit =
    BATTLE_CONSTANTS.BASE_CRIT_CHANCE +
    20 * BATTLE_CONSTANTS.CRIT_PER_PRECISION;
  expect(derived.criticalChance).toBe(expectedCrit);
});

test("calculateDerivedStats caps critical chance", () => {
  const stats = {
    strength: 10,
    endurance: 10,
    agility: 10,
    precision: 500,
    fortitude: 10,
    cunning: 10,
  };
  const derived = calculateDerivedStats(stats);

  expect(derived.criticalChance).toBe(BATTLE_CONSTANTS.MAX_CRIT_CHANCE);
});

test("calculateDerivedStats calculates critical damage from cunning", () => {
  const stats = {
    strength: 10,
    endurance: 10,
    agility: 10,
    precision: 10,
    fortitude: 10,
    cunning: 20,
  };
  const derived = calculateDerivedStats(stats);

  const expectedCritDmg =
    BATTLE_CONSTANTS.BASE_CRIT_MULTIPLIER +
    20 * BATTLE_CONSTANTS.CRIT_DAMAGE_PER_CUNNING;
  expect(derived.criticalDamage).toBe(expectedCritDmg);
});

test("calculateStaminaRegen returns percentage of max stamina", () => {
  const regen = calculateStaminaRegen(100);
  const expected = Math.floor(
    (100 * BATTLE_CONSTANTS.STAMINA_REGEN_PERCENT) / 100,
  );
  expect(regen).toBe(expected);
});
