import type { ConsumableItem } from "@/types/Item";

export const PEARL: ConsumableItem = {
  id: "pearl",
  name: "Ocean Pearl",
  description: "A lustrous pearl from the deep ocean, said to bring good fortune.",
  type: "special",
  rarity: "epic",
  icon: "item_pearl",
  effects: [
    { type: "happiness", value: 60 },
    { type: "luck_bonus", value: 10 },
  ],
  value: 200,
  stackable: true,
};
