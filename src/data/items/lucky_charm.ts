import type { DurabilityItem } from "@/types/Item";

export const LUCKY_CHARM: DurabilityItem = {
  id: "lucky_charm",
  name: "Lucky Charm",
  description: "A special charm that brings good fortune to your pet.",
  type: "equipment",
  rarity: "rare",
  icon: "item_lucky_charm",
  effects: [{ type: "luck_bonus", value: 20 }],
  value: 100,
  stackable: false,
  maxDurability: 30,
  currentDurability: 30,
  durabilityLossPerUse: 1,
};
