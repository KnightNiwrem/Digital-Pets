import type { PetSpecies } from "@/types/Pet";

export const GLASS_CAT: PetSpecies = {
  id: "glass_cat",
  name: "Glass Cat",
  rarity: "uncommon",
  description: "A feline with translucent fur that has a unique refractive quality, creating beautiful light patterns.",
  baseStats: {
    attack: 32,
    defense: 35,
    speed: 42,
    health: 115,
  },
  growthRates: {
    attack: 1.25,
    defense: 1.3,
    speed: 1.35,
    health: 1.2,
    energy: 1.15,
  },
  sprite: "glass-cat.png",
  icon: "glass-cat-icon.png",
};
