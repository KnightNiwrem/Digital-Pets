/**
 * Town location data.
 */

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
  ],
  facilities: [
    FacilityType.Shop,
    FacilityType.Trainer,
    FacilityType.Inn,
    FacilityType.QuestBoard,
  ],
  npcIds: ["shopkeeper_mira", "trainer_oak"],
  emoji: "🏘️",
};

/**
 * All town locations.
 */
export const townLocations: Location[] = [willowbrookTown];
