import type { ConsumableItem } from "@/types/Item";

export const SHAMPOO: ConsumableItem = {
  id: "shampoo",
  name: "Pet Shampoo",
  description: "Special shampoo that cleans and freshens your pet.",
  type: "hygiene",
  rarity: "common",
  icon: "item_shampoo",
  effects: [
    { type: "clean", value: 2 },
    { type: "happiness", value: 8 },
  ],
  value: 15,
  stackable: true,
};
