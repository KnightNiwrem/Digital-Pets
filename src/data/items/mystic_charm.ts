import type { DurabilityItem } from "@/types/Item";

export const MYSTIC_CHARM: DurabilityItem = {
  id: "mystic_charm",
  name: "Mystic Charm",
  description: "A mystical amulet that provides ongoing benefits to its bearer.",
  type: "equipment",
  rarity: "epic",
  icon: "item_mystic_charm",
  effects: [{ type: "happiness_boost", value: 15 }],
  value: 300,
  stackable: false,
  maxDurability: 50,
  currentDurability: 50,
  durabilityLossPerUse: 1,
};
