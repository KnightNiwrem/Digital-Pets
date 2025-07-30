// Item definitions for the game

import type { Item, ItemType, ItemRarity, ConsumableItem, DurabilityItem } from "@/types/Item";

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

const MAGIC_POTION: ConsumableItem = {
  id: "magic_potion",
  name: "Magic Potion",
  description: "A mystical potion that restores health and energy.",
  type: "consumable",
  rarity: "rare",
  icon: "item_magic_potion",
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
  description: "A magical music box that plays soothing melodies.",
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
  description: "A mystical charm that brings good fortune to your pet.",
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

const GROWTH_SEED: ConsumableItem = {
  id: "growth_seed",
  name: "Growth Seed",
  description: "A magical seed that accelerates pet growth and development.",
  type: "special",
  rarity: "epic",
  icon: "item_growth_seed",
  effects: [{ type: "growth_bonus", value: 1 }],
  value: 150,
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
  MAGIC_POTION,
  MILK,

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

  // Special items
  CRYSTAL_FRAGMENT,
  ANCIENT_RELIC,
  GROWTH_SEED,
];

// Helper function to get item by ID
export function getItemById(id: string): Item | undefined {
  return ITEMS.find(item => item.id === id);
}

// Helper function to get items by type
export function getItemsByType(type: ItemType): Item[] {
  return ITEMS.filter(item => item.type === type);
}

// Helper function to get items by rarity
export function getItemsByRarity(rarity: ItemRarity): Item[] {
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
