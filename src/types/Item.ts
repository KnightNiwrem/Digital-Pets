// Item system types and interfaces

export type ItemType = "consumable" | "toy" | "medicine" | "hygiene" | "energy_booster" | "equipment";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemEffect {
  type: "satiety" | "hydration" | "happiness" | "energy" | "health" | "cure" | "clean";
  value: number;
  duration?: number; // for temporary effects
}

export interface BaseItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  effects: ItemEffect[];
  value: number; // shop price/sell value
}

export interface ConsumableItem extends BaseItem {
  type: "consumable" | "medicine" | "hygiene" | "energy_booster";
  stackable: true;
}

export interface DurabilityItem extends BaseItem {
  type: "toy" | "equipment";
  stackable: false;
  maxDurability: number;
  currentDurability: number;
  durabilityLossPerUse: number;
}

export type Item = ConsumableItem | DurabilityItem;

export interface InventorySlot {
  item: Item;
  quantity: number;
  slotIndex: number;
}

export interface Inventory {
  slots: InventorySlot[];
  maxSlots: number;
  gold: number;
}

export interface ItemUsage {
  itemId: string;
  petId: string;
  timestamp: number;
  effects: ItemEffect[];
  success: boolean;
  message?: string;
}

// Predefined item categories for organization
export const ITEM_CATEGORIES = {
  FOOD: "food",
  DRINKS: "drinks",
  TOYS: "toys",
  MEDICINE: "medicine",
  HYGIENE: "hygiene",
  ENERGY: "energy",
  EQUIPMENT: "equipment",
} as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[keyof typeof ITEM_CATEGORIES];

// Item constants
export const ITEM_CONSTANTS = {
  MAX_INVENTORY_SLOTS: 50,
  MAX_STACK_SIZE: 99,
  DURABILITY_WARNING_THRESHOLD: 10, // warn when durability below this
} as const;
