import type { PetSpecies } from "@/types/Pet";

export const FIRE_FINCH: PetSpecies = {
  id: "fire_finch",
  name: "Fire Finch",
  rarity: "rare",
  description: "A young bird with brilliant red and orange plumage that resembles flickering flames in sunlight.",
  baseStats: {
    attack: 48,
    defense: 35,
    speed: 50,
    health: 145,
  },
  growthRates: {
    attack: 1.45,
    defense: 1.25,
    speed: 1.45,
    health: 1.3,
    energy: 1.4,
  },
  sprite: "fire-finch.png",
  icon: "fire-finch-icon.png",
};
