// Move definitions for battle system

import type { BattleMove } from "@/types/Battle";

// Basic physical attacks
const TACKLE: BattleMove = {
  id: "tackle",
  name: "Tackle",
  description: "A simple physical attack that deals moderate damage.",
  category: "physical",
  power: 25,
  accuracy: 95,
  energyCost: 10,
  priority: 0,
  effects: [],
  targetType: "opponent",
};

const SCRATCH: BattleMove = {
  id: "scratch",
  name: "Scratch",
  description: "A quick scratch attack with good accuracy.",
  category: "physical",
  power: 20,
  accuracy: 100,
  energyCost: 8,
  priority: 0,
  effects: [],
  targetType: "opponent",
};

const BITE: BattleMove = {
  id: "bite",
  name: "Bite",
  description: "A strong bite attack that may cause the opponent to flinch.",
  category: "physical",
  power: 30,
  accuracy: 90,
  energyCost: 12,
  priority: 0,
  effects: [
    {
      type: "status_effect",
      value: 0,
      statusEffect: {
        id: "flinch",
        name: "Flinched",
        description: "Unable to act this turn",
        duration: 1,
      },
      probability: 0.3,
    },
  ],
  targetType: "opponent",
};

// Special attacks
const ENERGY_BLAST: BattleMove = {
  id: "energy_blast",
  name: "Energy Blast",
  description: "A concentrated burst of energy that deals special damage.",
  category: "special",
  power: 35,
  accuracy: 85,
  energyCost: 15,
  priority: 0,
  effects: [],
  targetType: "opponent",
};

const WATER_SPLASH: BattleMove = {
  id: "water_splash",
  name: "Water Splash",
  description: "A refreshing water attack that may lower opponent's accuracy.",
  category: "special",
  power: 28,
  accuracy: 95,
  energyCost: 12,
  priority: 0,
  effects: [
    {
      type: "stat_change",
      value: -10,
      stat: "accuracy",
      probability: 0.4,
    },
  ],
  targetType: "opponent",
};

// Status moves
const FOCUS: BattleMove = {
  id: "focus",
  name: "Focus",
  description: "Concentrates energy to boost attack power.",
  category: "status",
  power: 0,
  accuracy: 100,
  energyCost: 8,
  priority: 0,
  effects: [
    {
      type: "stat_change",
      value: 20,
      stat: "attack",
    },
  ],
  targetType: "self",
};

const DEFEND: BattleMove = {
  id: "defend",
  name: "Defend",
  description: "Takes a defensive stance to boost defense.",
  category: "status",
  power: 0,
  accuracy: 100,
  energyCost: 6,
  priority: 0,
  effects: [
    {
      type: "stat_change",
      value: 25,
      stat: "defense",
    },
  ],
  targetType: "self",
};

const QUICK_STEP: BattleMove = {
  id: "quick_step",
  name: "Quick Step",
  description: "Increases speed for faster attacks.",
  category: "status",
  power: 0,
  accuracy: 100,
  energyCost: 10,
  priority: 0,
  effects: [
    {
      type: "stat_change",
      value: 30,
      stat: "speed",
    },
  ],
  targetType: "self",
};

// Healing moves
const RECOVER: BattleMove = {
  id: "recover",
  name: "Recover",
  description: "Restores health by concentrating energy.",
  category: "status",
  power: 0,
  accuracy: 100,
  energyCost: 20,
  priority: 0,
  effects: [
    {
      type: "heal",
      value: 50, // restores 50% of max health
    },
  ],
  targetType: "self",
};

// Advanced moves
const POWER_STRIKE: BattleMove = {
  id: "power_strike",
  name: "Power Strike",
  description: "A devastating attack with high critical hit chance.",
  category: "physical",
  power: 45,
  accuracy: 80,
  energyCost: 25,
  priority: 0,
  effects: [
    {
      type: "damage",
      value: 1.5, // 50% chance for 1.5x damage (critical)
      probability: 0.25,
    },
  ],
  targetType: "opponent",
};

const CONFUSION_RAY: BattleMove = {
  id: "confusion_ray",
  name: "Confusion Ray",
  description: "A mysterious ray that confuses the opponent.",
  category: "status",
  power: 0,
  accuracy: 75,
  energyCost: 18,
  priority: 0,
  effects: [
    {
      type: "status_effect",
      value: 0,
      statusEffect: {
        id: "confused",
        name: "Confused",
        description: "May attack itself instead of the opponent",
        duration: 3,
      },
      probability: 1.0,
    },
  ],
  targetType: "opponent",
};

const ENERGY_DRAIN: BattleMove = {
  id: "energy_drain",
  name: "Energy Drain",
  description: "Drains opponent's energy and restores your own.",
  category: "special",
  power: 20,
  accuracy: 90,
  energyCost: 15,
  priority: 0,
  effects: [
    {
      type: "heal",
      value: 25, // restores energy based on damage dealt
    },
  ],
  targetType: "opponent",
};

// Export all moves
export const MOVES: BattleMove[] = [
  TACKLE,
  SCRATCH,
  BITE,
  ENERGY_BLAST,
  WATER_SPLASH,
  FOCUS,
  DEFEND,
  QUICK_STEP,
  RECOVER,
  POWER_STRIKE,
  CONFUSION_RAY,
  ENERGY_DRAIN,
];

// Helper function to get move by ID
export function getMoveById(id: string): BattleMove | undefined {
  return MOVES.find(move => move.id === id);
}

// Helper function to get starter moves (basic moves for new pets)
export function getStarterMoves(): BattleMove[] {
  return [TACKLE, SCRATCH, FOCUS, DEFEND];
}
