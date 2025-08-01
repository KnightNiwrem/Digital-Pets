import type { PetSpecies } from "@/types/Pet";

export const EMBER_WOLF: PetSpecies = {
  id: "ember_wolf",
  name: "Ember Wolf",
  rarity: "uncommon",
  description: "A fierce canine with glowing red fur and fiery determination.",
  baseStats: {
    attack: 38,
    defense: 30,
    speed: 38,
    health: 125,
  },
  growthRates: {
    attack: 1.35,
    defense: 1.2,
    speed: 1.3,
    health: 1.25,
    energy: 1.2,
  },
  sprite: "ember-wolf.png",
  icon: "ember-wolf-icon.png",
};
