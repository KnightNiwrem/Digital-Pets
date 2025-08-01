import type { DurabilityItem } from "@/types/Item";

export const EXPLORATION_PACK: DurabilityItem = {
  id: "exploration_pack",
  name: "Explorer's Pack",
  description: "A sturdy pack that helps pets carry more items while exploring.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_exploration_pack",
  effects: [{ type: "exploration_bonus", value: 25 }],
  value: 65,
  stackable: false,
  maxDurability: 20,
  currentDurability: 20,
  durabilityLossPerUse: 1,
};
