import type { ConsumableItem } from "@/types/Item";

export const GROWTH_SEED: ConsumableItem = {
  id: "growth_seed",
  name: "Growth Seed",
  description: "A rare seed with special nutrients that accelerates pet growth and development.",
  type: "special",
  rarity: "epic",
  icon: "item_growth_seed",
  effects: [{ type: "growth_bonus", value: 1 }],
  value: 150,
  stackable: true,
};
