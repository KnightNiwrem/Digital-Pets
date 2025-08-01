import type { PetSpecies } from "@/types/Pet";

export const GIANT_MONITOR: PetSpecies = {
  id: "giant_monitor",
  name: "Giant Monitor",
  rarity: "legendary",
  description:
    "An enormous reptilian creature with ancient scarred hide and tremendous size, believed to be centuries old.",
  baseStats: {
    attack: 90,
    defense: 70,
    speed: 80,
    health: 280,
  },
  growthRates: {
    attack: 1.8,
    defense: 1.6,
    speed: 1.7,
    health: 1.7,
    energy: 1.8,
  },
  sprite: "giant-monitor.png",
  icon: "giant-monitor-icon.png",
};
