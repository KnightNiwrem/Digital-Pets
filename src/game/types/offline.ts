/**
 * Types for offline progression reporting.
 */

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
  /** Poop count before offline processing */
  poopBefore: number;
  /** Poop count after offline processing */
  poopAfter: number;
}

/**
 * Minimum elapsed time (in ms) to show the offline report dialog.
 * Set to 5 minutes.
 */
export const MIN_OFFLINE_REPORT_MS = 5 * 60 * 1000;
