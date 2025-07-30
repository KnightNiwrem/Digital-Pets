// Quest system types and interfaces

export type QuestType = "collection" | "delivery" | "exploration" | "battle" | "care" | "story";

export type QuestStatus = "not_started" | "available" | "active" | "completed" | "failed";

export type ObjectiveType =
  | "collect_item"
  | "deliver_item"
  | "visit_location"
  | "defeat_pet"
  | "care_action"
  | "reach_level"
  | "complete_quest";

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;

  // Objective-specific parameters
  itemId?: string;
  locationId?: string;
  petSpecies?: string;
  careAction?: string;
  questId?: string;

  // Progress tracking
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
}

export interface QuestReward {
  type: "item" | "gold" | "experience" | "unlock_location" | "unlock_pet" | "unlock_quest";
  itemId?: string;
  locationId?: string;
  petSpecies?: string;
  questId?: string;
  amount: number;
}

export interface QuestRequirement {
  type: "level" | "quest_completed" | "location_visited" | "item_owned" | "pet_species";
  questId?: string;
  locationId?: string;
  itemId?: string;
  petSpecies?: string;
  value?: number;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;

  // Quest flow
  status: QuestStatus;
  objectives: QuestObjective[];
  requirements: QuestRequirement[];
  rewards: QuestReward[];

  // Quest giver
  npcId: string;
  location: string;

  // Story elements
  dialogue: {
    start: string;
    progress: string;
    complete: string;
  };

  // Metadata
  isMainQuest: boolean;
  chapter?: number;
  order?: number; // for ordering in quest log

  // Timing
  startTime?: number;
  completeTime?: number;
  timeLimit?: number; // optional time limit in ticks
}

export interface QuestProgress {
  questId: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  startTime?: number;
  completeTime?: number;
  variables?: Record<string, string | number | boolean>; // for complex quest state
}

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  quests: string[]; // quest IDs in order
  currentQuestIndex: number;
  completed: boolean;
}

export interface QuestLog {
  activeQuests: QuestProgress[];
  completedQuests: string[]; // quest IDs
  failedQuests: string[];
  availableQuests: string[];
  questChains: QuestChain[];
}

export interface QuestEvent {
  type: "quest_started" | "quest_completed" | "objective_completed" | "quest_failed";
  questId: string;
  objectiveId?: string;
  timestamp: number;
  data?: Record<string, string | number | boolean | string[]>;
}

// Quest constants
export const QUEST_CONSTANTS = {
  MAX_ACTIVE_QUESTS: 10,
  QUEST_COMPLETION_NOTIFICATION_DURATION: 5000, // 5 seconds
} as const;

// Helper type for quest validation
export interface QuestValidator {
  canStartQuest(quest: Quest, playerData: PlayerStats): boolean;
  canCompleteObjective(objective: QuestObjective, action: GameAction): boolean;
  getAvailableQuests(allQuests: Quest[], playerData: PlayerStats): Quest[];
}

interface PlayerStats {
  level: number;
  experience: number;
  [key: string]: string | number | boolean;
}

interface GameAction {
  type: string;
  payload: Record<string, string | number | boolean>;
  timestamp: number;
  source: "player" | "system" | "tick";
}
