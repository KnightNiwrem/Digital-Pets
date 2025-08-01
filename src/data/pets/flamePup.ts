import type { PetSpecies } from "@/types/Pet";

export const FLAME_PUP: PetSpecies = {
  id: "flame_pup",
  name: "Flame Pup",
  rarity: "common",
  description:
    "A warm-hearted canine with bright reddish-orange fur that thrives in hot climates. One of the three starter pets.",
  baseStats: {
    attack: 30,
    defense: 15,
    speed: 30,
    health: 95,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.0,
    speed: 1.2,
    health: 1.15,
    energy: 1.1,
  },
  sprite: "flame-pup.png",
  icon: "flame-pup-icon.png",
};
