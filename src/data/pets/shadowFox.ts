import type { PetSpecies } from "@/types/Pet";

export const SHADOW_FOX: PetSpecies = {
  id: "shadow_fox",
  name: "Shadow Fox",
  rarity: "uncommon",
  description: "A dark-furred fox with exceptional camouflage abilities and silent movement through dense undergrowth.",
  baseStats: {
    attack: 35,
    defense: 28,
    speed: 48,
    health: 110,
  },
  growthRates: {
    attack: 1.3,
    defense: 1.2,
    speed: 1.4,
    health: 1.2,
    energy: 1.25,
  },
  sprite: "shadow-fox.png",
  icon: "shadow-fox-icon.png",
};
