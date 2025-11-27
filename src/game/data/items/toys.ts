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
  {
    id: "toy_frisbee",
    name: "Flying Frisbee",
    description: "A colorful frisbee for outdoor fun.",
    category: "toy",
    rarity: "common",
    stackable: false,
    maxStack: 1,
    sellValue: 12,
    icon: "🥏",
    happinessRestore: toMicro(16),
    maxDurability: 15,
  },
  {
    id: "toy_bell",
    name: "Jingle Bell",
    description: "A shiny bell that makes a pleasant sound.",
    category: "toy",
    rarity: "uncommon",
    stackable: false,
    maxStack: 1,
    sellValue: 20,
    icon: "🔔",
    happinessRestore: toMicro(20),
    maxDurability: 25,
  },
  {
    id: "toy_magic_wand",
    name: "Magic Wand",
    description: "A sparkling wand that creates mesmerizing light patterns.",
    category: "toy",
    rarity: "rare",
    stackable: false,
    maxStack: 1,
    sellValue: 75,
    icon: "🪄",
    happinessRestore: toMicro(40),
    maxDurability: 12,
  },
  {
    id: "toy_treasure_box",
    name: "Treasure Box",
    description:
      "A mysterious box filled with surprises. Endlessly entertaining!",
    category: "toy",
    rarity: "epic",
    stackable: false,
    maxStack: 1,
    sellValue: 120,
    icon: "🎁",
    happinessRestore: toMicro(50),
    maxDurability: 30,
  },
] as const;

/**
 * Get a toy item by ID.
 */
export function getToyItemById(id: string): ToyItem | undefined {
  return TOY_ITEMS.find((item) => item.id === id);
}
