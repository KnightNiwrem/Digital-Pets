import type { DurabilityItem } from "@/types/Item";

export const FEATHER_TOY: DurabilityItem = {
  id: "feather_toy",
  name: "Feather Wand",
  description: "A fun feather toy that pets love to chase and play with.",
  type: "toy",
  rarity: "common",
  icon: "item_feather_toy",
  effects: [{ type: "happiness", value: 20 }],
  value: 20,
  stackable: false,
  maxDurability: 8,
  currentDurability: 8,
  durabilityLossPerUse: 1,
};
