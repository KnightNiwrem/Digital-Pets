import type { PetSpecies } from "@/types/Pet";

export const CORAL_TURTLE: PetSpecies = {
  id: "coral_turtle",
  name: "Coral Turtle",
  rarity: "uncommon",
  description: "An ancient turtle with a shell covered in living coral.",
  baseStats: {
    attack: 25,
    defense: 50,
    speed: 20,
    health: 140,
  },
  growthRates: {
    attack: 1.15,
    defense: 1.5,
    speed: 1.0,
    health: 1.35,
    energy: 1.15,
  },
  sprite: "coral-turtle.png",
  icon: "coral-turtle-icon.png",
};
