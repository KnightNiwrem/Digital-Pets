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

// "The Great Discovery" Quest Chain - Part 1
const THE_GREAT_DISCOVERY_PART1: Quest = {
  id: "the_great_discovery_part1",
  name: "Strange Phenomena",
  description:
    "Elder Magnus speaks of strange lights and tremors. Investigate these mysterious occurrences in the forest.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "investigate_forest_lights",
      type: "visit_location",
      description: "Return to the Forest Path and look for signs of strange phenomena",
      locationId: "forest_path",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "collect_evidence",
      type: "collect_item",
      description: "Collect 3 crystal fragments as evidence of the phenomena",
      itemId: "crystal_fragment",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "report_to_elder",
      type: "visit_location",
      description: "Return to Elder Magnus with your findings",
      locationId: "mountain_village",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [
    { type: "level", value: 10 },
    { type: "quest_completed", questId: "first_battle" },
  ],
  rewards: [
    { type: "experience", amount: 50 },
    { type: "item", itemId: "ancient_relic", amount: 1 },
    { type: "gold", amount: 100 },
    { type: "unlock_quest", questId: "the_great_discovery_part2", amount: 1 },
  ],
  npcId: "village_elder_magnus",
  location: "mountain_village",
  dialogue: {
    start:
      "The whispers grow stronger, young one. Strange lights dance in the forest, and the mountain trembles with hidden power. Will you investigate these mysteries?",
    progress:
      "The phenomena grow stronger each day. Be careful in your investigation - forces beyond our understanding are at work.",
    complete:
      "Incredible! These crystal fragments pulse with ancient energy. This confirms my deepest fears... and greatest hopes. The time of great discovery is upon us!",
  },
  isMainQuest: true,
  chapter: 3,
  order: 1,
};

// "The Great Discovery" Quest Chain - Part 2
const THE_GREAT_DISCOVERY_PART2: Quest = {
  id: "the_great_discovery_part2",
  name: "The Mountain's Secret",
  description:
    "Elder Magnus believes the mountain holds the key to understanding the strange phenomena. Explore the deep mining tunnels.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "mine_deep_tunnels",
      type: "collect_item",
      description: "Mine 10 precious gems from the deep mountain tunnels",
      itemId: "precious_gem",
      targetAmount: 10,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "find_ancient_passage",
      type: "visit_location",
      description: "Discover the entrance to the ancient ruins",
      locationId: "ancient_ruins", // This will unlock the location
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "consult_blacksmith",
      type: "visit_location",
      description: "Speak with Thor about the ancient metalwork you've discovered",
      locationId: "mountain_village",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "the_great_discovery_part1" }],
  rewards: [
    { type: "experience", amount: 75 },
    { type: "item", itemId: "pickaxe", amount: 1 }, // Upgraded mining equipment
    { type: "gold", amount: 150 },
    { type: "unlock_location", locationId: "ancient_ruins", amount: 1 },
    { type: "unlock_quest", questId: "the_great_discovery_part3", amount: 1 },
  ],
  npcId: "blacksmith_thor",
  location: "mountain_village",
  dialogue: {
    start:
      "So the Elder sent you to investigate the deep places? Aye, I've heard the mountain singing lately - sounds I've never heard in all my years of mining.",
    progress:
      "The gems you've found... they're not like any ore I've seen. There's something older than stone in these mountains.",
    complete:
      "By my forge! This metalwork is beyond anything I've ever seen. These ruins... they predate our civilization by millennia. What secrets lie within?",
  },
  isMainQuest: true,
  chapter: 3,
  order: 2,
};

// Mining Tutorial Quest
const MOUNTAIN_MINING_TUTORIAL: Quest = {
  id: "mountain_mining_tutorial",
  name: "Learning to Mine",
  description: "Thor the Blacksmith offers to teach you the fundamentals of mountain mining.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "buy_pickaxe",
      type: "collect_item",
      description: "Purchase a mining pickaxe from Thor",
      itemId: "pickaxe",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "first_mining_attempt",
      type: "collect_item",
      description: "Use your pickaxe to mine 5 iron ore",
      itemId: "iron_ore",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "sell_ore",
      type: "collect_item",
      description: "Sell 3 iron ore back to Thor to complete the lesson",
      itemId: "iron_ore",
      targetAmount: -3, // negative means selling/losing items
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [
    { type: "quest_completed", questId: "fishing_lesson" },
    { type: "level", value: 8 },
  ],
  rewards: [
    { type: "experience", amount: 40 },
    { type: "gold", amount: 60 },
    { type: "item", itemId: "silver_ore", amount: 2 },
  ],
  npcId: "blacksmith_thor",
  location: "mountain_village",
  dialogue: {
    start:
      "New to mining, are you? It's dangerous work, but rewarding. Let me teach you the basics of working the mountain safely.",
    progress:
      "Good technique! The mountain respects those who work with patience and skill, not those who attack it with greed.",
    complete:
      "Well done! You have the makings of a fine miner. The mountain will provide for you, but remember - always respect her power.",
  },
  isMainQuest: false,
  chapter: 3,
  order: 1,
};

// Mining Safety Quest
const MINING_SAFETY_LESSON: Quest = {
  id: "mining_safety_lesson",
  name: "Mountain Safety",
  description: "Elena the Mining Guide wants to ensure you understand the dangers of deep mining.",
  type: "care",
  status: "not_started",
  objectives: [
    {
      id: "learn_safety_rules",
      type: "visit_location",
      description: "Listen to Elena's safety briefing about deep tunnel mining",
      locationId: "mountain_village",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "demonstrate_safety",
      type: "collect_item",
      description: "Mine safely to collect 3 silver ore without any injuries",
      itemId: "silver_ore",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "mountain_mining_tutorial" }],
  rewards: [
    { type: "experience", amount: 25 },
    { type: "item", itemId: "strong_medicine", amount: 3 },
    { type: "gold", amount: 40 },
  ],
  npcId: "mining_guide_elena",
  location: "mountain_village",
  dialogue: {
    start:
      "Mining isn't just about swinging a pickaxe - it's about reading the mountain's moods and knowing when to retreat. Let me teach you to mine safely.",
    progress: "Good! You're listening to the mountain's warnings. A careful miner is a living miner.",
    complete:
      "Excellent! You understand that the mountain's treasures aren't worth your life. You'll do well in the deep places.",
  },
  isMainQuest: false,
  chapter: 3,
  order: 2,
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
  // Mountain Village Quests
  MOUNTAIN_MINING_TUTORIAL,
  MINING_SAFETY_LESSON,
  // The Great Discovery Quest Chain
  THE_GREAT_DISCOVERY_PART1,
  THE_GREAT_DISCOVERY_PART2,
];

// Export with alternative name for consistency
export const quests = QUESTS;

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
