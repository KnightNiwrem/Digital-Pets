import type { ConsumableItem } from "@/types/Item";

export const CRYSTAL_FRAGMENT: ConsumableItem = {
  id: "crystal_fragment",
  name: "Crystal Fragment",
  description: "A rare crystal fragment with mysterious properties.",
  type: "special",
  rarity: "epic",
  icon: "item_crystal_fragment",
  effects: [
    { type: "energy", value: 50 },
    { type: "happiness", value: 25 },
    { type: "health", value: 1 },
  ],
  value: 200,
  stackable: true,
};
