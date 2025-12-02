/**
 * Weekly quests - repeatable quests that reset every Monday.
 */

import {
  ObjectiveType,
  type Quest,
  QuestType,
  RewardType,
} from "@/game/types/quest";

/**
 * Weekly Quest: Weekly Caretaker
 * Comprehensive care quest for the week.
 */
export const weeklyCaretaker: Quest = {
  id: "weekly_caretaker",
  name: "Weekly Caretaker",
  description:
    "Show dedication to your pet's wellbeing throughout the week. Feed, hydrate, and play with your pet regularly.",
  type: QuestType.Weekly,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "feed_pet_weekly",
      type: ObjectiveType.Care,
      description: "Feed your pet",
      target: "feed",
      quantity: 14,
    },
    {
      id: "water_pet_weekly",
      type: ObjectiveType.Care,
      description: "Give your pet water",
      target: "water",
      quantity: 14,
    },
    {
      id: "play_pet_weekly",
      type: ObjectiveType.Care,
      description: "Play with your pet",
      target: "play",
      quantity: 7,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 200,
    },
  ],
};

/**
 * Weekly Quest: Weekly Explorer
 * Exploration goals for the week.
 */
export const weeklyExplorer: Quest = {
  id: "weekly_explorer",
  name: "Weekly Explorer",
  description: "Explore the world and gather resources throughout the week.",
  type: QuestType.Weekly,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "forage_weekly",
      type: ObjectiveType.Explore,
      description: "Complete foraging sessions",
      target: "foraging",
      quantity: 15,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 250,
    },
    {
      type: RewardType.XP,
      target: "foraging",
      quantity: 100,
    },
  ],
};

/**
 * Weekly Quest: Weekly Warrior
 * Battle goals for the week.
 */
export const weeklyWarrior: Quest = {
  id: "weekly_warrior",
  name: "Weekly Warrior",
  description:
    "Prove your combat prowess by winning battles throughout the week.",
  type: QuestType.Weekly,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "win_battles_weekly",
      type: ObjectiveType.Defeat,
      description: "Win battles",
      target: "any",
      quantity: 15,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 300,
    },
    {
      type: RewardType.XP,
      target: "social",
      quantity: 75,
    },
  ],
};

/**
 * Weekly Quest: Weekly Trainer
 * Training goals for the week.
 */
export const weeklyTrainer: Quest = {
  id: "weekly_trainer",
  name: "Weekly Trainer",
  description: "Dedicate time to training your pet throughout the week.",
  type: QuestType.Weekly,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "training_weekly",
      type: ObjectiveType.Train,
      description: "Complete training sessions",
      target: "any",
      quantity: 10,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 275,
    },
  ],
};

/**
 * All weekly quests indexed by ID.
 */
export const weeklyQuests: Record<string, Quest> = {
  [weeklyCaretaker.id]: weeklyCaretaker,
  [weeklyExplorer.id]: weeklyExplorer,
  [weeklyWarrior.id]: weeklyWarrior,
  [weeklyTrainer.id]: weeklyTrainer,
};
