import type { PetSpecies } from "@/types/Pet";

export const ANCIENT_TURTLE: PetSpecies = {
  id: "ancient_turtle",
  name: "Ancient Turtle",
  rarity: "legendary",
  description:
    "A magnificent creature resembling an ancient tree with living bark and moss, representing the pinnacle of forest wisdom.",
  baseStats: {
    attack: 80,
    defense: 90,
    speed: 70,
    health: 300,
  },
  growthRates: {
    attack: 1.7,
    defense: 1.8,
    speed: 1.6,
    health: 1.8,
    energy: 1.7,
  },
  sprite: "ancient-turtle.png",
  icon: "ancient-turtle-icon.png",
};
