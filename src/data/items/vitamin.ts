import type { ConsumableItem } from "@/types/Item";

export const VITAMIN: ConsumableItem = {
  id: "vitamin",
  name: "Health Vitamin",
  description: "Daily vitamin that boosts health and energy.",
  type: "medicine",
  rarity: "common",
  icon: "item_vitamin",
  effects: [
    { type: "health", value: 1 },
    { type: "energy", value: 15 },
  ],
  value: 20,
  stackable: true,
};
