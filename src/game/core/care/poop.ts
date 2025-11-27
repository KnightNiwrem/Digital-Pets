/**
 * Poop generation and effects logic.
 */

import type { Tick } from "@/game/types/common";
import type { Pet, PetPoop } from "@/game/types/pet";
import {
  MAX_POOP_COUNT,
  POOP_INTERVAL_AWAKE,
  POOP_INTERVAL_SLEEPING,
} from "./constants";

// Re-export constants for backwards compatibility with tests
export { MAX_POOP_COUNT, POOP_INTERVAL_AWAKE, POOP_INTERVAL_SLEEPING };

/**
 * Process poop generation for a single tick.
 * Returns updated poop state.
 */
export function processPoopTick(pet: Pet): PetPoop {
  const isSleeping = pet.sleep.isSleeping;
  const currentPoop = pet.poop;

  // Decrement ticks until next poop
  const newTicksUntilNext = currentPoop.ticksUntilNext - 1;

  // Check if it's time to generate poop
  if (newTicksUntilNext <= 0) {
    // Generate poop and reset timer
    const interval = isSleeping ? POOP_INTERVAL_SLEEPING : POOP_INTERVAL_AWAKE;
    return {
      count: Math.min(currentPoop.count + 1, MAX_POOP_COUNT),
      ticksUntilNext: interval,
    };
  }

  // Just decrement the timer
  return {
    count: currentPoop.count,
    ticksUntilNext: newTicksUntilNext,
  };
}

/**
 * Get the initial poop timer for a new pet.
 */
export function getInitialPoopTimer(): Tick {
  return POOP_INTERVAL_AWAKE;
}

/**
 * Remove poop using a cleaning item.
 * Returns the new poop count after cleaning.
 */
export function removePoop(currentCount: number, poopRemoved: number): number {
  return Math.max(0, currentCount - poopRemoved);
}
