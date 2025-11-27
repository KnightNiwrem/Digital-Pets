/**
 * Energy regeneration logic based on sleep state.
 */

import {
  ENERGY_REGEN_AWAKE,
  ENERGY_REGEN_SLEEPING,
} from "@/game/core/care/constants";
import type { MicroValue } from "@/game/types/common";

// Re-export constants for backwards compatibility with tests
export { ENERGY_REGEN_AWAKE, ENERGY_REGEN_SLEEPING };

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
