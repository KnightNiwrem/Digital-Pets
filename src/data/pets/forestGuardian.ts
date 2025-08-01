import type { PetSpecies } from "@/types/Pet";

export const FOREST_GUARDIAN: PetSpecies = {
  id: "forest_guardian",
  name: "Forest Guardian",
  rarity: "uncommon",
  description: "A large, protective bear-like creature with moss-green fur that serves as a forest caretaker.",
  baseStats: {
    attack: 35,
    defense: 40,
    speed: 25,
    health: 120,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.4,
    speed: 1.2,
    health: 1.25,
    energy: 1.2,
  },
  sprite: "guardian.png",
  icon: "guardian-icon.png",
};
