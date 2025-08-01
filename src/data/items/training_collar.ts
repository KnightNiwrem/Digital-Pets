import type { DurabilityItem } from "@/types/Item";

export const TRAINING_COLLAR: DurabilityItem = {
  id: "training_collar",
  name: "Training Collar",
  description: "Special collar that helps pets focus during training.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_training_collar",
  effects: [{ type: "training_bonus", value: 15 }],
  value: 50,
  stackable: false,
  maxDurability: 25,
  currentDurability: 25,
  durabilityLossPerUse: 1,
};
