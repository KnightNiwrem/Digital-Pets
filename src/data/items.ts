// Item definitions for the game

import type { Item, ItemType, ItemRarity, ConsumableItem, DurabilityItem } from "@/types/Item";

// Food items
const APPLE: ConsumableItem = {
  id: "apple",
  name: "Fresh Apple",
  description: "A crisp, red apple that pets love. Restores some satiety.",
  type: "consumable" as ItemType,
  rarity: "common" as ItemRarity,
  icon: "item_apple",
  effects: [{ type: "satiety", value: 25 }],
  value: 10,
  stackable: true,
};

const BERRY: ConsumableItem = {
  id: "berry",
  name: "Forest Berry",
  description: "A sweet berry found in the forest. Provides nutrition and a bit of happiness.",
  type: "consumable" as ItemType,
  rarity: "common" as ItemRarity,
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
  type: "consumable" as ItemType,
  rarity: "uncommon" as ItemRarity,
  icon: "item_fish",
  effects: [{ type: "satiety", value: 40 }],
  value: 20,
  stackable: true,
};

const RARE_FISH: ConsumableItem = {
  id: "rare_fish",
  name: "Golden Fish",
  description: "A rare, golden fish that provides exceptional nutrition and energy.",
  type: "consumable" as ItemType,
  rarity: "rare" as ItemRarity,
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
  type: "consumable" as ItemType,
  rarity: "common" as ItemRarity,
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
  type: "medicine" as ItemType,
  rarity: "common" as ItemRarity,
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
  type: "medicine" as ItemType,
  rarity: "common" as ItemRarity,
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
  type: "hygiene" as ItemType,
  rarity: "common" as ItemRarity,
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
  type: "energy_booster" as ItemType,
  rarity: "uncommon" as ItemRarity,
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
  type: "toy" as ItemType,
  rarity: "common" as ItemRarity,
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
  type: "equipment" as ItemType,
  rarity: "uncommon" as ItemRarity,
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
  type: "consumable" as ItemType,
  rarity: "common" as ItemRarity,
  icon: "item_bait",
  effects: [], // used during fishing for better success rates
  value: 5,
  stackable: true,
};

// Export all items
export const ITEMS: Item[] = [
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
