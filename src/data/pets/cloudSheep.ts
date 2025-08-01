import type { PetSpecies } from "@/types/Pet";

export const CLOUD_SHEEP: PetSpecies = {
  id: "cloud_sheep",
  name: "Cloud Sheep",
  rarity: "common",
  description:
    "A fluffy white sheep with incredibly thick wool that helps predict weather changes through static buildup.",
  baseStats: {
    attack: 22,
    defense: 30,
    speed: 25,
    health: 100,
  },
  growthRates: {
    attack: 1.1,
    defense: 1.3,
    speed: 1.1,
    health: 1.15,
    energy: 1.1,
  },
  sprite: "cloud-sheep.png",
  icon: "cloud-sheep-icon.png",
};
