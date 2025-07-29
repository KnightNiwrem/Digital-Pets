// Location definitions for the game world

import type { Location, LocationType } from "@/types/World";

// Starting location - peaceful hometown
const HOMETOWN: Location = {
  id: "hometown",
  name: "Hometown",
  type: "town" as LocationType,
  description: "A peaceful town where your journey with your digital pet begins. The local shop has basic supplies.",
  activities: [
    {
      id: "hometown_foraging",
      name: "Forage in Town Square",
      type: "foraging",
      description: "Look for small items around the town square",
      energyCost: 10,
      duration: 20, // 5 minutes
      rewards: [
        { type: "item", id: "apple", amount: 1, probability: 0.6 },
        { type: "item", id: "water_bottle", amount: 1, probability: 0.4 },
        { type: "gold", amount: 5, probability: 0.3 },
      ],
    },
  ],
  shops: [
    {
      id: "hometown_general_store",
      name: "General Store",
      description: "A small shop with basic pet care supplies",
      keeper: "shopkeeper_sam",
      items: [
        { itemId: "apple", price: 10, stock: -1 },
        { itemId: "water_bottle", price: 8, stock: -1 },
        { itemId: "basic_medicine", price: 25, stock: 5 },
        { itemId: "soap", price: 15, stock: -1 },
      ],
    },
  ],
  npcs: [
    {
      id: "shopkeeper_sam",
      name: "Sam",
      description: "The friendly owner of the general store",
      sprite: "npc_sam",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to my shop! I have everything you need to care for your pet.",
          responses: [
            {
              id: "browse",
              text: "I'd like to browse your items.",
              effects: [{ type: "start_quest", questId: "shop_tutorial" }],
            },
            {
              id: "goodbye",
              text: "Thanks, I'll come back later.",
              nextNodeId: "farewell",
            },
          ],
        },
        {
          id: "farewell",
          text: "Come back anytime! Take good care of your pet.",
        },
      ],
      quests: ["shop_tutorial"],
      shop: "hometown_general_store",
    },
  ],
  connections: [
    {
      destinationId: "forest_path",
      travelTime: 60, // 15 minutes
      requirements: [{ type: "level", value: 2 }],
    },
  ],
  sprite: "location_hometown",
  background: "bg_hometown",
};

// First explorable area
const FOREST_PATH: Location = {
  id: "forest_path",
  name: "Forest Path",
  type: "forest" as LocationType,
  description: "A winding path through a peaceful forest. Good for foraging and meeting wild pets.",
  activities: [
    {
      id: "forest_foraging",
      name: "Forage for Berries",
      type: "foraging",
      description: "Search for berries and herbs in the forest undergrowth",
      energyCost: 15,
      duration: 30, // 7.5 minutes
      rewards: [
        { type: "item", id: "berry", amount: 1, probability: 0.8 },
        { type: "item", id: "herb", amount: 1, probability: 0.5 },
        { type: "gold", amount: 8, probability: 0.4 },
      ],
    },
    {
      id: "forest_training",
      name: "Basic Training",
      type: "training",
      description: "Practice basic moves with your pet in the peaceful forest",
      energyCost: 20,
      duration: 60, // 15 minutes
      rewards: [{ type: "experience", amount: 10, probability: 1.0 }],
    },
  ],
  shops: [],
  npcs: [
    {
      id: "forest_ranger",
      name: "Forest Ranger",
      description: "A knowledgeable ranger who protects the forest",
      sprite: "npc_ranger",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to the forest! Be careful not to stray too far from the path.",
          responses: [
            {
              id: "ask_advice",
              text: "Any advice for new trainers?",
              nextNodeId: "advice",
            },
            {
              id: "goodbye",
              text: "Thanks for the warning!",
              nextNodeId: "farewell",
            },
          ],
        },
        {
          id: "advice",
          text: "Train your pet regularly and keep them well-fed. The forest is full of opportunities to grow stronger!",
        },
        {
          id: "farewell",
          text: "Safe travels! Come back if you need guidance.",
        },
      ],
      quests: ["forest_exploration"],
    },
  ],
  connections: [
    {
      destinationId: "hometown",
      travelTime: 60, // 15 minutes back
    },
    {
      destinationId: "riverside",
      travelTime: 80, // 20 minutes
      requirements: [{ type: "level", value: 5 }],
    },
  ],
  unlockRequirements: [{ type: "level", value: 2 }],
  sprite: "location_forest",
  background: "bg_forest",
};

// Fishing area
const RIVERSIDE: Location = {
  id: "riverside",
  name: "Peaceful Riverside",
  type: "beach" as LocationType,
  description: "A calm river flows through this scenic area. Perfect for fishing and relaxation.",
  activities: [
    {
      id: "riverside_fishing",
      name: "Fish in the River",
      type: "fishing",
      description: "Cast your line and try to catch fresh fish",
      energyCost: 25,
      duration: 45, // 11.25 minutes
      rewards: [
        { type: "item", id: "fish", amount: 1, probability: 0.7 },
        { type: "item", id: "rare_fish", amount: 1, probability: 0.2 },
        { type: "gold", amount: 15, probability: 0.5 },
      ],
      requirements: [{ type: "item", value: "fishing_rod" }],
    },
    {
      id: "riverside_rest",
      name: "Rest by the Water",
      type: "foraging",
      description: "Relax by the peaceful water and restore energy",
      energyCost: -10, // actually restores energy
      duration: 30,
      rewards: [{ type: "experience", amount: 5, probability: 1.0 }],
    },
  ],
  shops: [
    {
      id: "riverside_fishing_shop",
      name: "Angler's Supplies",
      description: "A small stall selling fishing equipment and fresh catch",
      keeper: "angler_joe",
      items: [
        { itemId: "fishing_rod", price: 100, stock: 1 },
        { itemId: "fish", price: 20, stock: 3 },
        { itemId: "bait", price: 5, stock: 20 },
      ],
    },
  ],
  npcs: [
    {
      id: "angler_joe",
      name: "Joe the Angler",
      description: "An experienced fisherman who knows all the best spots",
      sprite: "npc_angler",
      dialogue: [
        {
          id: "greeting",
          text: "Perfect day for fishing! The fish are really biting today.",
          responses: [
            {
              id: "buy_rod",
              text: "I need a fishing rod.",
              nextNodeId: "sell_rod",
            },
            {
              id: "fishing_tips",
              text: "Any fishing tips?",
              nextNodeId: "tips",
            },
          ],
        },
        {
          id: "sell_rod",
          text: "This rod will serve you well! Just 100 gold and you'll be catching fish in no time.",
        },
        {
          id: "tips",
          text: "Patience is key! Also, different bait works better for different fish.",
        },
      ],
      quests: ["fishing_lesson"],
      shop: "riverside_fishing_shop",
    },
  ],
  connections: [
    {
      destinationId: "forest_path",
      travelTime: 80, // 20 minutes back
    },
  ],
  unlockRequirements: [{ type: "level", value: 5 }],
  sprite: "location_riverside",
  background: "bg_riverside",
};

// Export all locations
export const LOCATIONS: Location[] = [HOMETOWN, FOREST_PATH, RIVERSIDE];

// Helper function to get location by ID
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find(location => location.id === id);
}

// Helper function to get starting location
export function getStartingLocation(): Location {
  return HOMETOWN;
}

// Helper function to get available destinations from a location
export function getAvailableDestinations(fromLocationId: string): Location[] {
  const location = getLocationById(fromLocationId);
  if (!location) return [];

  return location.connections
    .map(connection => getLocationById(connection.destinationId))
    .filter((dest): dest is Location => dest !== undefined);
}
