/**
 * Material item definitions for crafting.
 */

import { ItemCategory, Rarity } from "@/game/types/constants";
import type { MaterialItem } from "@/game/types/item";
import { MAX_STACK_BY_RARITY } from "./constants";

/**
 * Material items used for crafting.
 *
 * Use MATERIAL_ITEMS.WOOD.id to get the item ID "material_wood".
 */
export const MATERIAL_ITEMS = {
  WOOD: {
    id: "material_wood",
    name: "Wood",
    description: "A sturdy piece of wood. Common crafting material.",
    category: ItemCategory.Material,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 2,
    icon: "🪵",
    craftingTags: ["wood", "organic", "basic"],
  },
  STONE: {
    id: "material_stone",
    name: "Stone",
    description: "A smooth stone. Common crafting material.",
    category: ItemCategory.Material,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 2,
    icon: "🪨",
    craftingTags: ["stone", "mineral", "basic"],
  },
  HERB: {
    id: "material_herb",
    name: "Wild Herb",
    description: "A fragrant wild herb. Used in potions and medicines.",
    category: ItemCategory.Material,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 5,
    icon: "🌿",
    craftingTags: ["herb", "organic", "medicinal"],
  },
  FIBER: {
    id: "material_fiber",
    name: "Plant Fiber",
    description: "Strong plant fibers. Good for weaving and crafting.",
    category: ItemCategory.Material,
    rarity: Rarity.Common,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.common,
    sellValue: 3,
    icon: "🧵",
    craftingTags: ["fiber", "organic", "basic"],
  },
  IRON_ORE: {
    id: "material_iron_ore",
    name: "Iron Ore",
    description: "Raw iron ore. Can be smelted into metal.",
    category: ItemCategory.Material,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 15,
    icon: "⛏️",
    craftingTags: ["ore", "metal", "mineral"],
  },
  CRYSTAL: {
    id: "material_crystal",
    name: "Crystal Shard",
    description: "A glowing crystal shard. Has magical properties.",
    category: ItemCategory.Material,
    rarity: Rarity.Rare,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare + 10,
    sellValue: 50,
    icon: "💎",
    craftingTags: ["crystal", "magic", "rare"],
  },
  MONSTER_FANG: {
    id: "material_monster_fang",
    name: "Monster Fang",
    description:
      "A sharp fang from a defeated creature. Used in battle equipment.",
    category: ItemCategory.Material,
    rarity: Rarity.Uncommon,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.uncommon,
    sellValue: 20,
    icon: "🦷",
    craftingTags: ["monster", "bone", "battle"],
  },
  ESSENCE: {
    id: "material_essence",
    name: "Essence Drop",
    description: "A drop of pure magical essence. Highly valuable.",
    category: ItemCategory.Material,
    rarity: Rarity.Epic,
    stackable: true,
    maxStack: MAX_STACK_BY_RARITY.rare,
    sellValue: 100,
    icon: "✨",
    craftingTags: ["essence", "magic", "rare"],
  },
} as const satisfies Record<string, MaterialItem>;

/** Array of all material items for iteration. */
export const MATERIAL_ITEMS_LIST: readonly MaterialItem[] =
  Object.values(MATERIAL_ITEMS);
