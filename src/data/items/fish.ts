import type { ConsumableItem } from "@/types/Item";

export const FISH: ConsumableItem = {
  id: "fish",
  name: "Fresh Fish",
  description: "A tasty fish caught from the river. Very nutritious!",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_fish",
  effects: [{ type: "satiety", value: 40 }],
  value: 20,
  stackable: true,
};
