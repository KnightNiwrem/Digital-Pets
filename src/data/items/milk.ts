import type { ConsumableItem } from "@/types/Item";

export const MILK: ConsumableItem = {
  id: "milk",
  name: "Fresh Milk",
  description: "Nutritious milk that provides hydration and some satiety.",
  type: "consumable",
  rarity: "common",
  icon: "item_milk",
  effects: [
    { type: "hydration", value: 28 },
    { type: "satiety", value: 12 },
  ],
  value: 10,
  stackable: true,
};
