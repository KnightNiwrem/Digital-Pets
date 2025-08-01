import type { DurabilityItem } from "@/types/Item";

export const BALL: DurabilityItem = {
  id: "ball",
  name: "Bouncy Ball",
  description: "A fun rubber ball that pets love to play with. Increases happiness.",
  type: "toy",
  rarity: "common",
  icon: "item_ball",
  effects: [{ type: "happiness", value: 30 }],
  value: 25,
  stackable: false,
  maxDurability: 20,
  currentDurability: 20,
  durabilityLossPerUse: 1,
};
