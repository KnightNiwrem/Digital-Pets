/**
 * Wild area location data.
 */

import { GrowthStage } from "@/game/types/constants";
import {
  FacilityType,
  type Location,
  LocationType,
} from "@/game/types/location";

/**
 * Sunny Meadow - beginner-friendly wild area.
 * Good for early foraging with low-level encounters.
 */
export const sunnyMeadow: Location = {
  id: "meadow",
  name: "Sunny Meadow",
  description:
    "A bright, open meadow filled with wildflowers and gentle creatures. Perfect for young pets to explore.",
  type: LocationType.Wild,
  connections: [
    { targetId: "home", energyCost: 5 },
    { targetId: "willowbrook", energyCost: 5 },
    { targetId: "misty_woods", energyCost: 10, terrainModifier: 1.2 },
    { targetId: "whispering_coast", energyCost: 15, terrainModifier: 1.3 },
  ],
  levelMin: 1,
  levelMax: 5,
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  forageTableId: "meadow_forage",
  encounterTableId: "meadow_encounters",
  emoji: "🌻",
};

/**
 * Misty Woods - intermediate wild area.
 * Requires more progression but has better rewards.
 */
export const mistyWoods: Location = {
  id: "misty_woods",
  name: "Misty Woods",
  description:
    "A dense forest shrouded in mist. Strange sounds echo between ancient trees. Not for the faint of heart.",
  type: LocationType.Wild,
  connections: [
    { targetId: "meadow", energyCost: 10, terrainModifier: 1.2 },
    { targetId: "willowbrook", energyCost: 15 },
    { targetId: "crystal_caves", energyCost: 20, terrainModifier: 1.5 },
    { targetId: "scorched_highlands", energyCost: 25, terrainModifier: 1.4 },
  ],
  levelMin: 5,
  levelMax: 15,
  requirements: {
    stage: GrowthStage.Child,
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  forageTableId: "woods_forage",
  encounterTableId: "woods_encounters",
  emoji: "🌲",
};

/**
 * Whispering Coast - coastal wild area.
 * A beach area with aquatic encounters.
 */
export const whisperingCoast: Location = {
  id: "whispering_coast",
  name: "Whispering Coast",
  description:
    "A serene coastline where waves gently lap the shore. Sea creatures and coastal critters make their home here.",
  type: LocationType.Wild,
  connections: [
    { targetId: "willowbrook", energyCost: 12 },
    { targetId: "meadow", energyCost: 15, terrainModifier: 1.3 },
  ],
  levelMin: 3,
  levelMax: 10,
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  forageTableId: "coast_forage",
  encounterTableId: "coast_encounters",
  emoji: "🏖️",
};

/**
 * Scorched Highlands - volcanic wild area.
 * High-level area with powerful fire-type creatures.
 */
export const scorchedHighlands: Location = {
  id: "scorched_highlands",
  name: "Scorched Highlands",
  description:
    "A rugged volcanic region where the ground itself seems alive with heat. Only the toughest pets venture here.",
  type: LocationType.Wild,
  connections: [
    { targetId: "misty_woods", energyCost: 25, terrainModifier: 1.4 },
    { targetId: "crystal_caves", energyCost: 20, terrainModifier: 1.3 },
  ],
  levelMin: 15,
  levelMax: 25,
  requirements: {
    stage: GrowthStage.Teen,
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  forageTableId: "highlands_forage",
  encounterTableId: "highlands_encounters",
  emoji: "🌋",
};

/**
 * Crystal Caves - dungeon location.
 * A challenging underground area with rare rewards.
 */
export const crystalCaves: Location = {
  id: "crystal_caves",
  name: "Crystal Caves",
  description:
    "Deep underground caverns filled with glowing crystals. Dangerous creatures lurk in the shadows, but rare treasures await.",
  type: LocationType.Dungeon,
  connections: [
    { targetId: "misty_woods", energyCost: 20, terrainModifier: 1.5 },
    { targetId: "scorched_highlands", energyCost: 20, terrainModifier: 1.3 },
    { targetId: "shadow_depths", energyCost: 30, terrainModifier: 1.8 },
  ],
  levelMin: 10,
  levelMax: 20,
  requirements: {
    stage: GrowthStage.Child,
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  forageTableId: "caves_forage",
  encounterTableId: "caves_encounters",
  emoji: "💎",
};

/**
 * Shadow Depths - advanced dungeon location.
 * End-game dungeon with the toughest challenges.
 */
export const shadowDepths: Location = {
  id: "shadow_depths",
  name: "Shadow Depths",
  description:
    "The deepest part of the cave system. Light barely penetrates here, and only the bravest dare to explore.",
  type: LocationType.Dungeon,
  connections: [
    { targetId: "crystal_caves", energyCost: 30, terrainModifier: 1.8 },
  ],
  levelMin: 20,
  levelMax: 30,
  requirements: {
    stage: GrowthStage.YoungAdult,
  },
  facilities: [FacilityType.ForageZone, FacilityType.BattleArea],
  forageTableId: "depths_forage",
  encounterTableId: "depths_encounters",
  emoji: "🕳️",
};

/**
 * All explorable locations (wild areas and dungeons).
 */
export const explorableLocations: Location[] = [
  sunnyMeadow,
  mistyWoods,
  whisperingCoast,
  scorchedHighlands,
  crystalCaves,
  shadowDepths,
];
