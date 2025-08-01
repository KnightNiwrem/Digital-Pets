import type { ConsumableItem } from "@/types/Item";

export const BAIT: ConsumableItem = {
  id: "bait",
  name: "Fishing Bait",
  description: "Worms and insects that make fishing more successful.",
  type: "consumable",
  rarity: "common",
  icon: "item_bait",
  effects: [{ type: "fishing_bonus", value: 10 }], // used during fishing for better success rates
  value: 5,
  stackable: true,
};
