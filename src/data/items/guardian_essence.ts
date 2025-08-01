import type { ConsumableItem } from "@/types/Item";

export const GUARDIAN_ESSENCE: ConsumableItem = {
  id: "guardian_essence",
  name: "Guardian Essence",
  description: "A glowing essence extracted from ancient guardians, pulsing with protective energy.",
  type: "special",
  rarity: "epic",
  icon: "item_guardian_essence",
  effects: [
    { type: "energy", value: 75 },
    { type: "happiness", value: 50 },
  ],
  value: 250,
  stackable: true,
};
