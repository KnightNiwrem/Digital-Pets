import type { PetSpecies } from "@/types/Pet";

export const ROCK_BEETLE: PetSpecies = {
  id: "rock_beetle",
  name: "Rock Beetle",
  rarity: "common",
  description: "A sturdy insect with a hard shell that protects mountain caves.",
  baseStats: {
    attack: 20,
    defense: 35,
    speed: 15,
    health: 110,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.4,
    speed: 0.9,
    health: 1.2,
    energy: 1.0,
  },
  sprite: "rock-beetle.png",
  icon: "rock-beetle-icon.png",
};
