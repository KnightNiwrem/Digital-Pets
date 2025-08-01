import type { ConsumableItem } from "@/types/Item";

export const SILVER_ORE: ConsumableItem = {
  id: "silver_ore",
  name: "Silver Ore",
  description: "Precious silver ore with a lustrous shine. Highly valued by traders.",
  type: "material",
  rarity: "uncommon",
  icon: "item_silver_ore",
  effects: [{ type: "crafting_material", value: 2 }],
  value: 45,
  stackable: true,
};
