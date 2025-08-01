import type { DurabilityItem } from "@/types/Item";

export const SHIP_TOOLS: DurabilityItem = {
  id: "ship_tools",
  name: "Ship Maintenance Tools",
  description: "A set of specialized tools for ship repair and maintenance work.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_ship_tools",
  effects: [{ type: "training_bonus", value: 15 }],
  value: 60,
  stackable: false,
  maxDurability: 80,
  currentDurability: 80,
  durabilityLossPerUse: 3,
};
