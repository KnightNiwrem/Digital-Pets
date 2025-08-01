import type { PetSpecies } from "@/types/Pet";

export const GROVE_BEAR: PetSpecies = {
  id: "grove_bear",
  name: "Grove Bear",
  rarity: "epic",
  description: "An ancient, wise creature with pale markings that has protected sacred groves for centuries.",
  baseStats: {
    attack: 60,
    defense: 70,
    speed: 50,
    health: 240,
  },
  growthRates: {
    attack: 1.5,
    defense: 1.6,
    speed: 1.4,
    health: 1.55,
    energy: 1.45,
  },
  sprite: "grove-bear.png",
  icon: "grove-bear-icon.png",
};
