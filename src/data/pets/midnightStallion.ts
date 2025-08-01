import type { PetSpecies } from "@/types/Pet";

export const MIDNIGHT_STALLION: PetSpecies = {
  id: "midnight_stallion",
  name: "Midnight Stallion",
  rarity: "epic",
  description: "A powerful dark horse with a jet-black coat and remarkable speed, known for its wild temperament.",
  baseStats: {
    attack: 65,
    defense: 50,
    speed: 75,
    health: 200,
  },
  growthRates: {
    attack: 1.55,
    defense: 1.4,
    speed: 1.7,
    health: 1.45,
    energy: 1.5,
  },
  sprite: "midnight-stallion.png",
  icon: "midnight-stallion-icon.png",
};
