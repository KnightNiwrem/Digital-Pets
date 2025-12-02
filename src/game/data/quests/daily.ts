/**
 * Daily quests - repeatable quests that reset daily.
 */

import {
  ObjectiveType,
  type Quest,
  QuestType,
  RewardType,
} from "@/game/types/quest";

/**
 * Daily Quest: Care Routine
 * Basic daily care quest.
 */
export const dailyCareRoutine: Quest = {
  id: "daily_care_routine",
  name: "Care Routine",
  description:
    "Keep your pet happy and healthy! Feed and hydrate your pet today.",
  type: QuestType.Daily,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "feed_pet",
      type: ObjectiveType.Care,
      description: "Feed your pet",
      target: "feed",
      quantity: 2,
    },
    {
      id: "water_pet",
      type: ObjectiveType.Care,
      description: "Give your pet water",
      target: "water",
      quantity: 2,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 25,
    },
  ],
};

/**
 * Daily Quest: Daily Forager
 * Encourages exploration every day.
 */
export const dailyForager: Quest = {
  id: "daily_forager",
  name: "Daily Forager",
  description: "Venture out and gather some resources today.",
  type: QuestType.Daily,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "forage_once",
      type: ObjectiveType.Explore,
      description: "Complete foraging sessions",
      target: "foraging",
      quantity: 3,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 30,
    },
    {
      type: RewardType.XP,
      target: "foraging",
      quantity: 15,
    },
  ],
};

/**
 * Daily Quest: Battle Practice
 * Daily battle quest.
 */
export const dailyBattlePractice: Quest = {
  id: "daily_battle_practice",
  name: "Battle Practice",
  description: "Keep your battle skills sharp with daily practice.",
  type: QuestType.Daily,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "win_battles",
      type: ObjectiveType.Defeat,
      description: "Win battles",
      target: "any",
      quantity: 3,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 40,
    },
    {
      type: RewardType.XP,
      target: "social",
      quantity: 10,
    },
  ],
};

/**
 * Daily Quest: Training Session
 * Daily training quest.
 */
export const dailyTrainingSession: Quest = {
  id: "daily_training_session",
  name: "Training Session",
  description: "Train your pet to help it grow stronger.",
  type: QuestType.Daily,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "complete_training",
      type: ObjectiveType.Train,
      description: "Complete training sessions",
      target: "any",
      quantity: 2,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 35,
    },
  ],
};

/**
 * Daily Quest: Cleanup Duty
 * Keep things tidy.
 */
export const dailyCleanupDuty: Quest = {
  id: "daily_cleanup_duty",
  name: "Cleanup Duty",
  description: "A clean space is a happy space. Keep things tidy!",
  type: QuestType.Daily,
  giverId: "shopkeeper_mira",
  requirements: [],
  objectives: [
    {
      id: "clean_poop",
      type: ObjectiveType.Care,
      description: "Clean up after your pet",
      target: "clean",
      quantity: 3,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 20,
    },
    {
      type: RewardType.Item,
      target: "cleaning_wipes",
      quantity: 2,
    },
  ],
};

/**
 * All daily quests indexed by ID.
 */
export const dailyQuests: Record<string, Quest> = {
  [dailyCareRoutine.id]: dailyCareRoutine,
  [dailyForager.id]: dailyForager,
  [dailyBattlePractice.id]: dailyBattlePractice,
  [dailyTrainingSession.id]: dailyTrainingSession,
  [dailyCleanupDuty.id]: dailyCleanupDuty,
};
