import type { ConsumableItem } from "@/types/Item";

export const RARE_FISH: ConsumableItem = {
  id: "rare_fish",
  name: "Golden Fish",
  description: "A rare, golden fish that provides exceptional nutrition and energy.",
  type: "consumable",
  rarity: "rare",
  icon: "item_rare_fish",
  effects: [
    { type: "satiety", value: 50 },
    { type: "energy", value: 20 },
  ],
  value: 50,
  stackable: true,
};
