import type { DurabilityItem } from "@/types/Item";

export const PICKAXE: DurabilityItem = {
  id: "pickaxe",
  name: "Mining Pickaxe",
  description: "A sturdy pickaxe essential for mining operations in the mountains.",
  type: "equipment",
  rarity: "common",
  icon: "item_pickaxe",
  effects: [{ type: "mining_bonus", value: 20 }],
  value: 75,
  stackable: false,
  maxDurability: 25,
  currentDurability: 25,
  durabilityLossPerUse: 1,
};
