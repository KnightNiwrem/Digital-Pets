import type { ConsumableItem } from "@/types/Item";

export const BASIC_MEDICINE: ConsumableItem = {
  id: "basic_medicine",
  name: "Basic Medicine",
  description: "A simple remedy that can cure minor illnesses and injuries.",
  type: "medicine",
  rarity: "common",
  icon: "item_medicine",
  effects: [
    { type: "health", value: 1 }, // heals one health level
    { type: "cure", value: 1 },
  ],
  value: 25,
  stackable: true,
};
