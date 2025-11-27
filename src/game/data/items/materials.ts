/**
 * Material item definitions for crafting.
 */

import type { MaterialItem } from "@/game/types/item";

/**
 * Material items used for crafting.
 */
export const MATERIAL_ITEMS: readonly MaterialItem[] = [
  {
    id: "material_wood",
    name: "Wood",
    description: "A sturdy piece of wood. Common crafting material.",
    category: "material",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 2,
    icon: "🪵",
    craftingTags: ["wood", "organic", "basic"],
  },
  {
    id: "material_stone",
    name: "Stone",
    description: "A smooth stone. Common crafting material.",
    category: "material",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 2,
    icon: "🪨",
    craftingTags: ["stone", "mineral", "basic"],
  },
  {
    id: "material_herb",
    name: "Wild Herb",
    description: "A fragrant wild herb. Used in potions and medicines.",
    category: "material",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 5,
    icon: "🌿",
    craftingTags: ["herb", "organic", "medicinal"],
  },
  {
    id: "material_fiber",
    name: "Plant Fiber",
    description: "Strong plant fibers. Good for weaving and crafting.",
    category: "material",
    rarity: "common",
    stackable: true,
    maxStack: 99,
    sellValue: 3,
    icon: "🧵",
    craftingTags: ["fiber", "organic", "basic"],
  },
  {
    id: "material_iron_ore",
    name: "Iron Ore",
    description: "Raw iron ore. Can be smelted into metal.",
    category: "material",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 15,
    icon: "⛏️",
    craftingTags: ["ore", "metal", "mineral"],
  },
  {
    id: "material_crystal",
    name: "Crystal Shard",
    description: "A glowing crystal shard. Has magical properties.",
    category: "material",
    rarity: "rare",
    stackable: true,
    maxStack: 30,
    sellValue: 50,
    icon: "💎",
    craftingTags: ["crystal", "magic", "rare"],
  },
  {
    id: "material_monster_fang",
    name: "Monster Fang",
    description:
      "A sharp fang from a defeated creature. Used in battle equipment.",
    category: "material",
    rarity: "uncommon",
    stackable: true,
    maxStack: 50,
    sellValue: 20,
    icon: "🦷",
    craftingTags: ["monster", "bone", "battle"],
  },
  {
    id: "material_essence",
    name: "Essence Drop",
    description: "A drop of pure magical essence. Highly valuable.",
    category: "material",
    rarity: "epic",
    stackable: true,
    maxStack: 20,
    sellValue: 100,
    icon: "✨",
    craftingTags: ["essence", "magic", "rare"],
  },
] as const;

/**
 * Get a material item by ID.
 */
export function getMaterialItemById(id: string): MaterialItem | undefined {
  return MATERIAL_ITEMS.find((item) => item.id === id);
}
