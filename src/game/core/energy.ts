/**
 * Energy regeneration logic based on sleep state.
 */

import type { MicroValue } from "@/game/types/common";

/**
 * Energy regeneration rates per tick (micro-units).
 */
export const ENERGY_REGEN_AWAKE: MicroValue = 8;
export const ENERGY_REGEN_SLEEPING: MicroValue = 25;

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
