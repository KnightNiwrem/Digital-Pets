import type { ConsumableItem } from "@/types/Item";

export const WATER_BOTTLE: ConsumableItem = {
  id: "water_bottle",
  name: "Water Bottle",
  description: "Clean, refreshing water to keep your pet hydrated.",
  type: "consumable",
  rarity: "common",
  icon: "item_water",
  effects: [{ type: "hydration", value: 30 }],
  value: 8,
  stackable: true,
};
