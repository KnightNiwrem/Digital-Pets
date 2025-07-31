// Item definitions for the game

import type { Item, ConsumableItem, DurabilityItem } from "@/types/Item";

// Food items
const APPLE: ConsumableItem = {
  id: "apple",
  name: "Fresh Apple",
  description: "A crisp, red apple that pets love. Restores some satiety.",
  type: "consumable",
  rarity: "common",
  icon: "item_apple",
  effects: [{ type: "satiety", value: 25 }],
  value: 10,
  stackable: true,
};

const BERRY: ConsumableItem = {
  id: "berry",
  name: "Forest Berry",
  description: "A sweet berry found in the forest. Provides nutrition and a bit of happiness.",
  type: "consumable",
  rarity: "common",
  icon: "item_berry",
  effects: [
    { type: "satiety", value: 15 },
    { type: "happiness", value: 10 },
  ],
  value: 8,
  stackable: true,
};

const FISH: ConsumableItem = {
  id: "fish",
  name: "Fresh Fish",
  description: "A tasty fish caught from the river. Very nutritious!",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_fish",
  effects: [{ type: "satiety", value: 40 }],
  value: 20,
  stackable: true,
};

const RARE_FISH: ConsumableItem = {
  id: "rare_fish",
  name: "Golden Fish",
  description: "A rare, golden fish that provides exceptional nutrition and energy.",
  type: "consumable",
  rarity: "rare",
  icon: "item_rare_fish",
  effects: [
    { type: "satiety", value: 50 },
    { type: "energy", value: 20 },
  ],
  value: 50,
  stackable: true,
};

// Drinks
const WATER_BOTTLE: ConsumableItem = {
  id: "water_bottle",
  name: "Water Bottle",
  description: "Clean, refreshing water to keep your pet hydrated.",
  type: "consumable",
  rarity: "common",
  icon: "item_water",
  effects: [{ type: "hydration", value: 30 }],
  value: 8,
  stackable: true,
};

// Medicine
const BASIC_MEDICINE: ConsumableItem = {
  id: "basic_medicine",
  name: "Basic Medicine",
  description: "A simple remedy that can cure minor illnesses and injuries.",
  type: "medicine",
  rarity: "common",
  icon: "item_medicine",
  effects: [
    { type: "health", value: 1 }, // heals one health level
    { type: "cure", value: 1 },
  ],
  value: 25,
  stackable: true,
};

const HERB: ConsumableItem = {
  id: "herb",
  name: "Healing Herb",
  description: "A natural herb with medicinal properties. Restores some health.",
  type: "medicine",
  rarity: "common",
  icon: "item_herb",
  effects: [{ type: "health", value: 1 }],
  value: 15,
  stackable: true,
};

// Hygiene items
const SOAP: ConsumableItem = {
  id: "soap",
  name: "Pet Soap",
  description: "Gentle soap for cleaning your pet. Removes dirt and odors.",
  type: "hygiene",
  rarity: "common",
  icon: "item_soap",
  effects: [{ type: "clean", value: 1 }],
  value: 15,
  stackable: true,
};

// Energy boosters
const ENERGY_DRINK: ConsumableItem = {
  id: "energy_drink",
  name: "Energy Boost",
  description: "A special drink that quickly restores your pet's energy.",
  type: "energy_booster",
  rarity: "uncommon",
  icon: "item_energy",
  effects: [{ type: "energy", value: 50 }],
  value: 30,
  stackable: true,
};

// Durability items (toys and equipment)
const BALL: DurabilityItem = {
  id: "ball",
  name: "Bouncy Ball",
  description: "A fun rubber ball that pets love to play with. Increases happiness.",
  type: "toy",
  rarity: "common",
  icon: "item_ball",
  effects: [{ type: "happiness", value: 30 }],
  value: 25,
  stackable: false,
  maxDurability: 20,
  currentDurability: 20,
  durabilityLossPerUse: 1,
};

const FISHING_ROD: DurabilityItem = {
  id: "fishing_rod",
  name: "Fishing Rod",
  description: "A sturdy fishing rod required for fishing activities.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_fishing_rod",
  effects: [], // enables fishing rather than direct stat effects
  value: 100,
  stackable: false,
  maxDurability: 50,
  currentDurability: 50,
  durabilityLossPerUse: 1,
};

const BAIT: ConsumableItem = {
  id: "bait",
  name: "Fishing Bait",
  description: "Worms and insects that make fishing more successful.",
  type: "consumable",
  rarity: "common",
  icon: "item_bait",
  effects: [{ type: "fishing_bonus", value: 10 }], // used during fishing for better success rates
  value: 5,
  stackable: true,
};

// Additional Food Items
const HONEY: ConsumableItem = {
  id: "honey",
  name: "Golden Honey",
  description: "Sweet honey that provides energy and happiness to pets.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_honey",
  effects: [
    { type: "satiety", value: 20 },
    { type: "happiness", value: 15 },
    { type: "energy", value: 10 },
  ],
  value: 18,
  stackable: true,
};

const MEAT: ConsumableItem = {
  id: "meat",
  name: "Fresh Meat",
  description: "High-quality meat that provides substantial nutrition.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_meat",
  effects: [{ type: "satiety", value: 45 }],
  value: 25,
  stackable: true,
};

const MUSHROOM: ConsumableItem = {
  id: "mushroom",
  name: "Forest Mushroom",
  description: "A nutritious mushroom found in deep forests.",
  type: "consumable",
  rarity: "common",
  icon: "item_mushroom",
  effects: [
    { type: "satiety", value: 18 },
    { type: "happiness", value: 8 },
  ],
  value: 12,
  stackable: true,
};

const CAKE: ConsumableItem = {
  id: "cake",
  name: "Birthday Cake",
  description: "A special celebratory cake that brings great joy.",
  type: "consumable",
  rarity: "rare",
  icon: "item_cake",
  effects: [
    { type: "satiety", value: 35 },
    { type: "happiness", value: 40 },
  ],
  value: 40,
  stackable: true,
};

// Additional Drink Items
const JUICE: ConsumableItem = {
  id: "juice",
  name: "Fruit Juice",
  description: "Refreshing fruit juice that hydrates and energizes.",
  type: "consumable",
  rarity: "common",
  icon: "item_juice",
  effects: [
    { type: "hydration", value: 25 },
    { type: "happiness", value: 10 },
  ],
  value: 12,
  stackable: true,
};

const PROTEIN_SHAKE: ConsumableItem = {
  id: "protein_shake",
  name: "Protein Shake",
  description: "A nutritious protein shake that provides hydration, energy, and promotes health.",
  type: "consumable",
  rarity: "rare",
  icon: "item_protein_shake",
  effects: [
    { type: "hydration", value: 40 },
    { type: "energy", value: 30 },
    { type: "health", value: 1 },
  ],
  value: 60,
  stackable: true,
};

const MILK: ConsumableItem = {
  id: "milk",
  name: "Fresh Milk",
  description: "Nutritious milk that provides hydration and some satiety.",
  type: "consumable",
  rarity: "common",
  icon: "item_milk",
  effects: [
    { type: "hydration", value: 28 },
    { type: "satiety", value: 12 },
  ],
  value: 10,
  stackable: true,
};

const HERBAL_TEA: ConsumableItem = {
  id: "herbal_tea",
  name: "Herbal Tea",
  description: "A soothing herbal tea that provides gentle hydration and relaxation.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_herbal_tea",
  effects: [
    { type: "hydration", value: 32 },
    { type: "happiness", value: 12 },
  ],
  value: 16,
  stackable: true,
};

// Additional Medicine Items
const STRONG_MEDICINE: ConsumableItem = {
  id: "strong_medicine",
  name: "Strong Medicine",
  description: "Powerful medicine that can cure serious illnesses.",
  type: "medicine",
  rarity: "uncommon",
  icon: "item_strong_medicine",
  effects: [
    { type: "health", value: 2 },
    { type: "cure", value: 2 },
  ],
  value: 45,
  stackable: true,
};

const VITAMIN: ConsumableItem = {
  id: "vitamin",
  name: "Health Vitamin",
  description: "Daily vitamin that boosts health and energy.",
  type: "medicine",
  rarity: "common",
  icon: "item_vitamin",
  effects: [
    { type: "health", value: 1 },
    { type: "energy", value: 15 },
  ],
  value: 20,
  stackable: true,
};

const ANTIDOTE: ConsumableItem = {
  id: "antidote",
  name: "Universal Antidote",
  description: "Cures any poison or disease affecting your pet.",
  type: "medicine",
  rarity: "rare",
  icon: "item_antidote",
  effects: [
    { type: "cure", value: 3 },
    { type: "health", value: 1 },
  ],
  value: 75,
  stackable: true,
};

// Additional Hygiene Items
const SHAMPOO: ConsumableItem = {
  id: "shampoo",
  name: "Pet Shampoo",
  description: "Special shampoo that cleans and freshens your pet.",
  type: "hygiene",
  rarity: "common",
  icon: "item_shampoo",
  effects: [
    { type: "clean", value: 2 },
    { type: "happiness", value: 8 },
  ],
  value: 15,
  stackable: true,
};

const PERFUME: ConsumableItem = {
  id: "perfume",
  name: "Floral Perfume",
  description: "Lovely perfume that makes your pet smell wonderful.",
  type: "hygiene",
  rarity: "uncommon",
  icon: "item_perfume",
  effects: [
    { type: "clean", value: 1 },
    { type: "happiness", value: 20 },
  ],
  value: 30,
  stackable: true,
};

// Additional Toys and Equipment
const FEATHER_TOY: DurabilityItem = {
  id: "feather_toy",
  name: "Feather Wand",
  description: "A fun feather toy that pets love to chase and play with.",
  type: "toy",
  rarity: "common",
  icon: "item_feather_toy",
  effects: [{ type: "happiness", value: 20 }],
  value: 20,
  stackable: false,
  maxDurability: 8,
  currentDurability: 8,
  durabilityLossPerUse: 1,
};

const PUZZLE_TOY: DurabilityItem = {
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

const ROPE_TOY: DurabilityItem = {
  id: "rope_toy",
  name: "Rope Toy",
  description: "A durable rope toy perfect for tugging and chewing.",
  type: "toy",
  rarity: "common",
  icon: "item_rope_toy",
  effects: [{ type: "happiness", value: 18 }],
  value: 15,
  stackable: false,
  maxDurability: 15,
  currentDurability: 15,
  durabilityLossPerUse: 1,
};

const MUSIC_BOX: DurabilityItem = {
  id: "music_box",
  name: "Music Box",
  description: "An elegant music box that plays soothing melodies.",
  type: "toy",
  rarity: "rare",
  icon: "item_music_box",
  effects: [
    { type: "happiness", value: 35 },
    { type: "energy", value: 10 }, // relaxing music restores energy
  ],
  value: 80,
  stackable: false,
  maxDurability: 20,
  currentDurability: 20,
  durabilityLossPerUse: 1,
};

// Equipment and Tools
const TRAINING_COLLAR: DurabilityItem = {
  id: "training_collar",
  name: "Training Collar",
  description: "Special collar that helps pets focus during training.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_training_collar",
  effects: [{ type: "training_bonus", value: 15 }],
  value: 50,
  stackable: false,
  maxDurability: 25,
  currentDurability: 25,
  durabilityLossPerUse: 1,
};

const LUCKY_CHARM: DurabilityItem = {
  id: "lucky_charm",
  name: "Lucky Charm",
  description: "A special charm that brings good fortune to your pet.",
  type: "equipment",
  rarity: "rare",
  icon: "item_lucky_charm",
  effects: [{ type: "luck_bonus", value: 20 }],
  value: 100,
  stackable: false,
  maxDurability: 30,
  currentDurability: 30,
  durabilityLossPerUse: 1,
};

const EXPLORATION_PACK: DurabilityItem = {
  id: "exploration_pack",
  name: "Explorer's Pack",
  description: "A sturdy pack that helps pets carry more items while exploring.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_exploration_pack",
  effects: [{ type: "exploration_bonus", value: 25 }],
  value: 65,
  stackable: false,
  maxDurability: 20,
  currentDurability: 20,
  durabilityLossPerUse: 1,
};

// Mining Items
const PICKAXE: DurabilityItem = {
  id: "pickaxe",
  name: "Mining Pickaxe",
  description: "A sturdy pickaxe essential for mining operations in the mountains.",
  type: "equipment",
  rarity: "common",
  icon: "item_pickaxe",
  effects: [{ type: "mining_bonus", value: 20 }],
  value: 75,
  stackable: false,
  maxDurability: 25,
  currentDurability: 25,
  durabilityLossPerUse: 1,
};

const IRON_ORE: ConsumableItem = {
  id: "iron_ore",
  name: "Iron Ore",
  description: "Raw iron ore found in mountain mines. Valuable for crafting equipment.",
  type: "material",
  rarity: "common",
  icon: "item_iron_ore",
  effects: [{ type: "crafting_material", value: 1 }],
  value: 25,
  stackable: true,
};

const SILVER_ORE: ConsumableItem = {
  id: "silver_ore",
  name: "Silver Ore",
  description: "Precious silver ore with a lustrous shine. Highly valued by traders.",
  type: "material",
  rarity: "uncommon",
  icon: "item_silver_ore",
  effects: [{ type: "crafting_material", value: 2 }],
  value: 45,
  stackable: true,
};

const GOLD_ORE: ConsumableItem = {
  id: "gold_ore",
  name: "Gold Ore",
  description: "Rare and valuable gold ore. The dream of every miner.",
  type: "material",
  rarity: "rare",
  icon: "item_gold_ore",
  effects: [{ type: "crafting_material", value: 3 }],
  value: 80,
  stackable: true,
};

const PRECIOUS_GEM: ConsumableItem = {
  id: "precious_gem",
  name: "Precious Gem",
  description: "A beautiful, multi-faceted gem that sparkles in the light.",
  type: "material",
  rarity: "epic",
  icon: "item_precious_gem",
  effects: [
    { type: "crafting_material", value: 5 },
    { type: "happiness", value: 15 }, // pets love shiny things
  ],
  value: 120,
  stackable: true,
};

// Special Items
const CRYSTAL_FRAGMENT: ConsumableItem = {
  id: "crystal_fragment",
  name: "Crystal Fragment",
  description: "A rare crystal fragment with mysterious properties.",
  type: "special",
  rarity: "epic",
  icon: "item_crystal_fragment",
  effects: [
    { type: "energy", value: 50 },
    { type: "happiness", value: 25 },
    { type: "health", value: 1 },
  ],
  value: 200,
  stackable: true,
};

const ANCIENT_RELIC: ConsumableItem = {
  id: "ancient_relic",
  name: "Ancient Relic",
  description: "A mysterious artifact from an ancient civilization.",
  type: "special",
  rarity: "legendary",
  icon: "item_ancient_relic",
  effects: [
    { type: "satiety", value: 100 },
    { type: "hydration", value: 100 },
    { type: "happiness", value: 100 },
    { type: "energy", value: 100 },
  ],
  value: 500,
  stackable: true,
};

// Ancient Ruins items for end-game content
const ANCIENT_KEY: ConsumableItem = {
  id: "ancient_key",
  name: "Ancient Key",
  description: "A crystalline key that unlocks the deepest chambers of ancient ruins.",
  type: "special",
  rarity: "epic",
  icon: "item_ancient_key",
  effects: [{ type: "energy", value: 50 }],
  value: 300,
  stackable: true,
};

const WISDOM_SCROLL: ConsumableItem = {
  id: "wisdom_scroll",
  name: "Wisdom Scroll",
  description: "An ancient scroll containing profound knowledge that enhances understanding.",
  type: "special",
  rarity: "rare",
  icon: "item_wisdom_scroll",
  effects: [
    { type: "experience_bonus", value: 25 },
    { type: "happiness", value: 30 },
  ],
  value: 120,
  stackable: true,
};

const LEGENDARY_ARTIFACT: ConsumableItem = {
  id: "legendary_artifact",
  name: "Legendary Artifact",
  description: "An incredibly rare artifact of immense power from the dawn of civilization.",
  type: "special",
  rarity: "legendary",
  icon: "item_legendary_artifact",
  effects: [
    { type: "satiety", value: 150 },
    { type: "hydration", value: 150 },
    { type: "happiness", value: 150 },
    { type: "energy", value: 150 },
    { type: "experience_bonus", value: 100 },
  ],
  value: 1000,
  stackable: true,
};

const GUARDIAN_ESSENCE: ConsumableItem = {
  id: "guardian_essence",
  name: "Guardian Essence",
  description: "A glowing essence extracted from ancient guardians, pulsing with protective energy.",
  type: "special",
  rarity: "epic",
  icon: "item_guardian_essence",
  effects: [
    { type: "energy", value: 75 },
    { type: "happiness", value: 50 },
  ],
  value: 250,
  stackable: true,
};

const ANCIENT_POTION: ConsumableItem = {
  id: "ancient_potion",
  name: "Ancient Potion",
  description: "A potent elixir brewed using secrets from a lost civilization.",
  type: "medicine",
  rarity: "legendary",
  icon: "item_ancient_potion",
  effects: [
    { type: "full_heal", value: 1 },
    { type: "satiety", value: 100 },
    { type: "hydration", value: 100 },
    { type: "energy", value: 100 },
  ],
  value: 400,
  stackable: true,
};

const MYSTIC_CHARM: DurabilityItem = {
  id: "mystic_charm",
  name: "Mystic Charm",
  description: "A mystical amulet that provides ongoing benefits to its bearer.",
  type: "equipment",
  rarity: "epic",
  icon: "item_mystic_charm",
  effects: [{ type: "happiness_boost", value: 15 }],
  value: 300,
  stackable: false,
  maxDurability: 50,
  currentDurability: 50,
  durabilityLossPerUse: 1,
};

const ENERGY_CRYSTAL: ConsumableItem = {
  id: "energy_crystal",
  name: "Energy Crystal",
  description: "A crystal that radiates pure energy, perfect for restoring vitality.",
  type: "special",
  rarity: "rare",
  icon: "item_energy_crystal",
  effects: [{ type: "energy", value: 100 }],
  value: 150,
  stackable: true,
};

const GROWTH_SEED: ConsumableItem = {
  id: "growth_seed",
  name: "Growth Seed",
  description: "A rare seed with special nutrients that accelerates pet growth and development.",
  type: "special",
  rarity: "epic",
  icon: "item_growth_seed",
  effects: [{ type: "growth_bonus", value: 1 }],
  value: 150,
  stackable: true,
};

// Coastal Harbor maritime items
const EXOTIC_FISH: ConsumableItem = {
  id: "exotic_fish",
  name: "Exotic Fish",
  description: "A rare deep-sea fish with vibrant colors and exceptional nutritional value.",
  type: "consumable",
  rarity: "rare",
  icon: "item_exotic_fish",
  effects: [
    { type: "satiety", value: 70 },
    { type: "happiness", value: 40 },
  ],
  value: 85,
  stackable: true,
};

const PEARL: ConsumableItem = {
  id: "pearl",
  name: "Ocean Pearl",
  description: "A lustrous pearl from the deep ocean, said to bring good fortune.",
  type: "special",
  rarity: "epic",
  icon: "item_pearl",
  effects: [
    { type: "happiness", value: 60 },
    { type: "luck_bonus", value: 10 },
  ],
  value: 200,
  stackable: true,
};

const NAVIGATION_COMPASS: DurabilityItem = {
  id: "navigation_compass",
  name: "Navigation Compass",
  description: "A precision compass used by skilled navigators for long sea voyages.",
  type: "equipment",
  rarity: "rare",
  icon: "item_navigation_compass",
  effects: [{ type: "exploration_bonus", value: 20 }],
  value: 180,
  stackable: false,
  maxDurability: 100,
  currentDurability: 100,
  durabilityLossPerUse: 2,
};

const SEA_SALT: ConsumableItem = {
  id: "sea_salt",
  name: "Sea Salt",
  description: "Pure sea salt harvested from coastal waters, perfect for food preparation.",
  type: "special",
  rarity: "common",
  icon: "item_sea_salt",
  effects: [{ type: "satiety", value: 10 }],
  value: 15,
  stackable: true,
};

const KELP_SUPPLEMENT: ConsumableItem = {
  id: "kelp_supplement",
  name: "Kelp Supplement",
  description: "Nutritious kelp supplement rich in vitamins and minerals from the sea.",
  type: "medicine",
  rarity: "uncommon",
  icon: "item_kelp_supplement",
  effects: [
    { type: "health", value: 30 },
    { type: "hydration", value: 25 },
  ],
  value: 35,
  stackable: true,
};

const MARITIME_ROPE: ConsumableItem = {
  id: "maritime_rope",
  name: "Maritime Rope",
  description: "Strong rope used in ship operations, useful for various activities.",
  type: "special",
  rarity: "common",
  icon: "item_rope",
  effects: [{ type: "exploration_bonus", value: 5 }],
  value: 20,
  stackable: true,
};

const SHIP_TOOLS: DurabilityItem = {
  id: "ship_tools",
  name: "Ship Maintenance Tools",
  description: "A set of specialized tools for ship repair and maintenance work.",
  type: "equipment",
  rarity: "uncommon",
  icon: "item_ship_tools",
  effects: [{ type: "training_bonus", value: 15 }],
  value: 60,
  stackable: false,
  maxDurability: 80,
  currentDurability: 80,
  durabilityLossPerUse: 3,
};

const TRADE_PERMIT: ConsumableItem = {
  id: "trade_permit",
  name: "Trade Permit",
  description: "An official document allowing participation in high-value trade negotiations.",
  type: "special",
  rarity: "rare",
  icon: "item_trade_permit",
  effects: [{ type: "luck_bonus", value: 25 }],
  value: 100,
  stackable: true,
};

const EXOTIC_SPICE: ConsumableItem = {
  id: "exotic_spice",
  name: "Exotic Spice",
  description: "Rare spices from distant lands that enhance the flavor of any meal.",
  type: "consumable",
  rarity: "uncommon",
  icon: "item_exotic_spice",
  effects: [
    { type: "satiety", value: 15 },
    { type: "happiness", value: 30 },
  ],
  value: 45,
  stackable: true,
};

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
