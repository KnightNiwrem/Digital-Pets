import type { DurabilityItem } from "@/types/Item";

export const NAVIGATION_COMPASS: DurabilityItem = {
  id: "navigation_compass",
  name: "Navigation Compass",
  description: "A precision compass used by skilled navigators for long sea voyages.",
  type: "equipment",
  rarity: "rare",
  icon: "item_navigation_compass",
  effects: [{ type: "exploration_bonus", value: 20 }],
  value: 180,
  stackable: false,
  maxDurability: 100,
  currentDurability: 100,
  durabilityLossPerUse: 2,
};
