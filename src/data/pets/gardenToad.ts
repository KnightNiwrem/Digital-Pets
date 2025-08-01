import type { PetSpecies } from "@/types/Pet";

export const GARDEN_TOAD: PetSpecies = {
  id: "garden_toad",
  name: "Garden Toad",
  rarity: "common",
  description: "A friendly amphibian that helps tend to plants and flowers.",
  baseStats: {
    attack: 18,
    defense: 28,
    speed: 20,
    health: 105,
  },
  growthRates: {
    attack: 1.0,
    defense: 1.3,
    speed: 1.0,
    health: 1.2,
    energy: 1.1,
  },
  sprite: "garden-toad.png",
  icon: "garden-toad-icon.png",
};
