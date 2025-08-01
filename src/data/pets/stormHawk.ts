import type { PetSpecies } from "@/types/Pet";

export const STORM_HAWK: PetSpecies = {
  id: "storm_hawk",
  name: "Storm Hawk",
  rarity: "uncommon",
  description: "A majestic bird that soars through thunderstorms.",
  baseStats: {
    attack: 40,
    defense: 25,
    speed: 50,
    health: 105,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.15,
    speed: 1.45,
    health: 1.15,
    energy: 1.2,
  },
  sprite: "storm-hawk.png",
  icon: "storm-hawk-icon.png",
};
