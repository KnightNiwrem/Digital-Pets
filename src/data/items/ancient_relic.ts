import type { ConsumableItem } from "@/types/Item";

export const ANCIENT_RELIC: ConsumableItem = {
  id: "ancient_relic",
  name: "Ancient Relic",
  description: "A mysterious artifact from an ancient civilization.",
  type: "special",
  rarity: "legendary",
  icon: "item_ancient_relic",
  effects: [
    { type: "satiety", value: 100 },
    { type: "hydration", value: 100 },
    { type: "happiness", value: 100 },
    { type: "energy", value: 100 },
  ],
  value: 500,
  stackable: true,
};
