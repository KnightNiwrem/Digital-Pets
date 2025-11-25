/**
 * Species definitions for Digital Pets.
 * Initial starter species available from game start.
 */

import type { Species } from "@/game/types/species";

/**
 * Starter species available at game start.
 */
export const SPECIES: Record<string, Species> = {
  // Balanced starter - good all-around
  florabit: {
    id: "florabit",
    name: "Florabit",
    description: "A gentle plant-like creature with balanced abilities.",
    archetype: "balanced",
    emoji: "🌱",
    baseStats: {
      strength: 10,
      endurance: 10,
      agility: 10,
      precision: 10,
      fortitude: 10,
      cunning: 10,
    },
    statGrowth: {
      strength: "medium",
      endurance: "medium",
      agility: "medium",
      precision: "medium",
      fortitude: "medium",
      cunning: "medium",
    },
    careCapMultiplier: 1.0,
    resistances: {
      slashing: 5,
      piercing: 0,
      crushing: 5,
      chemical: 10,
      thermal: 0,
      electric: 0,
    },
    unlockMethod: "starting",
  },

  // Agile glass cannon
  sparkfin: {
    id: "sparkfin",
    name: "Sparkfin",
    description: "A swift aquatic creature that strikes with precision.",
    archetype: "glassCannon",
    emoji: "⚡",
    baseStats: {
      strength: 8,
      endurance: 6,
      agility: 14,
      precision: 14,
      fortitude: 8,
      cunning: 10,
    },
    statGrowth: {
      strength: "medium",
      endurance: "low",
      agility: "high",
      precision: "high",
      fortitude: "low",
      cunning: "medium",
    },
    careCapMultiplier: 0.85,
    resistances: {
      slashing: 0,
      piercing: 5,
      crushing: 0,
      chemical: 0,
      thermal: 5,
      electric: 15,
    },
    unlockMethod: "starting",
  },

  // Tanky defender
  rockpup: {
    id: "rockpup",
    name: "Rockpup",
    description: "A sturdy rock-like creature with high endurance.",
    archetype: "defender",
    emoji: "🪨",
    baseStats: {
      strength: 12,
      endurance: 14,
      agility: 6,
      precision: 8,
      fortitude: 14,
      cunning: 6,
    },
    statGrowth: {
      strength: "medium",
      endurance: "high",
      agility: "low",
      precision: "low",
      fortitude: "high",
      cunning: "low",
    },
    careCapMultiplier: 1.2,
    resistances: {
      slashing: 10,
      piercing: 15,
      crushing: 5,
      chemical: 0,
      thermal: 10,
      electric: 0,
    },
    unlockMethod: "starting",
  },
};

/**
 * Get all species as an array.
 */
export function getAllSpecies(): Species[] {
  return Object.values(SPECIES);
}

/**
 * Get a species by ID.
 */
export function getSpeciesById(id: string): Species | undefined {
  return SPECIES[id];
}

/**
 * Get all starter species.
 */
export function getStarterSpecies(): Species[] {
  return getAllSpecies().filter((s) => s.unlockMethod === "starting");
}
