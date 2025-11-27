/**
 * Battle item definitions that provide temporary combat buffs.
 */

import type { BattleItem } from "@/game/types/item";

/**
 * Battle consumable items for use during combat.
 *
 * Use BATTLE_ITEMS.ATTACK_BOOST.id to get the item ID "battle_attack_boost".
 */
export const BATTLE_ITEMS = {
  ATTACK_BOOST: {
    id: "battle_attack_boost",
    name: "Attack Boost",
    description: "Temporarily increases attack power during battle.",
    category: "battle",
    rarity: "uncommon",
    stackable: true,
    maxStack: 20,
    sellValue: 40,
    icon: "⚔️",
    statModifier: "strength",
    modifierValue: 15,
    duration: 3,
  },
  DEFENSE_BOOST: {
    id: "battle_defense_boost",
    name: "Defense Boost",
    description: "Temporarily increases defense during battle.",
    category: "battle",
    rarity: "uncommon",
    stackable: true,
    maxStack: 20,
    sellValue: 40,
    icon: "🛡️",
    statModifier: "endurance",
    modifierValue: 15,
    duration: 3,
  },
  SPEED_BOOST: {
    id: "battle_speed_boost",
    name: "Speed Boost",
    description: "Temporarily increases speed during battle.",
    category: "battle",
    rarity: "uncommon",
    stackable: true,
    maxStack: 20,
    sellValue: 40,
    icon: "💨",
    statModifier: "agility",
    modifierValue: 20,
    duration: 3,
  },
  PRECISION_BOOST: {
    id: "battle_precision_boost",
    name: "Focus Lens",
    description: "Temporarily increases precision for critical hits.",
    category: "battle",
    rarity: "rare",
    stackable: true,
    maxStack: 15,
    sellValue: 60,
    icon: "🎯",
    statModifier: "precision",
    modifierValue: 20,
    duration: 3,
  },
  IRON_SKIN: {
    id: "battle_iron_skin",
    name: "Iron Skin Elixir",
    description: "Greatly increases fortitude for a short time.",
    category: "battle",
    rarity: "rare",
    stackable: true,
    maxStack: 10,
    sellValue: 80,
    icon: "🏋️",
    statModifier: "fortitude",
    modifierValue: 25,
    duration: 2,
  },
  CUNNING_ESSENCE: {
    id: "battle_cunning_essence",
    name: "Cunning Essence",
    description: "Enhances cunning for evasion and status effects.",
    category: "battle",
    rarity: "rare",
    stackable: true,
    maxStack: 10,
    sellValue: 70,
    icon: "🦊",
    statModifier: "cunning",
    modifierValue: 20,
    duration: 3,
  },
} as const satisfies Record<string, BattleItem>;

/** Array of all battle items for iteration. */
export const BATTLE_ITEMS_LIST: readonly BattleItem[] =
  Object.values(BATTLE_ITEMS);

/**
 * Get a battle item by ID.
 */
export function getBattleItemById(id: string): BattleItem | undefined {
  return BATTLE_ITEMS_LIST.find((item) => item.id === id);
}
