import type { PetSpecies } from "@/types/Pet";

export const APEX_PANTHER: PetSpecies = {
  id: "apex_panther",
  name: "Apex Panther",
  rarity: "legendary",
  description:
    "A legendary creature of unmatched power and perfect balance, representing the ultimate achievement in pet companionship.",
  baseStats: {
    attack: 75,
    defense: 75,
    speed: 75,
    health: 275,
  },
  growthRates: {
    attack: 1.9,
    defense: 1.9,
    speed: 1.9,
    health: 2.0,
    energy: 1.9,
  },
  sprite: "apex-panther.png",
  icon: "apex-panther-icon.png",
};
