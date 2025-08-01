import type { ConsumableItem } from "@/types/Item";

export const STRONG_MEDICINE: ConsumableItem = {
  id: "strong_medicine",
  name: "Strong Medicine",
  description: "Powerful medicine that can cure serious illnesses.",
  type: "medicine",
  rarity: "uncommon",
  icon: "item_strong_medicine",
  effects: [
    { type: "health", value: 2 },
    { type: "cure", value: 2 },
  ],
  value: 45,
  stackable: true,
};
