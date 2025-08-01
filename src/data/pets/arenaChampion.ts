import type { PetSpecies } from "@/types/Pet";

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
