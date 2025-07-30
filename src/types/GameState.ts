// Main game state types and interfaces

import type { Pet } from "./Pet";
import type { Inventory } from "./Item";
import type { WorldState } from "./World";
import type { QuestLog } from "./Quest";
import type { Battle } from "./Battle";

export interface GameSettings {
  // Audio
  masterVolume: number; // 0-1
  musicVolume: number;
  soundEffectsVolume: number;

  // Display
  showNotifications: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  theme: "light" | "dark" | "auto";

  // Gameplay
  autoSave: boolean;
  autoSaveInterval: number; // in ticks
  offlineProgressEnabled: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export interface PlayerStats {
  // Progression
  level: number;
  experience: number;
  experienceToNextLevel: number;

  // Achievements
  totalPetsOwned: number;
  totalQuestsCompleted: number;
  totalBattlesWon: number;
  totalLocationsVisited: number;
  totalPlayTime: number; // in ticks

  // Records
  longestPetLifespan: number;
  highestPetLevel: number;
  mostGoldOwned: number;
  firstPetSpecies: string;
}

export interface GameMetrics {
  // Session data
  sessionStartTime: number;
  ticksThisSession: number;

  // Lifetime data
  totalSessions: number;
  totalTicks: number;
  totalPlayTime: number; // in milliseconds

  // Pet care tracking
  totalFeedings: number;
  totalDrinks: number;
  totalPlays: number;
  totalCleanings: number;
  totalMedicineUsed: number;

  // Activity tracking
  totalBattles: number;
  totalForaging: number;
  totalFishing: number;
  totalMining: number;
  totalTraining: number;

  // Economic tracking
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalItemsUsed: number;
  totalItemsSold: number;
}

export interface SaveMetadata {
  version: string;
  lastSaveTime: number;
  saveCount: number;
  platform: string;
  gameVersion: string;
}

export interface GameState {
  // Save metadata
  metadata: SaveMetadata;

  // Core game data
  currentPet: Pet | null;
  ownedPets: Pet[]; // all pets ever owned
  inventory: Inventory;
  world: WorldState;
  questLog: QuestLog;

  // Current battle (if any)
  currentBattle: Battle | null;

  // Player progression
  playerStats: PlayerStats;

  // Game settings
  settings: GameSettings;

  // Metrics and analytics
  metrics: GameMetrics;

  // Game time tracking
  gameTime: {
    totalTicks: number;
    lastTickTime: number;
    isPaused: boolean;
  };

  // Tutorial and onboarding
  tutorial: {
    completed: boolean;
    currentStep: string | null;
    skippedSteps: string[];
  };

  // Achievement tracking
  achievements: {
    [achievementId: string]: {
      unlocked: boolean;
      unlockedAt?: number;
      progress?: number;
    };
  };

  // Notification queue
  notifications: GameNotification[];
}

export interface GameNotification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "achievement";
  title: string;
  message: string;
  timestamp: number;
  duration?: number; // auto-dismiss time in ms
  actions?: NotificationAction[];
  read: boolean;
}

export interface NotificationAction {
  label: string;
  action: "dismiss" | "navigate" | "custom";
  target?: string; // navigation target or custom action ID
}

export interface GameAction {
  type: string;
  payload: Record<string, string | number | boolean>;
  timestamp: number;
  source: "player" | "system" | "tick";
}

export interface GameTick {
  tickNumber: number;
  timestamp: number;
  duration: number; // actual processing time
  actions: GameAction[];
  stateChanges: string[]; // list of what changed this tick
}

// Game constants
export const GAME_CONSTANTS = {
  SAVE_VERSION: "1.0.0",
  TICK_INTERVAL: 15000, // 15 seconds
  AUTO_SAVE_INTERVAL: 4, // every 4 ticks (1 minute)
  MAX_NOTIFICATIONS: 50,
  MAX_SAVE_STATES: 5, // number of backup saves to keep

  // Starting values
  STARTING_GOLD: 100,
  STARTING_INVENTORY_SLOTS: 20,
  STARTING_LEVEL: 1,

  // Progression
  BASE_EXPERIENCE_PER_LEVEL: 100,
  EXPERIENCE_MULTIPLIER: 1.5,
} as const;

// Default values for new game state
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  masterVolume: 0.7,
  musicVolume: 0.8,
  soundEffectsVolume: 0.6,
  showNotifications: true,
  animationSpeed: "normal",
  theme: "auto",
  autoSave: true,
  autoSaveInterval: 4,
  offlineProgressEnabled: true,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
};

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  totalPetsOwned: 0,
  totalQuestsCompleted: 0,
  totalBattlesWon: 0,
  totalLocationsVisited: 1, // starting location
  totalPlayTime: 0,
  longestPetLifespan: 0,
  highestPetLevel: 0,
  mostGoldOwned: 100,
  firstPetSpecies: "",
};
