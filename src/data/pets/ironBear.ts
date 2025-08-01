import type { PetSpecies } from "@/types/Pet";

export const IRON_BEAR: PetSpecies = {
  id: "iron_bear",
  name: "Iron Bear",
  rarity: "uncommon",
  description: "A powerful bear with dark grey fur and incredible strength, known for its resilient constitution.",
  baseStats: {
    attack: 42,
    defense: 45,
    speed: 25,
    health: 135,
  },
  growthRates: {
    attack: 1.4,
    defense: 1.4,
    speed: 1.1,
    health: 1.3,
    energy: 1.2,
  },
  sprite: "iron-bear.png",
  icon: "iron-bear-icon.png",
};
