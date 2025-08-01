import type { ConsumableItem } from "@/types/Item";

export const ANTIDOTE: ConsumableItem = {
  id: "antidote",
  name: "Universal Antidote",
  description: "Cures any poison or disease affecting your pet.",
  type: "medicine",
  rarity: "rare",
  icon: "item_antidote",
  effects: [
    { type: "cure", value: 3 },
    { type: "health", value: 1 },
  ],
  value: 75,
  stackable: true,
};
