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
    { targetId: "ancient_grove", energyCost: 12, terrainModifier: 1.1 },
  ],
  levelMin: 1,
  levelMax: 5,
  requirements: {
    questId: "tutorial_first_steps",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
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
    { targetId: "ancient_grove", energyCost: 15, terrainModifier: 1.2 },
    { targetId: "mushroom_hollow", energyCost: 12, terrainModifier: 1.1 },
  ],
  levelMin: 5,
  levelMax: 15,
  requirements: {
    stage: GrowthStage.Child,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
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
    { targetId: "tidecrest", energyCost: 8 },
    { targetId: "coral_reef", energyCost: 18, terrainModifier: 1.4 },
  ],
  levelMin: 3,
  levelMax: 10,
  requirements: {
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
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
    { targetId: "ironhaven", energyCost: 15, terrainModifier: 1.2 },
    { targetId: "volcanic_caldera", energyCost: 25, terrainModifier: 1.5 },
  ],
  levelMin: 15,
  levelMax: 25,
  requirements: {
    stage: GrowthStage.Teen,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
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
    { targetId: "ironhaven", energyCost: 12 },
    { targetId: "mushroom_hollow", energyCost: 18 },
  ],
  levelMin: 10,
  levelMax: 20,
  requirements: {
    stage: GrowthStage.Child,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
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
    { targetId: "starfall_sanctuary", energyCost: 25, terrainModifier: 1.5 },
  ],
  levelMin: 20,
  levelMax: 30,
  requirements: {
    stage: GrowthStage.YoungAdult,
    questId: "tutorial_training",
  },
  facilities: [FacilityType.ForageZone, FacilityType.BattleArea],
  dropTableIds: {},
  encounterTableId: "depths_encounters",
  emoji: "🕳️",
};

/**
 * Ancient Grove - a mystical forest area.
 * Features unique flora and peaceful exploration.
 */
export const ancientGrove: Location = {
  id: "ancient_grove",
  name: "Ancient Grove",
  description:
    "A sacred forest where ancient trees tower to the sky. The air hums with natural energy, and rare herbs grow in abundance.",
  type: LocationType.Wild,
  connections: [
    { targetId: "meadow", energyCost: 12, terrainModifier: 1.1 },
    { targetId: "misty_woods", energyCost: 15, terrainModifier: 1.2 },
    { targetId: "mushroom_hollow", energyCost: 10 },
  ],
  levelMin: 4,
  levelMax: 12,
  requirements: {
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
  encounterTableId: "grove_encounters",
  emoji: "🌳",
};

/**
 * Mushroom Hollow - underground fungal caves.
 * A bioluminescent wonderland with unique resources.
 */
export const mushroomHollow: Location = {
  id: "mushroom_hollow",
  name: "Mushroom Hollow",
  description:
    "An underground cavern lit by glowing mushrooms of every color. Strange spores float through the air, and peculiar creatures call this place home.",
  type: LocationType.Wild,
  connections: [
    { targetId: "misty_woods", energyCost: 12, terrainModifier: 1.1 },
    { targetId: "ancient_grove", energyCost: 10 },
    { targetId: "crystal_caves", energyCost: 18, terrainModifier: 1.3 },
  ],
  levelMin: 8,
  levelMax: 16,
  requirements: {
    stage: GrowthStage.Child,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
  encounterTableId: "hollow_encounters",
  emoji: "🍄",
};

/**
 * Coral Reef - underwater exploration zone.
 * Rich in aquatic resources and sea creatures.
 */
export const coralReef: Location = {
  id: "coral_reef",
  name: "Coral Reef",
  description:
    "A vibrant underwater paradise teeming with colorful fish and coral formations. The water is crystal clear and warm.",
  type: LocationType.Wild,
  connections: [
    { targetId: "whispering_coast", energyCost: 18, terrainModifier: 1.4 },
    { targetId: "tidecrest", energyCost: 15, terrainModifier: 1.3 },
    { targetId: "sunken_temple", energyCost: 22, terrainModifier: 1.5 },
  ],
  levelMin: 10,
  levelMax: 18,
  requirements: {
    stage: GrowthStage.Child,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
  encounterTableId: "reef_encounters",
  emoji: "🪸",
};

/**
 * Frozen Peaks - icy mountain region.
 * Harsh conditions but valuable ice crystals and rare creatures.
 */
export const frozenPeaks: Location = {
  id: "frozen_peaks",
  name: "Frozen Peaks",
  description:
    "Snow-capped mountains where blizzards rage and ice covers everything. Only the hardiest pets can withstand the freezing temperatures.",
  type: LocationType.Wild,
  connections: [
    { targetId: "ironhaven", energyCost: 20, terrainModifier: 1.4 },
    { targetId: "starfall_sanctuary", energyCost: 30, terrainModifier: 1.6 },
    { targetId: "glacial_cavern", energyCost: 25, terrainModifier: 1.5 },
  ],
  levelMin: 18,
  levelMax: 28,
  requirements: {
    stage: GrowthStage.Teen,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
  encounterTableId: "peaks_encounters",
  emoji: "🏔️",
};

/**
 * Volcanic Caldera - the heart of the volcano.
 * End-game fire area with rare magma materials.
 */
export const volcanicCaldera: Location = {
  id: "volcanic_caldera",
  name: "Volcanic Caldera",
  description:
    "The blazing heart of an active volcano. Lava flows freely and the heat is almost unbearable, but legendary treasures await within.",
  type: LocationType.Dungeon,
  connections: [
    { targetId: "scorched_highlands", energyCost: 25, terrainModifier: 1.5 },
  ],
  levelMin: 22,
  levelMax: 32,
  requirements: {
    stage: GrowthStage.YoungAdult,
    questId: "tutorial_training",
  },
  facilities: [FacilityType.ForageZone, FacilityType.BattleArea],
  dropTableIds: {},
  encounterTableId: "caldera_encounters",
  emoji: "🔥",
};

/**
 * Sunken Temple - ancient underwater ruins.
 * A mysterious dungeon with aquatic challenges.
 */
export const sunkenTemple: Location = {
  id: "sunken_temple",
  name: "Sunken Temple",
  description:
    "The ruins of an ancient civilization now lie beneath the waves. Strange glyphs glow on the walls, and guardian creatures protect its secrets.",
  type: LocationType.Dungeon,
  connections: [
    { targetId: "coral_reef", energyCost: 22, terrainModifier: 1.5 },
    { targetId: "tidecrest", energyCost: 25, terrainModifier: 1.5 },
  ],
  levelMin: 18,
  levelMax: 26,
  requirements: {
    stage: GrowthStage.Teen,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.RestPoint,
    FacilityType.ForageZone,
    FacilityType.BattleArea,
  ],
  dropTableIds: {},
  encounterTableId: "temple_encounters",
  emoji: "🏛️",
};

/**
 * Glacial Cavern - ice dungeon in the mountains.
 * Features frozen creatures and ice materials.
 */
export const glacialCavern: Location = {
  id: "glacial_cavern",
  name: "Glacial Cavern",
  description:
    "A vast ice cave where stalactites of pure crystal hang from the ceiling. The cold preserves ancient mysteries within its frozen walls.",
  type: LocationType.Dungeon,
  connections: [
    { targetId: "frozen_peaks", energyCost: 25, terrainModifier: 1.5 },
    { targetId: "celestial_spire", energyCost: 35, terrainModifier: 1.7 },
  ],
  levelMin: 24,
  levelMax: 34,
  requirements: {
    stage: GrowthStage.YoungAdult,
    questId: "tutorial_training",
  },
  facilities: [FacilityType.ForageZone, FacilityType.BattleArea],
  dropTableIds: {},
  encounterTableId: "glacial_encounters",
  emoji: "🧊",
};

/**
 * Celestial Spire - the ultimate end-game zone.
 * The highest challenge with the rarest rewards.
 */
export const celestialSpire: Location = {
  id: "celestial_spire",
  name: "Celestial Spire",
  description:
    "A tower that reaches beyond the clouds into the realm of stars. Only pets who have mastered all challenges may enter this sacred place.",
  type: LocationType.Dungeon,
  connections: [
    { targetId: "glacial_cavern", energyCost: 35, terrainModifier: 1.7 },
    { targetId: "starfall_sanctuary", energyCost: 35, terrainModifier: 1.8 },
  ],
  levelMin: 28,
  levelMax: 40,
  requirements: {
    stage: GrowthStage.Adult,
    questId: "tutorial_training",
  },
  facilities: [FacilityType.ForageZone, FacilityType.BattleArea],
  dropTableIds: {},
  encounterTableId: "spire_encounters",
  emoji: "🌟",
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
  ancientGrove,
  mushroomHollow,
  coralReef,
  frozenPeaks,
  volcanicCaldera,
  sunkenTemple,
  glacialCavern,
  celestialSpire,
];
