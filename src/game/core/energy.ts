/**
 * Energy regeneration logic based on sleep state.
 */

import type { MicroValue } from "@/game/types/common";

/**
 * Energy regeneration rates per tick (micro-units).
 *
 * Per spec (training.md):
 * - Awake: +40 per tick → ~4800 micro/hour = ~4.8 display/hour
 * - Sleeping: +120 per tick → ~14400 micro/hour = ~14.4 display/hour
 */
export const ENERGY_REGEN_AWAKE: MicroValue = 40;
export const ENERGY_REGEN_SLEEPING: MicroValue = 120;

/**
 * Get energy regeneration rate based on sleep state.
 */
export function getEnergyRegenRate(isSleeping: boolean): MicroValue {
  return isSleeping ? ENERGY_REGEN_SLEEPING : ENERGY_REGEN_AWAKE;
}

/**
 * Calculate new energy value after regeneration.
 * Clamps to maxEnergy.
 */
export function applyEnergyRegen(
  currentEnergy: MicroValue,
  maxEnergy: MicroValue,
  isSleeping: boolean,
): MicroValue {
  const regenRate = getEnergyRegenRate(isSleeping);
  return Math.min(maxEnergy, currentEnergy + regenRate);
}
