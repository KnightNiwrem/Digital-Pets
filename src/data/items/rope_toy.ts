import type { DurabilityItem } from "@/types/Item";

export const ROPE_TOY: DurabilityItem = {
  id: "rope_toy",
  name: "Rope Toy",
  description: "A durable rope toy perfect for tugging and chewing.",
  type: "toy",
  rarity: "common",
  icon: "item_rope_toy",
  effects: [{ type: "happiness", value: 18 }],
  value: 15,
  stackable: false,
  maxDurability: 15,
  currentDurability: 15,
  durabilityLossPerUse: 1,
};
