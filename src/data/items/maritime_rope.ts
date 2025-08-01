import type { ConsumableItem } from "@/types/Item";

export const MARITIME_ROPE: ConsumableItem = {
  id: "maritime_rope",
  name: "Maritime Rope",
  description: "Strong rope used in ship operations, useful for various activities.",
  type: "special",
  rarity: "common",
  icon: "item_rope",
  effects: [{ type: "exploration_bonus", value: 5 }],
  value: 20,
  stackable: true,
};
