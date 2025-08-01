import type { PetSpecies } from "@/types/Pet";

export const POND_FROG: PetSpecies = {
  id: "pond_frog",
  name: "Pond Frog",
  rarity: "common",
  description: "A cheerful amphibian that loves lily pads and catching flies.",
  baseStats: {
    attack: 20,
    defense: 20,
    speed: 35,
    health: 90,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.1,
    speed: 1.3,
    health: 1.1,
    energy: 1.1,
  },
  sprite: "pond-frog.png",
  icon: "pond-frog-icon.png",
};
