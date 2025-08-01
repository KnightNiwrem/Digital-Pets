import type { PetSpecies } from "@/types/Pet";

export const THUNDER_LION: PetSpecies = {
  id: "thunder_lion",
  name: "Thunder Lion",
  rarity: "rare",
  description: "A majestic lion with a deep, booming roar that can be heard for miles across the savanna.",
  baseStats: {
    attack: 55,
    defense: 40,
    speed: 45,
    health: 160,
  },
  growthRates: {
    attack: 1.5,
    defense: 1.3,
    speed: 1.4,
    health: 1.35,
    energy: 1.3,
  },
  sprite: "thunder-lion.png",
  icon: "thunder-lion-icon.png",
};
