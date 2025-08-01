import type { DurabilityItem } from "@/types/Item";

export const PUZZLE_TOY: DurabilityItem = {
  id: "puzzle_toy",
  name: "Puzzle Toy",
  description: "An intelligent toy that challenges and entertains pets.",
  type: "toy",
  rarity: "uncommon",
  icon: "item_puzzle_toy",
  effects: [
    { type: "happiness", value: 25 },
    { type: "energy", value: -5 }, // requires energy to play
  ],
  value: 35,
  stackable: false,
  maxDurability: 12,
  currentDurability: 12,
  durabilityLossPerUse: 1,
};
