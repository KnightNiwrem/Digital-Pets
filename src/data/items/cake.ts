import type { ConsumableItem } from "@/types/Item";

export const CAKE: ConsumableItem = {
  id: "cake",
  name: "Birthday Cake",
  description: "A special celebratory cake that brings great joy.",
  type: "consumable",
  rarity: "rare",
  icon: "item_cake",
  effects: [
    { type: "satiety", value: 35 },
    { type: "happiness", value: 40 },
  ],
  value: 40,
  stackable: true,
};
