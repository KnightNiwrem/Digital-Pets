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

  // Evasive status specialist - quest unlock
  coralite: {
    id: "coralite",
    name: "Coralite",
    description:
      "A mysterious aquatic creature covered in beautiful coral. Elusive and tricky.",
    archetype: "status",
    emoji: "🐚",
    baseStats: {
      strength: 8,
      endurance: 10,
      agility: 12,
      precision: 12,
      fortitude: 8,
      cunning: 14,
    },
    statGrowth: {
      strength: "low",
      endurance: "medium",
      agility: "medium",
      precision: "high",
      fortitude: "low",
      cunning: "high",
    },
    careCapMultiplier: 0.9,
    resistances: {
      slashing: 0,
      piercing: 5,
      crushing: 5,
      chemical: 10,
      thermal: 0,
      electric: 15,
    },
    unlockMethod: "quest",
  },

  // Fiery power tank - discovery unlock
  emberfox: {
    id: "emberfox",
    name: "Emberfox",
    description:
      "A fierce fox-like creature wreathed in flames. Its power is unmatched but requires careful handling.",
    archetype: "powerTank",
    emoji: "🔥",
    baseStats: {
      strength: 16,
      endurance: 12,
      agility: 10,
      precision: 8,
      fortitude: 10,
      cunning: 8,
    },
    statGrowth: {
      strength: "high",
      endurance: "high",
      agility: "medium",
      precision: "low",
      fortitude: "medium",
      cunning: "low",
    },
    careCapMultiplier: 1.25,
    resistances: {
      slashing: 0,
      piercing: 0,
      crushing: 0,
      chemical: 5,
      thermal: 25,
      electric: 5,
    },
    unlockMethod: "discovery",
  },

  // Evasion specialist - discovery unlock
  shadowmoth: {
    id: "shadowmoth",
    name: "Shadowmoth",
    description:
      "A dark, ethereal moth-like creature that flits through shadows. Nearly impossible to catch.",
    archetype: "evasion",
    emoji: "🦋",
    baseStats: {
      strength: 6,
      endurance: 8,
      agility: 16,
      precision: 10,
      fortitude: 6,
      cunning: 14,
    },
    statGrowth: {
      strength: "low",
      endurance: "low",
      agility: "high",
      precision: "medium",
      fortitude: "low",
      cunning: "high",
    },
    careCapMultiplier: 0.8,
    resistances: {
      slashing: 5,
      piercing: 0,
      crushing: 0,
      chemical: 15,
      thermal: 0,
      electric: 10,
    },
    unlockMethod: "discovery",
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
