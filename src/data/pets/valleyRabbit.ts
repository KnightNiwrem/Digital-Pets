import type { PetSpecies } from "@/types/Pet";

export const VALLEY_RABBIT: PetSpecies = {
  id: "valley_rabbit",
  name: "Valley Rabbit",
  rarity: "common",
  description: "A quick and nimble rabbit that loves to hop through meadows.",
  baseStats: {
    attack: 18,
    defense: 15,
    speed: 40,
    health: 85,
  },
  growthRates: {
    attack: 1.0,
    defense: 1.0,
    speed: 1.4,
    health: 1.0,
    energy: 1.1,
  },
  sprite: "valley-rabbit.png",
  icon: "valley-rabbit-icon.png",
};
