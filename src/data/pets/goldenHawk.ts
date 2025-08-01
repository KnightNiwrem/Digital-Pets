import type { PetSpecies } from "@/types/Pet";

export const GOLDEN_HAWK: PetSpecies = {
  id: "golden_hawk",
  name: "Golden Hawk",
  rarity: "epic",
  description: "A mature bird of prey with brilliant golden and crimson plumage that shimmers with incredible beauty.",
  baseStats: {
    attack: 68,
    defense: 45,
    speed: 65,
    health: 210,
  },
  growthRates: {
    attack: 1.6,
    defense: 1.35,
    speed: 1.55,
    health: 1.5,
    energy: 1.6,
  },
  sprite: "golden-hawk.png",
  icon: "golden-hawk-icon.png",
};
