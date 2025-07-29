// Pet system types and interfaces

export type PetRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type HealthState = "healthy" | "injured" | "sick";

export type PetState = "idle" | "sleeping" | "travelling";

export interface PetSpecies {
  id: string;
  name: string;
  rarity: PetRarity;
  description: string;
  baseStats: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
  };
  growthRates: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
    energy: number;
  };
  // Assets
  sprite: string;
  icon: string;
}

export interface Move {
  id: string;
  name: string;
  description: string;
  damage: number;
  energyCost: number;
  accuracy: number;
  type: string;
  effects?: MoveEffect[];
}

export interface MoveEffect {
  type: "heal" | "buff" | "debuff" | "status";
  value: number;
  duration?: number;
  target: "self" | "opponent";
}

export interface Pet {
  // Basic Info
  id: string;
  name: string;
  species: PetSpecies;
  rarity: PetRarity;
  growthStage: number; // 0-49 (50 stages total)

  // Care Stats (displayed to user)
  satiety: number;
  hydration: number;
  happiness: number;

  // Hidden Counters (internal mechanics)
  satietyTicksLeft: number;
  hydrationTicksLeft: number;
  happinessTicksLeft: number;
  poopTicksLeft: number;
  sickByPoopTicksLeft: number;

  // Core Stats
  life: number; // max 1,000,000
  maxEnergy: number; // increases per growth stage, starts at 100
  currentEnergy: number;
  health: HealthState;
  state: PetState;

  // Battle Stats
  attack: number;
  defense: number;
  speed: number;
  maxHealth: number;
  currentHealth: number;
  moves: Move[];

  // Metadata
  birthTime: number; // timestamp
  lastCareTime: number; // timestamp
  totalLifetime: number; // total ticks alive
}

export interface PetCareAction {
  type: "feed" | "drink" | "play" | "clean" | "medicine" | "sleep" | "wake";
  itemId?: string; // for consumables/medicine
  timestamp: number;
  energyCost?: number;
}

export interface PetGrowthStage {
  stage: number;
  name: string;
  description: string;
  requiredLifetime: number; // ticks needed to reach this stage
  energyIncrease: number;
  statMultipliers: {
    attack: number;
    defense: number;
    speed: number;
    health: number;
  };
  unlockedMoves?: string[]; // move IDs
}

// Constants for pet care mechanics
export const PET_CONSTANTS = {
  TICK_INTERVAL: 15000, // 15 seconds in milliseconds
  MAX_LIFE: 1_000_000,
  STARTING_ENERGY: 100,
  GROWTH_STAGES: 50,

  // Life changes per tick
  LIFE_DECREASE: {
    injured: 100,
    sick: 200,
    noSatiety: 300,
    noHydration: 500,
    finalStage: 1,
  },
  LIFE_RECOVERY: 1,

  // Poop system
  SICK_BY_POOP_TICKS: 17_280, // 72 hours worth of ticks

  // Stat display calculation
  STAT_MULTIPLIER: {
    SATIETY: 100,
    HYDRATION: 80,
    HAPPINESS: 120,
  },
} as const;
