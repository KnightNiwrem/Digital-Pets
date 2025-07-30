// Quest definitions for the game

import type { Quest } from "@/types/Quest";

// Tutorial/Starter quests
const SHOP_TUTORIAL: Quest = {
  id: "shop_tutorial",
  name: "First Purchase",
  description: "Learn how to buy items from the shop by purchasing your first apple.",
  type: "story",
  status: "not_started",
  objectives: [
    {
      id: "buy_apple",
      type: "collect_item",
      description: "Buy an apple from the General Store",
      itemId: "apple",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "pet_care_basics" }],
  rewards: [
    { type: "gold", amount: 15 },
    { type: "experience", amount: 10 },
  ],
  npcId: "shopkeeper_sam",
  location: "hometown",
  dialogue: {
    start: "Welcome to my shop! Let me teach you how to buy items. Try purchasing an apple.",
    progress: "Great choice! Apples are perfect for keeping your pet fed.",
    complete: "Excellent! You're getting the hang of shopping. Come back anytime you need supplies!",
  },
  isMainQuest: true,
  chapter: 1,
  order: 1,
};

const FOREST_EXPLORATION: Quest = {
  id: "forest_exploration",
  name: "Forest Discovery",
  description: "Explore the Forest Path and learn about foraging for resources.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "visit_forest",
      type: "visit_location",
      description: "Travel to the Forest Path",
      locationId: "forest_path",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "forage_berries",
      type: "collect_item",
      description: "Forage for 3 berries in the forest",
      itemId: "berry",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "shop_tutorial" }],
  rewards: [
    { type: "item", itemId: "herb", amount: 2 },
    { type: "gold", amount: 25 },
    { type: "experience", amount: 20 },
  ],
  npcId: "forest_ranger",
  location: "forest_path",
  dialogue: {
    start: "Welcome to the forest! The woods are full of useful resources if you know where to look.",
    progress: "You're doing great! The forest provides many gifts to those who respect it.",
    complete: "Well done, explorer! You've learned the basics of foraging. The forest will serve you well.",
  },
  isMainQuest: true,
  chapter: 1,
  order: 2,
};

const FISHING_LESSON: Quest = {
  id: "fishing_lesson",
  name: "Learning to Fish",
  description: "Learn the art of fishing at the Peaceful Riverside.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "buy_fishing_rod",
      type: "collect_item",
      description: "Purchase a fishing rod from Joe",
      itemId: "fishing_rod",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "catch_fish",
      type: "collect_item",
      description: "Catch 2 fish using your new rod",
      itemId: "fish",
      targetAmount: 2,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "forest_exploration" }],
  rewards: [
    { type: "item", itemId: "bait", amount: 10 },
    { type: "gold", amount: 50 },
    { type: "experience", amount: 30 },
  ],
  npcId: "angler_joe",
  location: "riverside",
  dialogue: {
    start: "So you want to learn fishing? It's a peaceful art that provides excellent nutrition for your pet.",
    progress: "You're getting the hang of it! Patience is the key to good fishing.",
    complete: "Excellent work! You're now a true angler. The waters will provide for you and your pet.",
  },
  isMainQuest: true,
  chapter: 1,
  order: 3,
};

// Pet care focused quests
const PET_CARE_BASICS: Quest = {
  id: "pet_care_basics",
  name: "Caring for Your Pet",
  description: "Learn the fundamental aspects of pet care by feeding, watering, and playing with your pet.",
  type: "care",
  status: "not_started",
  objectives: [
    {
      id: "feed_pet",
      type: "care_action",
      description: "Feed your pet 3 times",
      careAction: "feed",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "give_water",
      type: "care_action",
      description: "Give your pet water 3 times",
      careAction: "drink",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "play_with_pet",
      type: "care_action",
      description: "Play with your pet 2 times",
      careAction: "play",
      targetAmount: 2,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [],
  rewards: [
    { type: "item", itemId: "ball", amount: 1 },
    { type: "experience", amount: 25 },
  ],
  npcId: "shopkeeper_sam",
  location: "hometown",
  dialogue: {
    start: "Taking care of your pet is the most important thing! Let me teach you the basics.",
    progress: "Your pet is looking happier already! Keep up the good care.",
    complete: "Perfect! You understand the fundamentals of pet care. Your pet is lucky to have you!",
  },
  isMainQuest: true,
  chapter: 1,
  order: 0, // This should be the first quest
};

// Collection quests
const BERRY_COLLECTOR: Quest = {
  id: "berry_collector",
  name: "Berry Collector",
  description: "Collect a variety of berries for the local shopkeeper.",
  type: "collection",
  status: "not_started",
  objectives: [
    {
      id: "collect_berries",
      type: "collect_item",
      description: "Collect 10 berries from foraging",
      itemId: "berry",
      targetAmount: 10,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "forest_exploration" }],
  rewards: [
    { type: "gold", amount: 40 },
    { type: "item", itemId: "apple", amount: 3 },
  ],
  npcId: "shopkeeper_sam",
  location: "hometown",
  dialogue: {
    start: "I need berries for my shop! The forest has plenty if you're willing to forage.",
    progress: "Those berries look fresh and delicious! Keep collecting!",
    complete: "Perfect! These berries will be great for my customers. Here's your payment!",
  },
  isMainQuest: false,
  chapter: 2,
  order: 1,
};

const HEALING_HERBS: Quest = {
  id: "healing_herbs",
  name: "Healing Herbs",
  description: "Gather healing herbs to help create medicine for sick pets.",
  type: "collection",
  status: "not_started",
  objectives: [
    {
      id: "gather_herbs",
      type: "collect_item",
      description: "Collect 5 healing herbs",
      itemId: "herb",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "forest_exploration" }],
  rewards: [
    { type: "item", itemId: "basic_medicine", amount: 3 },
    { type: "gold", amount: 30 },
    { type: "experience", amount: 15 },
  ],
  npcId: "forest_ranger",
  location: "forest_path",
  dialogue: {
    start: "The forest provides natural remedies for those who know where to look. Can you help me gather herbs?",
    progress: "Those herbs have strong healing properties. You have a good eye!",
    complete: "Excellent work! These herbs will help many pets stay healthy. Thank you!",
  },
  isMainQuest: false,
  chapter: 2,
  order: 2,
};

// Battle-focused quest
const FIRST_BATTLE: Quest = {
  id: "first_battle",
  name: "First Victory",
  description: "Prove your pet's strength by winning your first battle.",
  type: "battle",
  status: "not_started",
  objectives: [
    {
      id: "win_battle",
      type: "defeat_pet",
      description: "Defeat any opponent in battle",
      petSpecies: "any", // special case for any opponent
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "pet_care_basics" }],
  rewards: [
    { type: "item", itemId: "energy_drink", amount: 2 },
    { type: "gold", amount: 35 },
    { type: "experience", amount: 40 },
  ],
  npcId: "forest_ranger",
  location: "forest_path",
  dialogue: {
    start: "Your pet looks strong! Have you tested their abilities in battle yet?",
    progress: "The thrill of battle is in your pet's eyes! They're becoming stronger!",
    complete: "Congratulations on your first victory! Your pet is becoming a true warrior!",
  },
  isMainQuest: true,
  chapter: 2,
  order: 1,
};

// Export all quests
export const QUESTS: Quest[] = [
  PET_CARE_BASICS,
  SHOP_TUTORIAL,
  FOREST_EXPLORATION,
  FISHING_LESSON,
  BERRY_COLLECTOR,
  HEALING_HERBS,
  FIRST_BATTLE,
];

// Helper functions
export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find(quest => quest.id === id);
}

export function getQuestsByLocation(locationId: string): Quest[] {
  return QUESTS.filter(quest => quest.location === locationId);
}

export function getQuestsByNpc(npcId: string): Quest[] {
  return QUESTS.filter(quest => quest.npcId === npcId);
}

export function getMainQuests(): Quest[] {
  return QUESTS.filter(quest => quest.isMainQuest).sort((a, b) => {
    if (a.chapter !== b.chapter) {
      return (a.chapter || 0) - (b.chapter || 0);
    }
    return (a.order || 0) - (b.order || 0);
  });
}

export function getSideQuests(): Quest[] {
  return QUESTS.filter(quest => !quest.isMainQuest).sort((a, b) => {
    if (a.chapter !== b.chapter) {
      return (a.chapter || 0) - (b.chapter || 0);
    }
    return (a.order || 0) - (b.order || 0);
  });
}
