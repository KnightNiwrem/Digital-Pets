// World system types and interfaces

export type LocationType = "town" | "city" | "forest" | "beach" | "mountain" | "cave" | "desert" | "ruins";

export type ActivityType = "foraging" | "fishing" | "mining" | "training";

export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  description: string;
  energyCost: number;
  duration: number; // in ticks
  rewards: ActivityReward[];
  requirements?: ActivityRequirement[];
}

export interface ActivityReward {
  type: "item" | "gold" | "experience";
  id?: string; // item ID if type is "item"
  amount: number;
  probability: number; // 0-1, chance of getting this reward
}

export interface ActivityRequirement {
  type: "level" | "item" | "quest_completed" | "pet_species";
  value: string | number;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  description: string;
  activities: Activity[];
  shops: Shop[];
  npcs: NPC[];
  connections: LocationConnection[];
  unlockRequirements?: ActivityRequirement[];
  sprite: string;
  background: string;
}

export interface LocationConnection {
  destinationId: string;
  travelTime: number; // in ticks
  cost?: number; // gold cost for travel
  requirements?: ActivityRequirement[];
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  keeper: string; // NPC name
  items: ShopItem[];
  refreshTime?: number; // ticks until inventory refresh
}

export interface ShopItem {
  itemId: string;
  price: number;
  stock: number; // -1 for infinite
  probability?: number; // chance to appear in shop
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  sprite: string;
  dialogue: DialogueNode[];
  quests: string[]; // quest IDs
  shop?: string; // shop ID if NPC is a shopkeeper
}

export interface DialogueNode {
  id: string;
  text: string;
  conditions?: DialogueCondition[];
  responses?: DialogueResponse[];
  effects?: DialogueEffect[];
}

export interface DialogueCondition {
  type: "quest_status" | "item_owned" | "pet_species" | "location";
  questId?: string;
  itemId?: string;
  species?: string;
  status?: "active" | "completed" | "not_started";
  operator?: "equals" | "greater_than" | "less_than";
  value?: number;
}

export interface DialogueResponse {
  id: string;
  text: string;
  nextNodeId?: string;
  conditions?: DialogueCondition[];
  effects?: DialogueEffect[];
}

export interface DialogueEffect {
  type: "start_quest" | "complete_quest" | "give_item" | "take_item" | "give_gold" | "take_gold";
  questId?: string;
  itemId?: string;
  amount?: number;
}

export interface TravelState {
  destinationId: string;
  ticksRemaining: number;
  totalTravelTime: number;
  startTime: number;
}

export interface WorldState {
  currentLocationId: string;
  unlockedLocations: string[];
  visitedLocations: string[];
  travelState?: TravelState;
  activeActivities: ActiveActivity[];
}

export interface ActiveActivity {
  activityId: string;
  locationId: string;
  startTime: number;
  ticksRemaining: number;
  petId: string;
}

export interface CompletedActivityInfo {
  activityId: string;
  locationId: string;
  activityType: ActivityType;
  duration: number;
  rewards: ActivityReward[];
}

// World constants
export const WORLD_CONSTANTS = {
  STARTING_LOCATION: "hometown",
  FORAGING_BASE_TIME: 20, // base ticks for foraging
  FISHING_BASE_TIME: 30,
  MINING_BASE_TIME: 40,
  TRAINING_BASE_TIME: 60,
} as const;
