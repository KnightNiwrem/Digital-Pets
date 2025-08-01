import type { PetSpecies } from "@/types/Pet";

export const STAR_MONITOR: PetSpecies = {
  id: "star_monitor",
  name: "Star Monitor",
  rarity: "epic",
  description:
    "A large reptilian creature with dark scales patterned like a night sky, dwelling in high mountain peaks.",
  baseStats: {
    attack: 70,
    defense: 55,
    speed: 60,
    health: 220,
  },
  growthRates: {
    attack: 1.6,
    defense: 1.45,
    speed: 1.5,
    health: 1.5,
    energy: 1.4,
  },
  sprite: "star-monitor.png",
  icon: "star-monitor-icon.png",
};
