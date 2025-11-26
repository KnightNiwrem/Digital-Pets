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
 * All wild area locations.
 */
export const wildLocations: Location[] = [sunnyMeadow, mistyWoods];
