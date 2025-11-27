/**
 * Tutorial quest chain - teaches basic game mechanics.
 */

import {
  ObjectiveType,
  type Quest,
  QuestType,
  RewardType,
} from "@/game/types/quest";

/**
 * Tutorial quest 1: First Steps
 * Teaches the player about basic pet care.
 */
export const tutorialFirstSteps: Quest = {
  id: "tutorial_first_steps",
  name: "First Steps",
  description:
    "Welcome to your new life with your digital pet! Let's learn the basics of pet care.",
  type: QuestType.Tutorial,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "feed_pet",
      type: ObjectiveType.Care,
      description: "Feed your pet",
      target: "feed",
      quantity: 1,
    },
    {
      id: "give_water",
      type: ObjectiveType.Care,
      description: "Give your pet water",
      target: "water",
      quantity: 1,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 50,
    },
    {
      type: RewardType.Item,
      target: "apple",
      quantity: 3,
    },
  ],
  chainNext: "tutorial_exploration",
};

/**
 * Tutorial quest 2: Into the Wild
 * Introduces exploration and foraging.
 */
export const tutorialExploration: Quest = {
  id: "tutorial_exploration",
  name: "Into the Wild",
  description:
    "Now that you know how to care for your pet, it's time to explore the world and gather resources.",
  type: QuestType.Tutorial,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "visit_meadow",
      type: ObjectiveType.Visit,
      description: "Visit the Sunlit Meadow",
      target: "sunlit_meadow",
      quantity: 1,
    },
    {
      id: "forage_once",
      type: ObjectiveType.Explore,
      description: "Complete a foraging session",
      target: "forage",
      quantity: 1,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 75,
    },
    {
      type: RewardType.Item,
      target: "rubber_ball",
      quantity: 1,
    },
  ],
  chainPrevious: "tutorial_first_steps",
  chainNext: "tutorial_training",
};

/**
 * Tutorial quest 3: Growing Stronger
 * Introduces training mechanics.
 */
export const tutorialTraining: Quest = {
  id: "tutorial_training",
  name: "Growing Stronger",
  description:
    "Your pet has great potential! Train to improve their battle stats and prepare for challenges ahead.",
  type: QuestType.Tutorial,
  giverId: "trainer_oak",
  requirements: [],
  objectives: [
    {
      id: "complete_training",
      type: ObjectiveType.Train,
      description: "Complete a training session",
      target: "any",
      quantity: 1,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 100,
    },
    {
      type: RewardType.XP,
      target: "foraging",
      quantity: 25,
    },
  ],
  chainPrevious: "tutorial_exploration",
};

/**
 * All tutorial quests indexed by ID.
 */
export const tutorialQuests: Record<string, Quest> = {
  [tutorialFirstSteps.id]: tutorialFirstSteps,
  [tutorialExploration.id]: tutorialExploration,
  [tutorialTraining.id]: tutorialTraining,
};
