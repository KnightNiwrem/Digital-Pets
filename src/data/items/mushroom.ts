import type { ConsumableItem } from "@/types/Item";

export const MUSHROOM: ConsumableItem = {
  id: "mushroom",
  name: "Forest Mushroom",
  description: "A nutritious mushroom found in deep forests.",
  type: "consumable",
  rarity: "common",
  icon: "item_mushroom",
  effects: [
    { type: "satiety", value: 18 },
    { type: "happiness", value: 8 },
  ],
  value: 12,
  stackable: true,
};
