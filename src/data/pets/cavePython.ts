import type { PetSpecies } from "@/types/Pet";

export const CAVE_PYTHON: PetSpecies = {
  id: "cave_python",
  name: "Cave Python",
  rarity: "rare",
  description: "A mysterious deep-cave serpent with dark scales and bioluminescent markings along its spine.",
  baseStats: {
    attack: 52,
    defense: 45,
    speed: 48,
    health: 155,
  },
  growthRates: {
    attack: 1.5,
    defense: 1.35,
    speed: 1.4,
    health: 1.3,
    energy: 1.35,
  },
  sprite: "cave-python.png",
  icon: "cave-python-icon.png",
};
