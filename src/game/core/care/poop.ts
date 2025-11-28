/**
 * Poop generation and effects logic.
 *
 * Uses a micro-unit decay system to handle different poop generation rates
 * for awake vs sleeping states. The timer uses a fixed threshold (POOP_MICRO_THRESHOLD)
 * and decays at different rates depending on state:
 * - Awake: decays faster (reaches threshold in 480 ticks = 4 hours)
 * - Sleeping: decays slower (reaches threshold in 960 ticks = 8 hours)
 *
 * This ensures that mid-cycle state changes (e.g., going to sleep) properly
 * adjust the remaining time proportionally.
 */

import type { Tick } from "@/game/types/common";
import type { Pet, PetPoop } from "@/game/types/pet";
import {
  MAX_POOP_COUNT,
  POOP_DECAY_AWAKE,
  POOP_DECAY_SLEEPING,
  POOP_MICRO_THRESHOLD,
} from "./constants";

// Re-export constants for backwards compatibility with tests
export {
  MAX_POOP_COUNT,
  POOP_DECAY_AWAKE,
  POOP_DECAY_SLEEPING,
  POOP_MICRO_THRESHOLD,
};

/**
 * Process poop generation for a single tick.
 * Uses decay rate approach: timer decreases by different amounts based on state.
 * Returns updated poop state.
 */
export function processPoopTick(pet: Pet): PetPoop {
  const isSleeping = pet.sleep.isSleeping;
  const currentPoop = pet.poop;

  // Decay based on current state
  const decayRate = isSleeping ? POOP_DECAY_SLEEPING : POOP_DECAY_AWAKE;
  const newTicksUntilNext = currentPoop.ticksUntilNext - decayRate;

  // Check if it's time to generate poop
  if (newTicksUntilNext <= 0) {
    // Generate poop and reset timer to threshold
    // Carry over any negative remainder for precision
    const remainder = Math.abs(newTicksUntilNext);
    return {
      count: Math.min(currentPoop.count + 1, MAX_POOP_COUNT),
      ticksUntilNext: POOP_MICRO_THRESHOLD - remainder,
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
 * Returns the micro-threshold value which will decay based on state.
 */
export function getInitialPoopTimer(): Tick {
  return POOP_MICRO_THRESHOLD;
}

/**
 * Remove poop using a cleaning item.
 * Returns the new poop count after cleaning.
 */
export function removePoop(currentCount: number, poopRemoved: number): number {
  return Math.max(0, currentCount - poopRemoved);
}
