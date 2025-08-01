import type { ConsumableItem } from "@/types/Item";

export const SOAP: ConsumableItem = {
  id: "soap",
  name: "Pet Soap",
  description: "Gentle soap for cleaning your pet. Removes dirt and odors.",
  type: "hygiene",
  rarity: "common",
  icon: "item_soap",
  effects: [{ type: "clean", value: 1 }],
  value: 15,
  stackable: true,
};
