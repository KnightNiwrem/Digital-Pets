import type { PetSpecies } from "@/types/Pet";

export const STAR_WHALE: PetSpecies = {
  id: "star_whale",
  name: "Star Whale",
  rarity: "rare",
  description:
    "A gentle giant whale with star-like white spots across its dark blue skin, found in the deepest ocean trenches.",
  baseStats: {
    attack: 40,
    defense: 65,
    speed: 35,
    health: 200,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.6,
    speed: 1.25,
    health: 1.5,
    energy: 1.3,
  },
  sprite: "star-whale.png",
  icon: "star-whale-icon.png",
};
