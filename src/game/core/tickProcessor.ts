/**
 * Tick processor for batch processing multiple ticks.
 */

import { processPetTick } from "@/game/core/tick";
import { GROWTH_STAGE_DEFINITIONS } from "@/game/data/growthStages";
import { getSpeciesById } from "@/game/data/species";
import type { Tick } from "@/game/types/common";
import { now, TICK_DURATION_MS } from "@/game/types/common";
import type { GameState } from "@/game/types/gameState";
import type {
  CareStatsSnapshot,
  MaxStatsSnapshot,
  OfflineReport,
} from "@/game/types/offline";

/**
 * Process a single game tick, updating the entire game state.
 */
export function processGameTick(state: GameState): GameState {
  // If no pet, just update time
  if (!state.pet) {
    return {
      ...state,
      totalTicks: state.totalTicks + 1,
      lastSaveTime: now(),
    };
  }

  // Process pet tick
  const updatedPet = processPetTick(state.pet);

  return {
    ...state,
    pet: updatedPet,
    totalTicks: state.totalTicks + 1,
    lastSaveTime: now(),
  };
}

/**
 * Process multiple ticks at once (for offline catch-up).
 * Processes ticks sequentially to maintain correct state transitions.
 */
export function processMultipleTicks(
  state: GameState,
  tickCount: Tick,
): GameState {
  let currentState = state;

  for (let i = 0; i < tickCount; i++) {
    currentState = processGameTick(currentState);
  }

  return currentState;
}

/**
 * Result of catching up offline ticks.
 */
export interface OfflineCatchupResult {
  /** Updated game state after processing */
  state: GameState;
  /** Number of ticks processed */
  ticksProcessed: Tick;
  /** Whether the maximum offline cap was reached */
  wasCapped: boolean;
  /** Offline report for UI display */
  report: OfflineReport;
}

/**
 * Create care stats snapshot from game state.
 */
function createCareStatsSnapshot(state: GameState): CareStatsSnapshot | null {
  if (!state.pet) return null;
  return {
    satiety: state.pet.careStats.satiety,
    hydration: state.pet.careStats.hydration,
    happiness: state.pet.careStats.happiness,
    energy: state.pet.energyStats.energy,
  };
}

/**
 * Create max stats snapshot from game state based on pet's growth stage and species.
 */
function createMaxStatsSnapshot(state: GameState): MaxStatsSnapshot | null {
  if (!state.pet) return null;

  const species = getSpeciesById(state.pet.identity.speciesId);
  if (!species) return null;

  const stageDef = GROWTH_STAGE_DEFINITIONS[state.pet.growth.stage];
  if (!stageDef) return null;

  return {
    careStatMax: Math.floor(
      stageDef.baseCareStatMax * species.careCapMultiplier,
    ),
    energyMax: Math.floor(stageDef.baseEnergyMax * species.careCapMultiplier),
  };
}

/**
 * Process offline catch-up ticks.
 */
export function processOfflineCatchup(
  state: GameState,
  ticksElapsed: Tick,
  maxOfflineTicks: Tick,
  elapsedMs?: number,
): OfflineCatchupResult {
  const cappedTicks = Math.min(ticksElapsed, maxOfflineTicks);
  const wasCapped = ticksElapsed > maxOfflineTicks;

  // Calculate elapsedMs from ticks if not provided
  const reportElapsedMs = elapsedMs ?? ticksElapsed * TICK_DURATION_MS;

  const beforeStats = createCareStatsSnapshot(state);
  const maxStats = createMaxStatsSnapshot(state);
  const poopBefore = state.pet?.poop.count ?? 0;
  const petName = state.pet?.identity.name ?? null;

  const newState = processMultipleTicks(state, cappedTicks);

  const afterStats = createCareStatsSnapshot(newState);
  const poopAfter = newState.pet?.poop.count ?? 0;

  const report: OfflineReport = {
    elapsedMs: reportElapsedMs,
    ticksProcessed: cappedTicks,
    wasCapped,
    petName,
    beforeStats,
    afterStats,
    maxStats,
    poopBefore,
    poopAfter,
  };

  return {
    state: newState,
    ticksProcessed: cappedTicks,
    wasCapped,
    report,
  };
}
