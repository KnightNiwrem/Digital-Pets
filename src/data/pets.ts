// Pet species definitions

import type { PetSpecies } from "@/types/Pet";

export const WILD_BEAST: PetSpecies = {
  id: "wild_beast",
  name: "Wild Beast",
  rarity: "common",
  description: "A basic wild creature found in forests.",
  baseStats: {
    attack: 25,
    defense: 20,
    speed: 30,
    health: 100,
  },
  growthRates: {
    attack: 1.2,
    defense: 1.1,
    speed: 1.3,
    health: 1.15,
    energy: 1.1,
  },
  sprite: "beast.png",
  icon: "beast-icon.png",
};

export const FOREST_GUARDIAN: PetSpecies = {
  id: "forest_guardian",
  name: "Forest Guardian",
  rarity: "uncommon",
  description: "A mystical creature that protects the forest.",
  baseStats: {
    attack: 35,
    defense: 40,
    speed: 25,
    health: 120,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.4,
    speed: 1.2,
    health: 1.25,
    energy: 1.2,
  },
  sprite: "guardian.png",
  icon: "guardian-icon.png",
};

export const ARENA_CHAMPION: PetSpecies = {
  id: "arena_champion",
  name: "Arena Champion",
  rarity: "rare",
  description: "An elite fighter from the battle arena.",
  baseStats: {
    attack: 45,
    defense: 50,
    speed: 40,
    health: 150,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.5,
    speed: 1.35,
    health: 1.3,
    energy: 1.25,
  },
  sprite: "champion.png",
  icon: "champion-icon.png",
};

export const getAllPetSpecies = (): PetSpecies[] => [WILD_BEAST, FOREST_GUARDIAN, ARENA_CHAMPION];

export const getPetSpeciesById = (id: string): PetSpecies | undefined => {
  return getAllPetSpecies().find(species => species.id === id);
};
