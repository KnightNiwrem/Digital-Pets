/**
 * Types for the exploration system.
 */

import type { ExplorationRequirements } from "./activity";
import type { Tick } from "./common";

/**
 * Exploration activity definition.
 */
export interface ExplorationActivity {
  /** Unique identifier for the activity */
  id: string;
  /** Display name of the activity */
  name: string;
  /** Text describing what the activity does */
  description: string;
  /** Time to complete, measured in ticks */
  duration: Tick;
  /** Energy consumed when starting the activity (in display units) */
  energyCost: number;
  /** Conditions that must be met to perform this activity */
  requirements?: ExplorationRequirements;
  /** Base probability of triggering an encounter (0.0 to 1.0) */
  encounterChance: number;
  /** Ticks before this activity can be performed again at the same location */
  cooldownDuration?: Tick;
  /** Skill ID to XP multiplier for skill rewards on completion */
  skillFactors: Record<string, number>;
}

/**
 * Drop table entry with roll-based drops.
 */
export interface DropTableEntry {
  /** Item that can drop */
  itemId: string;
  /** Number of items granted when this entry passes */
  quantity: number;
  /** Minimum roll value required (0.0 to 1.0) */
  minRoll: number;
  /** Conditions that must be met for this entry to be evaluated */
  requirements?: ExplorationRequirements;
}

/**
 * Drop table for a location-activity combination.
 */
export interface DropTable {
  /** Unique identifier for the drop table */
  id: string;
  /** Entries in this drop table */
  entries: DropTableEntry[];
}
