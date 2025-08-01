import type { ConsumableItem } from "@/types/Item";

export const ANCIENT_KEY: ConsumableItem = {
  id: "ancient_key",
  name: "Ancient Key",
  description: "A crystalline key that unlocks the deepest chambers of ancient ruins.",
  type: "special",
  rarity: "epic",
  icon: "item_ancient_key",
  effects: [{ type: "energy", value: 50 }],
  value: 300,
  stackable: true,
};
