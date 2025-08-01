import type { ConsumableItem } from "@/types/Item";

export const EXOTIC_SPICE: ConsumableItem = {
  id: "exotic_spice",
  name: "Exotic Spice",
  description: "Rare spices from distant lands that enhance the flavor of any meal.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_exotic_spice",
  effects: [
    { type: "satiety", value: 15 },
    { type: "happiness", value: 30 },
  ],
  value: 45,
  stackable: true,
};
