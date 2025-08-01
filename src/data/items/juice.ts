import type { ConsumableItem } from "@/types/Item";

export const JUICE: ConsumableItem = {
  id: "juice",
  name: "Fruit Juice",
  description: "Refreshing fruit juice that hydrates and energizes.",
  type: "consumable",
  rarity: "common",
  icon: "item_juice",
  effects: [
    { type: "hydration", value: 25 },
    { type: "happiness", value: 10 },
  ],
  value: 12,
  stackable: true,
};
