import type { PetSpecies } from "@/types/Pet";

export const FIREFLY_DEER: PetSpecies = {
  id: "firefly_deer",
  name: "Firefly Deer",
  rarity: "uncommon",
  description: "An elegant deer with white antlers that have bioluminescent properties, creating a soft glow at night.",
  baseStats: {
    attack: 30,
    defense: 32,
    speed: 45,
    health: 120,
  },
  growthRates: {
    attack: 1.2,
    defense: 1.25,
    speed: 1.4,
    health: 1.25,
    energy: 1.3,
  },
  sprite: "firefly-deer.png",
  icon: "firefly-deer-icon.png",
};
