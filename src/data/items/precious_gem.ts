import type { ConsumableItem } from "@/types/Item";

export const PRECIOUS_GEM: ConsumableItem = {
  id: "precious_gem",
  name: "Precious Gem",
  description: "A beautiful, multi-faceted gem that sparkles in the light.",
  type: "material",
  rarity: "epic",
  icon: "item_precious_gem",
  effects: [
    { type: "crafting_material", value: 5 },
    { type: "happiness", value: 15 }, // pets love shiny things
  ],
  value: 120,
  stackable: true,
};
