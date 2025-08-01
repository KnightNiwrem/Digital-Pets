import type { ConsumableItem } from "@/types/Item";

export const HERB: ConsumableItem = {
  id: "herb",
  name: "Healing Herb",
  description: "A natural herb with medicinal properties. Restores some health.",
  type: "medicine",
  rarity: "common",
  icon: "item_herb",
  effects: [{ type: "health", value: 1 }],
  value: 15,
  stackable: true,
};
