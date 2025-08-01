// Item definitions for the game - modular structure
import type { Item, DurabilityItem } from "@/types/Item";

// Import all individual items
import { APPLE } from "./apple";
import { BERRY } from "./berry";
import { FISH } from "./fish";
import { RARE_FISH } from "./rare_fish";
import { WATER_BOTTLE } from "./water_bottle";
import { BASIC_MEDICINE } from "./basic_medicine";
import { HERB } from "./herb";
import { SOAP } from "./soap";
import { ENERGY_DRINK } from "./energy_drink";
import { BALL } from "./ball";
import { FISHING_ROD } from "./fishing_rod";
import { BAIT } from "./bait";
import { HONEY } from "./honey";
import { MEAT } from "./meat";
import { MUSHROOM } from "./mushroom";
import { CAKE } from "./cake";
import { JUICE } from "./juice";
import { PROTEIN_SHAKE } from "./protein_shake";
import { MILK } from "./milk";
import { HERBAL_TEA } from "./herbal_tea";
import { STRONG_MEDICINE } from "./strong_medicine";
import { VITAMIN } from "./vitamin";
import { ANTIDOTE } from "./antidote";
import { SHAMPOO } from "./shampoo";
import { PERFUME } from "./perfume";
import { FEATHER_TOY } from "./feather_toy";
import { PUZZLE_TOY } from "./puzzle_toy";
import { ROPE_TOY } from "./rope_toy";
import { MUSIC_BOX } from "./music_box";
import { TRAINING_COLLAR } from "./training_collar";
import { LUCKY_CHARM } from "./lucky_charm";
import { EXPLORATION_PACK } from "./exploration_pack";
import { PICKAXE } from "./pickaxe";
import { IRON_ORE } from "./iron_ore";
import { SILVER_ORE } from "./silver_ore";
import { GOLD_ORE } from "./gold_ore";
import { PRECIOUS_GEM } from "./precious_gem";
import { CRYSTAL_FRAGMENT } from "./crystal_fragment";
import { ANCIENT_RELIC } from "./ancient_relic";
import { ANCIENT_KEY } from "./ancient_key";
import { WISDOM_SCROLL } from "./wisdom_scroll";
import { LEGENDARY_ARTIFACT } from "./legendary_artifact";
import { GUARDIAN_ESSENCE } from "./guardian_essence";
import { ANCIENT_POTION } from "./ancient_potion";
import { MYSTIC_CHARM } from "./mystic_charm";
import { ENERGY_CRYSTAL } from "./energy_crystal";
import { GROWTH_SEED } from "./growth_seed";
import { EXOTIC_FISH } from "./exotic_fish";
import { PEARL } from "./pearl";
import { NAVIGATION_COMPASS } from "./navigation_compass";
import { SEA_SALT } from "./sea_salt";
import { KELP_SUPPLEMENT } from "./kelp_supplement";
import { MARITIME_ROPE } from "./maritime_rope";
import { SHIP_TOOLS } from "./ship_tools";
import { TRADE_PERMIT } from "./trade_permit";
import { EXOTIC_SPICE } from "./exotic_spice";

// Export all items
export const ITEMS: Item[] = [
  // Basic items (original 12)
  APPLE,
  BERRY,
  FISH,
  RARE_FISH,
  WATER_BOTTLE,
  BASIC_MEDICINE,
  HERB,
  SOAP,
  ENERGY_DRINK,
  BALL,
  FISHING_ROD,
  BAIT,

  // Additional food items
  HONEY,
  MEAT,
  MUSHROOM,
  CAKE,

  // Additional drink items
  JUICE,
  PROTEIN_SHAKE,
  MILK,
  HERBAL_TEA,

  // Additional medicine items
  STRONG_MEDICINE,
  VITAMIN,
  ANTIDOTE,

  // Additional hygiene items
  SHAMPOO,
  PERFUME,

  // Additional toys
  FEATHER_TOY,
  PUZZLE_TOY,
  ROPE_TOY,
  MUSIC_BOX,

  // Equipment
  TRAINING_COLLAR,
  LUCKY_CHARM,
  EXPLORATION_PACK,

  // Mining items
  PICKAXE,
  IRON_ORE,
  SILVER_ORE,
  GOLD_ORE,
  PRECIOUS_GEM,

  // Special items
  CRYSTAL_FRAGMENT,
  ANCIENT_RELIC,
  ANCIENT_KEY,
  WISDOM_SCROLL,
  LEGENDARY_ARTIFACT,
  GUARDIAN_ESSENCE,
  ANCIENT_POTION,
  MYSTIC_CHARM,
  ENERGY_CRYSTAL,
  GROWTH_SEED,

  // Maritime items
  EXOTIC_FISH,
  PEARL,
  NAVIGATION_COMPASS,
  SEA_SALT,
  KELP_SUPPLEMENT,
  MARITIME_ROPE,
  SHIP_TOOLS,
  TRADE_PERMIT,
  EXOTIC_SPICE,
];

// Helper function to get item by ID
export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
}

// Helper function to get items by type
export function getItemsByType(type: string): Item[] {
  return ITEMS.filter(item => item.type === type);
}

// Helper function to get items by rarity
export function getItemsByRarity(rarity: string): Item[] {
  return ITEMS.filter(item => item.rarity === rarity);
}

// Helper function to create new item instance (important for durability items)
export function createItemInstance(itemId: string): Item | undefined {
  const template = getItemById(itemId);
  if (!template) return undefined;

  // For durability items, create a new instance with full durability
  if (!template.stackable) {
    return {
      ...template,
      currentDurability: (template as DurabilityItem).maxDurability,
    } as DurabilityItem;
  }

  // For consumable items, return the template as-is
  return { ...template };
}
