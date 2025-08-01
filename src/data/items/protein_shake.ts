import type { ConsumableItem } from "@/types/Item";

export const PROTEIN_SHAKE: ConsumableItem = {
  id: "protein_shake",
  name: "Protein Shake",
  description: "A nutritious protein shake that provides hydration, energy, and promotes health.",
  type: "consumable",
  rarity: "rare",
  icon: "item_protein_shake",
  effects: [
    { type: "hydration", value: 40 },
    { type: "energy", value: 30 },
    { type: "health", value: 1 },
  ],
  value: 60,
  stackable: true,
};
