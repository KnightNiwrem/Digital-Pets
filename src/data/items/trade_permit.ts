import type { ConsumableItem } from "@/types/Item";

export const TRADE_PERMIT: ConsumableItem = {
  id: "trade_permit",
  name: "Trade Permit",
  description: "An official document allowing participation in high-value trade negotiations.",
  type: "special",
  rarity: "rare",
  icon: "item_trade_permit",
  effects: [{ type: "luck_bonus", value: 25 }],
  value: 100,
  stackable: true,
};
