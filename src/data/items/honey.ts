import type { ConsumableItem } from "@/types/Item";

export const HONEY: ConsumableItem = {
  id: "honey",
  name: "Golden Honey",
  description: "Sweet honey that provides energy and happiness to pets.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_honey",
  effects: [
    { type: "satiety", value: 20 },
    { type: "happiness", value: 15 },
    { type: "energy", value: 10 },
  ],
  value: 18,
  stackable: true,
};
