import type { ConsumableItem } from "@/types/Item";

export const ENERGY_CRYSTAL: ConsumableItem = {
  id: "energy_crystal",
  name: "Energy Crystal",
  description: "A crystal that radiates pure energy, perfect for restoring vitality.",
  type: "special",
  rarity: "rare",
  icon: "item_energy_crystal",
  effects: [{ type: "energy", value: 100 }],
  value: 150,
  stackable: true,
};
