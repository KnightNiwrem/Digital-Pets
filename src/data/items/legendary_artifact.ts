import type { ConsumableItem } from "@/types/Item";

export const LEGENDARY_ARTIFACT: ConsumableItem = {
  id: "legendary_artifact",
  name: "Legendary Artifact",
  description: "An incredibly rare artifact of immense power from the dawn of civilization.",
  type: "special",
  rarity: "legendary",
  icon: "item_legendary_artifact",
  effects: [
    { type: "satiety", value: 150 },
    { type: "hydration", value: 150 },
    { type: "happiness", value: 150 },
    { type: "energy", value: 150 },
    { type: "experience_bonus", value: 100 },
  ],
  value: 1000,
  stackable: true,
};
