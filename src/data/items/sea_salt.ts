import type { ConsumableItem } from "@/types/Item";

export const SEA_SALT: ConsumableItem = {
  id: "sea_salt",
  name: "Sea Salt",
  description: "Pure sea salt harvested from coastal waters, perfect for food preparation.",
  type: "special",
  rarity: "common",
  icon: "item_sea_salt",
  effects: [{ type: "satiety", value: 10 }],
  value: 15,
  stackable: true,
};
