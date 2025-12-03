/**
 * Home base location data.
 */

import {
  FacilityType,
  type Location,
  LocationType,
} from "@/game/types/location";

/**
 * Home - the player's starting location.
 * Safe area with all basic care facilities.
 */
export const homeLocation: Location = {
  id: "home",
  name: "Home",
  description:
    "Your cozy home base where you care for your pet. A safe haven with everything needed for basic pet care.",
  type: LocationType.Home,
  connections: [
    { targetId: "meadow", energyCost: 5 },
    { targetId: "willowbrook", energyCost: 10 },
  ],
  facilities: [
    FacilityType.RestArea,
    FacilityType.FoodStation,
    FacilityType.WaterStation,
    FacilityType.PlayArea,
    FacilityType.Storage,
  ],
  npcIds: ["trainer_oak"],
  emoji: "🏠",
};
