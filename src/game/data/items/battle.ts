/**
 * Battle item definitions that provide temporary combat buffs.
 */

import type { BattleItem } from "@/game/types/item";

/**
 * Battle consumable items for use during combat.
 */
export const BATTLE_ITEMS: readonly BattleItem[] = [
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
] as const;

/**
 * Get a battle item by ID.
 */
export function getBattleItemById(id: string): BattleItem | undefined {
  return BATTLE_ITEMS.find((item) => item.id === id);
}
