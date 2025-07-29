// Battle system types and interfaces

export type BattleType = "wild" | "trainer" | "tournament" | "training";

export type BattleStatus = "waiting" | "in_progress" | "victory" | "defeat" | "fled";

export type MoveCategory = "physical" | "special" | "status";

export interface BattleMove {
  id: string;
  name: string;
  description: string;
  category: MoveCategory;
  power: number;
  accuracy: number;
  energyCost: number;
  priority: number; // higher goes first
  effects: BattleMoveEffect[];
  targetType: "self" | "opponent" | "both";
}

export interface BattleMoveEffect {
  type: "damage" | "heal" | "stat_change" | "status_effect";
  value: number;
  stat?: "attack" | "defense" | "speed" | "accuracy" | "evasion";
  statusEffect?: StatusEffect;
  probability?: number; // chance for effect to occur
}

export interface StatusEffect {
  id: string;
  name: string;
  description: string;
  duration: number; // turns remaining
  tickDamage?: number; // damage per turn
  statModifiers?: {
    attack?: number;
    defense?: number;
    speed?: number;
    accuracy?: number;
    evasion?: number;
  };
}

export interface BattlePet {
  // Copy of Pet data for battle (immutable during battle)
  id: string;
  name: string;
  species: string;

  // Battle stats
  currentHealth: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  accuracy: number;
  evasion: number;

  // Battle-specific state
  currentEnergy: number;
  maxEnergy: number;
  moves: BattleMove[];
  statusEffects: StatusEffect[];

  // Temporary battle modifiers
  tempStatModifiers: {
    attack: number;
    defense: number;
    speed: number;
    accuracy: number;
    evasion: number;
  };
}

export interface BattleAction {
  type: "move" | "flee" | "use_item";
  moveId?: string;
  itemId?: string;
  petId: string;
  priority: number;
  timestamp: number;
}

export interface BattleTurn {
  turnNumber: number;
  playerAction: BattleAction;
  opponentAction: BattleAction;
  results: BattleResult[];
  timestamp: number;
}

export interface BattleResult {
  type: "damage" | "heal" | "miss" | "critical" | "status_applied" | "status_removed" | "stat_changed";
  targetId: string;
  sourceId: string;
  value?: number;
  moveId?: string;
  statusEffect?: StatusEffect;
  message: string;
}

export interface Battle {
  id: string;
  type: BattleType;
  status: BattleStatus;

  // Participants
  playerPet: BattlePet;
  opponentPet: BattlePet;

  // Battle flow
  currentTurn: number;
  turns: BattleTurn[];
  turnPhase: "select_action" | "execute_actions" | "end_turn";

  // Rewards
  experience: number;
  goldReward: number;
  itemRewards: string[]; // item IDs

  // Metadata
  startTime: number;
  endTime?: number;
  location: string;
}

export interface TrainingFacility {
  id: string;
  name: string;
  description: string;
  location: string;

  // Training options
  statTraining: StatTraining[];
  moveTraining: MoveTraining[];

  // Requirements
  cost: number;
  unlockRequirements?: ActivityRequirement[];
}

export interface StatTraining {
  id: string;
  name: string;
  stat: "attack" | "defense" | "speed" | "health";
  improvement: number;
  energyCost: number;
  duration: number; // in ticks
  cost: number;
}

export interface MoveTraining {
  id: string;
  moveId: string;
  name: string;
  description: string;
  energyCost: number;
  duration: number;
  cost: number;
  requirements?: {
    level?: number;
    moves?: string[]; // prerequisite moves
    species?: string[];
  };
}

export interface BattleEncounter {
  id: string;
  name: string;
  location: string;
  probability: number;
  opponentSpecies: string;
  opponentLevel: number;
  rewards: {
    experience: number;
    gold: number;
    items: { itemId: string; probability: number }[];
  };
}

import type { ActivityRequirement } from "./World";

// Battle constants
export const BATTLE_CONSTANTS = {
  MAX_MOVES_PER_PET: 4,
  CRITICAL_HIT_CHANCE: 0.0625, // 1/16
  CRITICAL_HIT_MULTIPLIER: 1.5,
  BASE_ACCURACY: 100,
  MAX_STATUS_EFFECTS: 5,
  FLEE_SUCCESS_RATE: 0.8,
} as const;
