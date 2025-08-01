import type { ConsumableItem } from "@/types/Item";

export const HERBAL_TEA: ConsumableItem = {
  id: "herbal_tea",
  name: "Herbal Tea",
  description: "A soothing herbal tea that provides gentle hydration and relaxation.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_herbal_tea",
  effects: [
    { type: "hydration", value: 32 },
    { type: "happiness", value: 12 },
  ],
  value: 16,
  stackable: true,
};
