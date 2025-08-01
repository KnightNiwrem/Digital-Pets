import type { ConsumableItem } from "@/types/Item";

export const IRON_ORE: ConsumableItem = {
  id: "iron_ore",
  name: "Iron Ore",
  description: "Raw iron ore found in mountain mines. Valuable for crafting equipment.",
  type: "material",
  rarity: "common",
  icon: "item_iron_ore",
  effects: [{ type: "crafting_material", value: 1 }],
  value: 25,
  stackable: true,
};
