import type { ConsumableItem } from "@/types/Item";

export const APPLE: ConsumableItem = {
  id: "apple",
  name: "Fresh Apple",
  description: "A crisp, red apple that pets love. Restores some satiety.",
  type: "consumable",
  rarity: "common",
  icon: "item_apple",
  effects: [{ type: "satiety", value: 25 }],
  value: 10,
  stackable: true,
};
