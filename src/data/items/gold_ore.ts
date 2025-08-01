import type { ConsumableItem } from "@/types/Item";

export const GOLD_ORE: ConsumableItem = {
  id: "gold_ore",
  name: "Gold Ore",
  description: "Rare and valuable gold ore. The dream of every miner.",
  type: "material",
  rarity: "rare",
  icon: "item_gold_ore",
  effects: [{ type: "crafting_material", value: 3 }],
  value: 80,
  stackable: true,
};
