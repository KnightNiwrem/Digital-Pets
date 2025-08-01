import type { DurabilityItem } from "@/types/Item";

export const MUSIC_BOX: DurabilityItem = {
  id: "music_box",
  name: "Music Box",
  description: "An elegant music box that plays soothing melodies.",
  type: "toy",
  rarity: "rare",
  icon: "item_music_box",
  effects: [
    { type: "happiness", value: 35 },
    { type: "energy", value: 10 }, // relaxing music restores energy
  ],
  value: 80,
  stackable: false,
  maxDurability: 20,
  currentDurability: 20,
  durabilityLossPerUse: 1,
};
