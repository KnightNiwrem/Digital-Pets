/**
 * Town location data.
 */

import { GrowthStage } from "@/game/types/constants";
import {
  FacilityType,
  type Location,
  LocationType,
} from "@/game/types/location";

/**
 * Willowbrook - the first town players encounter.
 * A small, friendly town with basic shops and services.
 */
export const willowbrookTown: Location = {
  id: "willowbrook",
  name: "Willowbrook",
  description:
    "A peaceful town nestled among willow trees. Local merchants offer supplies for pet care and adventure.",
  type: LocationType.Town,
  connections: [
    { targetId: "home", energyCost: 10 },
    { targetId: "meadow", energyCost: 5 },
    { targetId: "misty_woods", energyCost: 15 },
    { targetId: "whispering_coast", energyCost: 12 },
  ],
  facilities: [
    FacilityType.Shop,
    FacilityType.Trainer,
    FacilityType.Inn,
    FacilityType.QuestBoard,
  ],
  requirements: {
    questId: "tutorial_training",
  },
  npcIds: ["shopkeeper_mira", "trainer_oak"],
  emoji: "🏘️",
};

/**
 * Ironhaven - a mining town near the mountains.
 * Specializes in mining equipment and ore trading.
 */
export const ironhavenTown: Location = {
  id: "ironhaven",
  name: "Ironhaven",
  description:
    "A rugged mining town built into the mountainside. The sound of pickaxes echoes through the streets, and the smell of forge fires fills the air.",
  type: LocationType.Town,
  connections: [
    { targetId: "scorched_highlands", energyCost: 15, terrainModifier: 1.2 },
    { targetId: "crystal_caves", energyCost: 12 },
    { targetId: "frozen_peaks", energyCost: 20, terrainModifier: 1.4 },
  ],
  requirements: {
    stage: GrowthStage.Child,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.Shop,
    FacilityType.Trainer,
    FacilityType.Inn,
    FacilityType.QuestBoard,
  ],
  npcIds: ["blacksmith_grom", "miner_delva"],
  emoji: "⚒️",
};

/**
 * Tidecrest - a coastal fishing village.
 * Known for seafood and aquatic supplies.
 */
export const tidecrestTown: Location = {
  id: "tidecrest",
  name: "Tidecrest",
  description:
    "A quaint fishing village perched on the cliffs overlooking the sea. Fresh catch is sold daily at the harbor market.",
  type: LocationType.Town,
  connections: [
    { targetId: "whispering_coast", energyCost: 8 },
    { targetId: "coral_reef", energyCost: 15, terrainModifier: 1.3 },
    { targetId: "sunken_temple", energyCost: 25, terrainModifier: 1.5 },
  ],
  facilities: [
    FacilityType.Shop,
    FacilityType.Trainer,
    FacilityType.Inn,
    FacilityType.QuestBoard,
  ],
  requirements: {
    questId: "tutorial_training",
  },
  npcIds: ["fisher_marina", "captain_torrent"],
  emoji: "⚓",
};

/**
 * Starfall Sanctuary - a mystical enclave.
 * End-game town with rare goods and advanced training.
 */
export const starfallSanctuary: Location = {
  id: "starfall_sanctuary",
  name: "Starfall Sanctuary",
  description:
    "An ancient sanctuary hidden among the stars. Only the most accomplished pet trainers find their way here, drawn by whispers of forgotten knowledge.",
  type: LocationType.Town,
  connections: [
    { targetId: "shadow_depths", energyCost: 25, terrainModifier: 1.5 },
    { targetId: "frozen_peaks", energyCost: 30, terrainModifier: 1.6 },
    { targetId: "celestial_spire", energyCost: 35, terrainModifier: 1.8 },
  ],
  requirements: {
    stage: GrowthStage.YoungAdult,
    questId: "tutorial_training",
  },
  facilities: [
    FacilityType.Shop,
    FacilityType.Trainer,
    FacilityType.Inn,
    FacilityType.QuestBoard,
  ],
  npcIds: ["sage_lumina", "archivist_echo"],
  emoji: "✨",
};

/**
 * All town locations.
 */
export const townLocations: Location[] = [
  willowbrookTown,
  ironhavenTown,
  tidecrestTown,
  starfallSanctuary,
];
