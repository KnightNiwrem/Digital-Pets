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
