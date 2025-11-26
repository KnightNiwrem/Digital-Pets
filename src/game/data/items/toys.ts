/**
 * Toy item definitions that restore Happiness with durability.
 */

import { toMicro } from "@/game/types/common";
import type { ToyItem } from "@/game/types/item";

/**
 * Toy items available in the game.
 */
export const TOY_ITEMS: readonly ToyItem[] = [
  {
    id: "toy_ball",
    name: "Rubber Ball",
    description: "A bouncy rubber ball. Simple but fun!",
    category: "toy",
    rarity: "common",
    stackable: false,
    maxStack: 1,
    sellValue: 10,
    icon: "🏐",
    happinessRestore: toMicro(15),
    maxDurability: 10,
  },
  {
    id: "toy_rope",
    name: "Tug Rope",
    description: "A sturdy rope for tugging and playing.",
    category: "toy",
    rarity: "common",
    stackable: false,
    maxStack: 1,
    sellValue: 15,
    icon: "🪢",
    happinessRestore: toMicro(18),
    maxDurability: 12,
  },
  {
    id: "toy_plush",
    name: "Plush Toy",
    description: "A soft, cuddly plush companion.",
    category: "toy",
    rarity: "uncommon",
    stackable: false,
    maxStack: 1,
    sellValue: 25,
    icon: "🧸",
    happinessRestore: toMicro(22),
    maxDurability: 8,
  },
  {
    id: "toy_squeaky",
    name: "Squeaky Toy",
    description: "A squeaky toy that makes amusing sounds!",
    category: "toy",
    rarity: "uncommon",
    stackable: false,
    maxStack: 1,
    sellValue: 30,
    icon: "🐤",
    happinessRestore: toMicro(25),
    maxDurability: 15,
  },
  {
    id: "toy_puzzle",
    name: "Puzzle Toy",
    description: "A challenging puzzle toy for smart pets.",
    category: "toy",
    rarity: "rare",
    stackable: false,
    maxStack: 1,
    sellValue: 50,
    icon: "🧩",
    happinessRestore: toMicro(35),
    maxDurability: 20,
  },
] as const;

/**
 * Get a toy item by ID.
 */
export function getToyItemById(id: string): ToyItem | undefined {
  return TOY_ITEMS.find((item) => item.id === id);
}
