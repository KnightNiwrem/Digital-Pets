/**
 * Encounter table definitions for wild areas.
 */

import type { GrowthStage } from "@/game/types/constants";

/**
 * Encounter type during exploration.
 */
export const EncounterType = {
  WildBattle: "wildBattle",
} as const;

export type EncounterType = (typeof EncounterType)[keyof typeof EncounterType];

/**
 * A single encounter entry in an encounter table.
 */
export interface EncounterEntry {
  /** Type of encounter */
  encounterType: EncounterType;
  /** Base probability of this encounter (0-1) */
  probability: number;
  /** Possible species that can appear */
  speciesIds: string[];
  /** Level offset range from area base level [min, max] */
  levelOffset: [number, number];
  /** Minimum growth stage required for this encounter */
  minStage?: GrowthStage;
}

/**
 * Encounter table for a location.
 */
export interface EncounterTable {
  /** Table identifier */
  id: string;
  /** Base encounter chance per exploration tick (0-1) */
  baseEncounterChance: number;
  /** Possible encounters */
  entries: EncounterEntry[];
}

/**
 * Sunny Meadow encounter table - beginner area.
 */
export const meadowEncounters: EncounterTable = {
  id: "meadow_encounters",
  baseEncounterChance: 0.3,
  entries: [
    {
      encounterType: EncounterType.WildBattle,
      probability: 1.0,
      speciesIds: ["florabit", "sparkfin"],
      levelOffset: [-1, 2],
    },
  ],
};

/**
 * Misty Woods encounter table - intermediate area.
 */
export const woodsEncounters: EncounterTable = {
  id: "woods_encounters",
  baseEncounterChance: 0.4,
  entries: [
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.7,
      speciesIds: ["florabit", "rockpup"],
      levelOffset: [0, 3],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.3,
      speciesIds: ["sparkfin"],
      levelOffset: [2, 5],
    },
  ],
};

/**
 * All encounter tables indexed by ID.
 */
export const ENCOUNTER_TABLES: Record<string, EncounterTable> = {
  meadow_encounters: meadowEncounters,
  woods_encounters: woodsEncounters,
};

/**
 * Get an encounter table by ID.
 */
export function getEncounterTable(id: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES[id];
}
