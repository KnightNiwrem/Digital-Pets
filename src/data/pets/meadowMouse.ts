import type { PetSpecies } from "@/types/Pet";

export const MEADOW_MOUSE: PetSpecies = {
  id: "meadow_mouse",
  name: "Meadow Mouse",
  rarity: "common",
  description: "A small, quick rodent that scurries through grasslands.",
  baseStats: {
    attack: 15,
    defense: 10,
    speed: 45,
    health: 80,
  },
  growthRates: {
    attack: 1.0,
    defense: 0.9,
    speed: 1.5,
    health: 1.0,
    energy: 1.0,
  },
  sprite: "meadow-mouse.png",
  icon: "meadow-mouse-icon.png",
};
