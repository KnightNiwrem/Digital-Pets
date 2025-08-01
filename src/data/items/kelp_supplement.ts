import type { ConsumableItem } from "@/types/Item";

export const KELP_SUPPLEMENT: ConsumableItem = {
  id: "kelp_supplement",
  name: "Kelp Supplement",
  description: "Nutritious kelp supplement rich in vitamins and minerals from the sea.",
  type: "medicine",
  rarity: "uncommon",
  icon: "item_kelp_supplement",
  effects: [
    { type: "health", value: 30 },
    { type: "hydration", value: 25 },
  ],
  value: 35,
  stackable: true,
};
