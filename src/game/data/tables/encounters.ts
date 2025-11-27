/**
 * Encounter table definitions for wild areas.
 */

import { SPECIES } from "@/game/data/species";
import { GrowthStage } from "@/game/types/constants";

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
      speciesIds: [SPECIES.FLORABIT.id, SPECIES.SPARKFIN.id],
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
      speciesIds: [SPECIES.FLORABIT.id, SPECIES.ROCKPUP.id],
      levelOffset: [0, 3],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.3,
      speciesIds: [SPECIES.SPARKFIN.id],
      levelOffset: [2, 5],
    },
  ],
};

/**
 * Whispering Coast encounter table - coastal area.
 */
export const coastEncounters: EncounterTable = {
  id: "coast_encounters",
  baseEncounterChance: 0.35,
  entries: [
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.8,
      speciesIds: [SPECIES.SPARKFIN.id, SPECIES.CORALITE.id],
      levelOffset: [-1, 3],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.2,
      speciesIds: [SPECIES.FLORABIT.id],
      levelOffset: [0, 2],
    },
  ],
};

/**
 * Scorched Highlands encounter table - volcanic area.
 */
export const highlandsEncounters: EncounterTable = {
  id: "highlands_encounters",
  baseEncounterChance: 0.5,
  entries: [
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.6,
      speciesIds: [SPECIES.ROCKPUP.id, SPECIES.EMBERFOX.id],
      levelOffset: [0, 4],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.4,
      speciesIds: [SPECIES.EMBERFOX.id],
      levelOffset: [2, 6],
      minStage: GrowthStage.Teen,
    },
  ],
};

/**
 * Crystal Caves encounter table - dungeon.
 */
export const cavesEncounters: EncounterTable = {
  id: "caves_encounters",
  baseEncounterChance: 0.45,
  entries: [
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.5,
      speciesIds: [SPECIES.ROCKPUP.id, SPECIES.CORALITE.id],
      levelOffset: [0, 5],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.35,
      speciesIds: [SPECIES.SPARKFIN.id],
      levelOffset: [2, 6],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.15,
      speciesIds: [SPECIES.SHADOWMOTH.id],
      levelOffset: [4, 8],
      minStage: GrowthStage.Child,
    },
  ],
};

/**
 * Shadow Depths encounter table - end-game dungeon.
 */
export const depthsEncounters: EncounterTable = {
  id: "depths_encounters",
  baseEncounterChance: 0.6,
  entries: [
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.4,
      speciesIds: [SPECIES.SHADOWMOTH.id, SPECIES.ROCKPUP.id],
      levelOffset: [0, 6],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.4,
      speciesIds: [SPECIES.SHADOWMOTH.id, SPECIES.EMBERFOX.id],
      levelOffset: [3, 8],
    },
    {
      encounterType: EncounterType.WildBattle,
      probability: 0.2,
      speciesIds: [SPECIES.SHADOWMOTH.id],
      levelOffset: [5, 10],
      minStage: GrowthStage.YoungAdult,
    },
  ],
};

/**
 * All encounter tables indexed by ID.
 */
export const ENCOUNTER_TABLES: Record<string, EncounterTable> = {
  meadow_encounters: meadowEncounters,
  woods_encounters: woodsEncounters,
  coast_encounters: coastEncounters,
  highlands_encounters: highlandsEncounters,
  caves_encounters: cavesEncounters,
  depths_encounters: depthsEncounters,
};

/**
 * Get an encounter table by ID.
 */
export function getEncounterTable(id: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES[id];
}
