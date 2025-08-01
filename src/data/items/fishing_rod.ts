import type { DurabilityItem } from "@/types/Item";

export const FISHING_ROD: DurabilityItem = {
  id: "fishing_rod",
  name: "Fishing Rod",
  description: "A sturdy fishing rod required for fishing activities.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_fishing_rod",
  effects: [], // enables fishing rather than direct stat effects
  value: 100,
  stackable: false,
  maxDurability: 50,
  currentDurability: 50,
  durabilityLossPerUse: 1,
};
