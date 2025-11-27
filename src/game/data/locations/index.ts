/**
 * World map combining all locations into a connected graph.
 */

import type { Location, WorldMap } from "@/game/types/location";
import { homeLocation } from "./home";
import { townLocations } from "./towns";
import { explorableLocations } from "./wild";

/**
 * All locations in the game world.
 */
export const allLocations: Location[] = [
  homeLocation,
  ...townLocations,
  ...explorableLocations,
];

/**
 * Locations indexed by ID for quick lookup.
 */
export const locationsById: Record<string, Location> = allLocations.reduce(
  (acc, location) => {
    acc[location.id] = location;
    return acc;
  },
  {} as Record<string, Location>,
);

/**
 * The complete world map.
 */
export const worldMap: WorldMap = {
  locations: locationsById,
  startingLocationId: "home",
};

/**
 * Get a location by ID.
 */
export function getLocation(id: string): Location | undefined {
  return locationsById[id];
}

/**
 * Get all connected locations for a given location.
 */
export function getConnectedLocations(locationId: string): Location[] {
  const location = getLocation(locationId);
  if (!location) return [];

  return location.connections
    .map((conn) => getLocation(conn.targetId))
    .filter((loc): loc is Location => loc !== undefined);
}

/**
 * Check if two locations are directly connected.
 */
export function areLocationsConnected(fromId: string, toId: string): boolean {
  const location = getLocation(fromId);
  if (!location) return false;

  return location.connections.some((conn) => conn.targetId === toId);
}
