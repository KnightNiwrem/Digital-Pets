import type { PetSpecies } from "@/types/Pet";

export const BLUE_SALAMANDER: PetSpecies = {
  id: "blue_salamander",
  name: "Blue Salamander",
  rarity: "common",
  description:
    "A small amphibious creature with bright blue skin that loves to swim in streams. One of the three starter pets.",
  baseStats: {
    attack: 20,
    defense: 25,
    speed: 35,
    health: 90,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.2,
    speed: 1.4,
    health: 1.1,
    energy: 1.1,
  },
  sprite: "blue-salamander.png",
  icon: "blue-salamander-icon.png",
};
