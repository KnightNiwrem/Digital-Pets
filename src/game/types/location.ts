/**
 * Location types and interfaces for the world map system.
 */

import type { GrowthStage } from "./constants";

/**
 * Types of locations in the game world.
 */
export const LocationType = {
  Home: "home",
  Town: "town",
  Wild: "wild",
  Dungeon: "dungeon",
} as const;

export type LocationType = (typeof LocationType)[keyof typeof LocationType];

/**
 * Requirement types for accessing locations.
 */
export interface LocationRequirement {
  /** Minimum growth stage required */
  stage?: GrowthStage;
  /** Quest ID that must be completed */
  questId?: string;
  /** Minimum skill level required (skill ID to level) */
  skill?: { skillId: string; level: number };
  /** Must have discovered this location */
  discovered?: boolean;
}

/**
 * Connection between two locations.
 */
export interface LocationConnection {
  /** Target location ID */
  targetId: string;
  /** Energy cost to travel this edge (in display units) */
  energyCost: number;
  /** Terrain modifier for travel cost */
  terrainModifier?: number;
}

/**
 * Facility available at a location.
 */
export const FacilityType = {
  RestArea: "restArea",
  FoodStation: "foodStation",
  WaterStation: "waterStation",
  PlayArea: "playArea",
  Storage: "storage",
  Shop: "shop",
  Trainer: "trainer",
  Inn: "inn",
  QuestBoard: "questBoard",
  RestPoint: "restPoint",
  ForageZone: "forageZone",
  BattleArea: "battleArea",
} as const;

export type FacilityType = (typeof FacilityType)[keyof typeof FacilityType];

/**
 * A location in the game world.
 */
export interface Location {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Location description */
  description: string;
  /** Type of location */
  type: LocationType;
  /** Connected locations with travel costs */
  connections: LocationConnection[];
  /** Minimum encounter level (for wild/dungeon) */
  levelMin?: number;
  /** Maximum encounter level (for wild/dungeon) */
  levelMax?: number;
  /** Requirements to access this location */
  requirements?: LocationRequirement;
  /** Facilities available at this location */
  facilities: FacilityType[];
  /** Reference to forage table ID (for wild areas) */
  forageTableId?: string;
  /** Reference to encounter table ID (for wild/dungeon) */
  encounterTableId?: string;
  /** NPC IDs present at this location */
  npcIds?: string[];
  /** Visual emoji for the map */
  emoji: string;
}

/**
 * World graph containing all locations.
 */
export interface WorldMap {
  /** All locations indexed by ID */
  locations: Record<string, Location>;
  /** Starting location ID */
  startingLocationId: string;
}

/**
 * Travel result containing new state and any messages.
 */
export interface TravelResult {
  success: boolean;
  message: string;
  energyCost?: number;
}
