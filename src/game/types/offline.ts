/**
 * Types for offline progression reporting.
 */

import type { ExplorationDrop } from "./activity";
import type { MicroValue, Tick } from "./common";

/**
 * Snapshot of care stats for comparison.
 */
export interface CareStatsSnapshot {
  satiety: MicroValue;
  hydration: MicroValue;
  happiness: MicroValue;
  energy: MicroValue;
}

/**
 * Result of an exploration that completed during offline time.
 */
export interface OfflineExplorationResult {
  /** Location name where exploration occurred */
  locationName: string;
  /** Items found during exploration */
  itemsFound: ExplorationDrop[];
  /** Message describing the result */
  message: string;
}

/**
 * Maximum stat values for the pet at the time of the report.
 */
export interface MaxStatsSnapshot {
  careStatMax: MicroValue;
  energyMax: MicroValue;
}

/**
 * Report of changes during offline time.
 */
export interface OfflineReport {
  /** Total real-world time elapsed in milliseconds */
  elapsedMs: number;
  /** Number of ticks processed */
  ticksProcessed: Tick;
  /** Whether the maximum offline cap was reached */
  wasCapped: boolean;
  /** Pet name at time of report (null if no pet) */
  petName: string | null;
  /** Care stats before offline processing */
  beforeStats: CareStatsSnapshot | null;
  /** Care stats after offline processing */
  afterStats: CareStatsSnapshot | null;
  /** Maximum stat values for the pet */
  maxStats: MaxStatsSnapshot | null;
  /** Poop count before offline processing */
  poopBefore: number;
  /** Poop count after offline processing */
  poopAfter: number;
  /** Exploration results that completed during offline time */
  explorationResults: OfflineExplorationResult[];
}

/**
 * Minimum elapsed time (in ms) to show the offline report dialog.
 * Set to 5 minutes.
 */
export const MIN_OFFLINE_REPORT_MS = 5 * 60 * 1000;
