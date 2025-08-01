import type { ConsumableItem } from "@/types/Item";

export const EXOTIC_FISH: ConsumableItem = {
  id: "exotic_fish",
  name: "Exotic Fish",
  description: "A rare deep-sea fish with vibrant colors and exceptional nutritional value.",
  type: "consumable",
  rarity: "rare",
  icon: "item_exotic_fish",
  effects: [
    { type: "satiety", value: 70 },
    { type: "happiness", value: 40 },
  ],
  value: 85,
  stackable: true,
};
