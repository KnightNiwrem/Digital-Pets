import type { ConsumableItem } from "@/types/Item";

export const MEAT: ConsumableItem = {
  id: "meat",
  name: "Fresh Meat",
  description: "High-quality meat that provides substantial nutrition.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_meat",
  effects: [{ type: "satiety", value: 45 }],
  value: 25,
  stackable: true,
};
