/**
 * Medicine item definitions that heal HP or cure status effects.
 */

import type { MedicineItem } from "@/game/types/item";

/**
 * Medicine items for healing and curing status effects.
 *
 * Use MEDICINE_ITEMS.BANDAGE.id to get the item ID "medicine_bandage".
 */
export const MEDICINE_ITEMS = {
  BANDAGE: {
    id: "medicine_bandage",
    name: "Bandage",
    description:
      "A simple bandage for minor wounds. Restores a small amount of HP.",
    category: "medicine",
    rarity: "common",
    stackable: true,
    maxStack: 30,
    sellValue: 10,
    icon: "🩹",
    healAmount: 20,
  },
  POTION: {
    id: "medicine_potion",
    name: "Health Potion",
    description: "A basic healing potion. Restores moderate HP.",
    category: "medicine",
    rarity: "common",
    stackable: true,
    maxStack: 20,
    sellValue: 25,
    icon: "🧪",
    healAmount: 50,
  },
  ANTIDOTE: {
    id: "medicine_antidote",
    name: "Antidote",
    description: "Cures poison status effect.",
    category: "medicine",
    rarity: "uncommon",
    stackable: true,
    maxStack: 20,
    sellValue: 30,
    icon: "💊",
    cureStatus: ["poison"],
  },
  SMELLING_SALTS: {
    id: "medicine_smelling_salts",
    name: "Smelling Salts",
    description: "Cures sleep and stun status effects.",
    category: "medicine",
    rarity: "uncommon",
    stackable: true,
    maxStack: 20,
    sellValue: 35,
    icon: "🧂",
    cureStatus: ["sleep", "stun"],
  },
  SUPER_POTION: {
    id: "medicine_super_potion",
    name: "Super Potion",
    description: "A powerful healing potion. Restores significant HP.",
    category: "medicine",
    rarity: "rare",
    stackable: true,
    maxStack: 15,
    sellValue: 75,
    icon: "⚗️",
    healAmount: 100,
  },
  FULL_RESTORE: {
    id: "medicine_full_restore",
    name: "Full Restore",
    description:
      "A miraculous elixir. Fully restores HP and cures all status effects.",
    category: "medicine",
    rarity: "epic",
    stackable: true,
    maxStack: 5,
    sellValue: 200,
    icon: "✨",
    isFullRestore: true,
    cureStatus: ["poison", "burn", "freeze", "sleep", "stun", "confusion"],
  },
} as const satisfies Record<string, MedicineItem>;

/** Array of all medicine items for iteration. */
export const MEDICINE_ITEMS_LIST: readonly MedicineItem[] =
  Object.values(MEDICINE_ITEMS);
