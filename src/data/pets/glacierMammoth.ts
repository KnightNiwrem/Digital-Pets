import type { PetSpecies } from "@/types/Pet";

export const GLACIER_MAMMOTH: PetSpecies = {
  id: "glacier_mammoth",
  name: "Glacier Mammoth",
  rarity: "rare",
  description:
    "An ancient mammoth species with incredibly thick fur and massive curved tusks, adapted to extreme cold.",
  baseStats: {
    attack: 50,
    defense: 60,
    speed: 25,
    health: 180,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.6,
    speed: 1.1,
    health: 1.4,
    energy: 1.25,
  },
  sprite: "glacier-mammoth.png",
  icon: "glacier-mammoth-icon.png",
};
