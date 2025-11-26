/**
 * Tests for energy regeneration logic.
 */

import { expect, test } from "bun:test";
import {
  applyEnergyRegen,
  ENERGY_REGEN_AWAKE,
  ENERGY_REGEN_SLEEPING,
  getEnergyRegenRate,
} from "./energy";

test("getEnergyRegenRate returns correct rate for awake state", () => {
  expect(getEnergyRegenRate(false)).toBe(ENERGY_REGEN_AWAKE);
});

test("getEnergyRegenRate returns correct rate for sleeping state", () => {
  expect(getEnergyRegenRate(true)).toBe(ENERGY_REGEN_SLEEPING);
});

test("sleeping regen rate is higher than awake rate", () => {
  expect(ENERGY_REGEN_SLEEPING).toBeGreaterThan(ENERGY_REGEN_AWAKE);
});

test("applyEnergyRegen increases energy when awake", () => {
  const result = applyEnergyRegen(1000, 10000, false);
  expect(result).toBe(1000 + ENERGY_REGEN_AWAKE);
});

test("applyEnergyRegen increases energy faster when sleeping", () => {
  const result = applyEnergyRegen(1000, 10000, true);
  expect(result).toBe(1000 + ENERGY_REGEN_SLEEPING);
});

test("applyEnergyRegen clamps to max energy", () => {
  const maxEnergy = 5000;
  const result = applyEnergyRegen(4990, maxEnergy, true);
  expect(result).toBe(maxEnergy);
});

test("applyEnergyRegen does not exceed max when already at max", () => {
  const maxEnergy = 5000;
  const result = applyEnergyRegen(maxEnergy, maxEnergy, true);
  expect(result).toBe(maxEnergy);
});
