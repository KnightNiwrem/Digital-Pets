import type { ConsumableItem } from "@/types/Item";

export const BERRY: ConsumableItem = {
  id: "berry",
  name: "Forest Berry",
  description: "A sweet berry found in the forest. Provides nutrition and a bit of happiness.",
  type: "consumable",
  rarity: "common",
  icon: "item_berry",
  effects: [
    { type: "satiety", value: 15 },
    { type: "happiness", value: 10 },
  ],
  value: 8,
  stackable: true,
};
