import type { ConsumableItem } from "@/types/Item";

export const ANCIENT_POTION: ConsumableItem = {
  id: "ancient_potion",
  name: "Ancient Potion",
  description: "A potent elixir brewed using secrets from a lost civilization.",
  type: "medicine",
  rarity: "legendary",
  icon: "item_ancient_potion",
  effects: [
    { type: "full_heal", value: 1 },
    { type: "satiety", value: 100 },
    { type: "hydration", value: 100 },
    { type: "energy", value: 100 },
  ],
  value: 400,
  stackable: true,
};
