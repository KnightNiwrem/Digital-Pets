import type { PetSpecies } from "@/types/Pet";

export const WIND_WISP: PetSpecies = {
  id: "wind_wisp",
  name: "Wind Wisp",
  rarity: "common",
  description: "A lightweight bird-like creature with downy feathers that glides gracefully on air currents.",
  baseStats: {
    attack: 25,
    defense: 15,
    speed: 40,
    health: 85,
  },
  growthRates: {
    attack: 1.2,
    defense: 1.0,
    speed: 1.4,
    health: 1.0,
    energy: 1.2,
  },
  sprite: "wind-wisp.png",
  icon: "wind-wisp-icon.png",
};
