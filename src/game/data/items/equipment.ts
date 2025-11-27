/**
 * Equipment item definitions that provide passive bonuses.
 */

import type { EquipmentItem } from "@/game/types/item";

/**
 * Equipment items that can be worn for passive bonuses.
 *
 * Use EQUIPMENT_ITEMS.TRAINING_COLLAR.id to get the item ID "equip_training_collar".
 */
export const EQUIPMENT_ITEMS = {
  TRAINING_COLLAR: {
    id: "equip_training_collar",
    name: "Training Collar",
    description: "A lightweight collar that improves training efficiency.",
    category: "equipment",
    rarity: "uncommon",
    stackable: false,
    maxStack: 1,
    sellValue: 100,
    icon: "📿",
    slot: "accessory",
    effect: "+10% training stat gains",
    statBonuses: {},
    specialEffects: [{ type: "trainingBonus", value: 10 }],
    maxDurability: 50,
    degradeActivity: "training",
  },
  LUCKY_CHARM: {
    id: "equip_lucky_charm",
    name: "Lucky Charm",
    description: "A small charm that brings good fortune in exploration.",
    category: "equipment",
    rarity: "uncommon",
    stackable: false,
    maxStack: 1,
    sellValue: 80,
    icon: "🍀",
    slot: "charm",
    effect: "+5% rare item drop rate",
    statBonuses: {},
    specialEffects: [{ type: "dropRate", value: 5 }],
    maxDurability: 30,
    degradeActivity: "exploration",
  },
  IRON_BANGLE: {
    id: "equip_iron_bangle",
    name: "Iron Bangle",
    description: "A sturdy iron bangle that increases strength.",
    category: "equipment",
    rarity: "uncommon",
    stackable: false,
    maxStack: 1,
    sellValue: 120,
    icon: "💪",
    slot: "accessory",
    effect: "+3 Strength",
    statBonuses: { strength: 3 },
    maxDurability: 40,
    degradeActivity: "battle",
  },
  SWIFT_ANKLET: {
    id: "equip_swift_anklet",
    name: "Swift Anklet",
    description: "A featherweight anklet that enhances agility.",
    category: "equipment",
    rarity: "rare",
    stackable: false,
    maxStack: 1,
    sellValue: 180,
    icon: "⚡",
    slot: "accessory",
    effect: "+4 Agility",
    statBonuses: { agility: 4 },
    maxDurability: 35,
    degradeActivity: "battle",
  },
  GUARDIANS_PENDANT: {
    id: "equip_guardians_pendant",
    name: "Guardian's Pendant",
    description: "A protective pendant that boosts endurance and fortitude.",
    category: "equipment",
    rarity: "rare",
    stackable: false,
    maxStack: 1,
    sellValue: 200,
    icon: "🛡️",
    slot: "charm",
    effect: "+2 Endurance, +2 Fortitude",
    statBonuses: { endurance: 2, fortitude: 2 },
    maxDurability: 45,
    degradeActivity: "battle",
  },
  HUNTERS_EYE: {
    id: "equip_hunters_eye",
    name: "Hunter's Eye",
    description: "A crystalline lens that enhances precision.",
    category: "equipment",
    rarity: "epic",
    stackable: false,
    maxStack: 1,
    sellValue: 350,
    icon: "🎯",
    slot: "accessory",
    effect: "+5 Precision, +5% critical hit rate",
    statBonuses: { precision: 5 },
    specialEffects: [{ type: "critRate", value: 5 }],
    maxDurability: 30,
    degradeActivity: "battle",
  },
} as const satisfies Record<string, EquipmentItem>;

/** Array of all equipment items for iteration. */
export const EQUIPMENT_ITEMS_LIST: readonly EquipmentItem[] =
  Object.values(EQUIPMENT_ITEMS);

/**
 * Get an equipment item by ID.
 */
export function getEquipmentItemById(id: string): EquipmentItem | undefined {
  return EQUIPMENT_ITEMS_LIST.find((item) => item.id === id);
}
