import type { ConsumableItem } from "@/types/Item";

export const PERFUME: ConsumableItem = {
  id: "perfume",
  name: "Floral Perfume",
  description: "Lovely perfume that makes your pet smell wonderful.",
  type: "hygiene",
  rarity: "uncommon",
  icon: "item_perfume",
  effects: [
    { type: "clean", value: 1 },
    { type: "happiness", value: 20 },
  ],
  value: 30,
  stackable: true,
};
