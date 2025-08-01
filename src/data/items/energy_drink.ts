import type { ConsumableItem } from "@/types/Item";

export const ENERGY_DRINK: ConsumableItem = {
  id: "energy_drink",
  name: "Energy Boost",
  description: "A special drink that quickly restores your pet's energy.",
  type: "energy_booster",
  rarity: "uncommon",
  icon: "item_energy",
  effects: [{ type: "energy", value: 50 }],
  value: 30,
  stackable: true,
};
