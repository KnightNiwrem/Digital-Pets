import type { ConsumableItem } from "@/types/Item";

export const WISDOM_SCROLL: ConsumableItem = {
  id: "wisdom_scroll",
  name: "Wisdom Scroll",
  description: "An ancient scroll containing profound knowledge that enhances understanding.",
  type: "special",
  rarity: "rare",
  icon: "item_wisdom_scroll",
  effects: [
    { type: "experience_bonus", value: 25 },
    { type: "happiness", value: 30 },
  ],
  value: 120,
  stackable: true,
};
