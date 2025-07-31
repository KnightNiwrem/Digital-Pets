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

// "The Great Discovery" Quest Chain - Part 3
const THE_GREAT_DISCOVERY_PART3: Quest = {
  id: "the_great_discovery_part3",
  name: "Ancient Secrets",
  description:
    "The hidden passage has led to incredible ancient ruins. Explore these mysterious chambers and uncover the truth about this world's origins.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "explore_ruins_chambers",
      type: "visit_location",
      description: "Explore the newly discovered Ancient Ruins",
      locationId: "ancient_ruins",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "collect_ancient_artifacts",
      type: "collect_item",
      description: "Search for 5 ancient artifacts hidden in the ruins",
      itemId: "ancient_relic",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "decipher_murals",
      type: "collect_item",
      description: "Solve ancient puzzles to obtain 3 wisdom scrolls",
      itemId: "wisdom_scroll",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "meet_archaeologist",
      type: "visit_location",
      description: "Speak with Dr. Vera Cross about your discoveries",
      locationId: "ancient_ruins",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "the_great_discovery_part2" }],
  rewards: [
    { type: "experience", amount: 100 },
    { type: "item", itemId: "energy_crystal", amount: 3 },
    { type: "item", itemId: "ancient_key", amount: 1 },
    { type: "gold", amount: 200 },
    { type: "unlock_quest", questId: "the_great_discovery_part4", amount: 1 },
  ],
  npcId: "archaeologist_vera",
  location: "ancient_ruins",
  dialogue: {
    start:
      "Incredible! You've uncovered what I've been searching for my entire career. These ruins... they're not just ancient - they're the very foundation of our reality. Will you help me unlock their deepest secrets?",
    progress:
      "Each artifact you find brings us closer to understanding the truth. The patterns in these murals... they're describing the creation of our entire world!",
    complete:
      "Extraordinary! These scrolls contain the story of the Architects - the beings who designed our reality. But there's more... something even greater lies in the deepest chamber, guarded by the last of the ancient ones.",
  },
  isMainQuest: true,
  chapter: 4,
  order: 1,
};

// "The Great Discovery" Quest Chain - Part 4 (FINALE)
const THE_GREAT_DISCOVERY_PART4: Quest = {
  id: "the_great_discovery_part4",
  name: "The Great Revelation",
  description:
    "The final truth awaits in the deepest chamber of the ruins. Face the Guardian of ancient knowledge and discover the ultimate secret of this digital world.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "challenge_ancient_guardians",
      type: "collect_item",
      description: "Prove your worth by collecting 5 guardian essences",
      itemId: "guardian_essence",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "unlock_inner_sanctum",
      type: "collect_item",
      description: "Use ancient keys to unlock the sanctum's secrets",
      itemId: "ancient_key",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "commune_with_aeon",
      type: "visit_location",
      description: "Speak with Aeon the Guardian about the world's true nature",
      locationId: "ancient_ruins",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "make_final_choice",
      type: "collect_item",
      description: "Make the ultimate choice: obtain the legendary artifact",
      itemId: "legendary_artifact",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "the_great_discovery_part3" }],
  rewards: [
    { type: "experience", amount: 150 },
    { type: "item", itemId: "legendary_artifact", amount: 1 },
    { type: "item", itemId: "ancient_potion", amount: 2 },
    { type: "item", itemId: "mystic_charm", amount: 1 },
    { type: "gold", amount: 500 },
    { type: "unlock_location", locationId: "cosmic_nexus", amount: 1 }, // Future expansion
  ],
  npcId: "guardian_spirit_aeon",
  location: "ancient_ruins",
  dialogue: {
    start:
      "So, seeker of truth, you have journeyed far to reach this sacred threshold. The weight of ultimate knowledge lies before you. Are you prepared to learn what this world truly is, and your place within it?",
    progress:
      "The trials test not your strength, but your wisdom. The Architects embedded their consciousness into this realm - you and your companions are part of their grand design, living expressions of their creative will.",
    complete:
      "You have proven worthy of the greatest truth: This world is not a simulation, but a living canvas where consciousness itself takes form. You are both creation and creator. With this knowledge comes great responsibility - use it wisely, guardian of the new age.",
  },
  isMainQuest: true,
  chapter: 4,
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

// Coastal Harbor Quests
const HARBOR_INTEGRATION: Quest = {
  id: "harbor_integration",
  name: "Harbor Integration",
  description: "Harbor Master Thaddeus wants to introduce you to the maritime way of life.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "visit_harbor",
      type: "visit_location",
      description: "Explore the Coastal Harbor and meet the harbor master",
      locationId: "coastal_harbor",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "try_ship_maintenance",
      type: "collect_item",
      description: "Help with ship maintenance to earn 2 ship tools",
      itemId: "ship_tools",
      targetAmount: 2,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "meet_merchants",
      type: "visit_location",
      description: "Speak with the local merchants and traders",
      locationId: "coastal_harbor",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "the_great_discovery_part3" }],
  rewards: [
    { type: "experience", amount: 30 },
    { type: "item", itemId: "navigation_compass", amount: 1 },
    { type: "gold", amount: 80 },
  ],
  npcId: "harbor_master_thaddeus",
  location: "coastal_harbor",
  dialogue: {
    start:
      "So you're the adventurer who's been making waves around here! The harbor life is different from the mountains - here we work with the tides and winds. Let me show you the ropes.",
    progress:
      "Good work! You're picking up the maritime ways quickly. The sea rewards those who respect her power and understand her rhythms.",
    complete:
      "Welcome to the harbor community! You've proven yourself capable on land and sea. The merchants are already talking about working with you.",
  },
  isMainQuest: false,
  chapter: 4,
  order: 1,
};

const TRADING_APPRENTICE: Quest = {
  id: "trading_apprentice",
  name: "Trading Apprentice",
  description: "Captain Elena Stormwind offers to teach you the art of maritime trade.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "learn_trade_basics",
      type: "collect_item",
      description: "Participate in trade negotiations to earn 3 trade permits",
      itemId: "trade_permit",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "collect_exotic_goods",
      type: "collect_item",
      description: "Acquire 5 exotic spices through your trading activities",
      itemId: "exotic_spice",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "successful_deal",
      type: "collect_item",
      description: "Complete a major deal by obtaining 2 ocean pearls",
      itemId: "pearl",
      targetAmount: 2,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "harbor_integration" }],
  rewards: [
    { type: "experience", amount: 50 },
    { type: "item", itemId: "pearl", amount: 1 },
    { type: "item", itemId: "exotic_fish", amount: 3 },
    { type: "gold", amount: 200 },
  ],
  npcId: "merchant_captain_elena",
  location: "coastal_harbor",
  dialogue: {
    start:
      "I see potential in you, young trader! The art of commerce is about more than just buying and selling - it's about understanding value, building relationships, and reading the market winds.",
    progress:
      "Excellent! You're developing a trader's instincts. Remember, every successful deal should benefit both parties - that's how you build lasting partnerships.",
    complete:
      "Outstanding work! You've mastered the fundamentals of maritime trade. With skills like these, you could captain your own merchant vessel someday.",
  },
  isMainQuest: false,
  chapter: 4,
  order: 2,
};

const MASTER_ANGLER: Quest = {
  id: "master_angler",
  name: "Master Angler",
  description: "Barnabus the Fishmonger challenges you to master the art of deep sea fishing.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "deep_sea_fishing",
      type: "collect_item",
      description: "Catch 8 exotic fish from the deep waters",
      itemId: "exotic_fish",
      targetAmount: 8,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "rare_catch",
      type: "collect_item",
      description: "Find 3 ocean pearls while fishing",
      itemId: "pearl",
      targetAmount: 3,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "kelp_harvest",
      type: "collect_item",
      description: "Harvest materials to create 5 kelp supplements",
      itemId: "kelp_supplement",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [{ type: "quest_completed", questId: "fishing_lesson" }],
  rewards: [
    { type: "experience", amount: 40 },
    { type: "item", itemId: "fishing_rod", amount: 1 }, // upgraded fishing rod
    { type: "item", itemId: "exotic_fish", amount: 5 },
    { type: "gold", amount: 120 },
  ],
  npcId: "fishmonger_barnabus",
  location: "coastal_harbor",
  dialogue: {
    start:
      "Ah, a fellow fishing enthusiast! The shallow waters have taught you well, but the deep sea... that's where the real treasures swim. Are you ready for the ultimate angling challenge?",
    progress:
      "Impressive catches! You're showing the patience and skill of a true deep sea angler. The ocean's finest secrets are within your reach.",
    complete:
      "Magnificent! You've mastered the deep waters like few before you. The sea herself has blessed your lines - you're now a true Master Angler!",
  },
  isMainQuest: false,
  chapter: 4,
  order: 3,
};

const DEEP_SEA_EXPEDITION: Quest = {
  id: "deep_sea_expedition",
  name: "Deep Sea Expedition",
  description: "Harbor Master Thaddeus organizes a major expedition to explore the deepest ocean trenches.",
  type: "exploration",
  status: "not_started",
  objectives: [
    {
      id: "expedition_preparation",
      type: "collect_item",
      description: "Gather supplies: 10 sea salt, 5 rope, and 3 navigation compasses",
      itemId: "sea_salt",
      targetAmount: 10,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "deep_exploration",
      type: "visit_location",
      description: "Lead the expedition into the deepest waters",
      locationId: "coastal_harbor",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
    {
      id: "treasure_discovery",
      type: "collect_item",
      description: "Discover the legendary treasure: 1 legendary artifact from the deep",
      itemId: "legendary_artifact",
      targetAmount: 1,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [
    { type: "quest_completed", questId: "master_angler" },
    { type: "quest_completed", questId: "trading_apprentice" },
    { type: "level", value: 20 },
  ],
  rewards: [
    { type: "experience", amount: 100 },
    { type: "item", itemId: "legendary_artifact", amount: 1 },
    { type: "item", itemId: "pearl", amount: 5 },
    { type: "item", itemId: "exotic_fish", amount: 10 },
    { type: "gold", amount: 500 },
  ],
  npcId: "harbor_master_thaddeus",
  location: "coastal_harbor",
  dialogue: {
    start:
      "The time has come for the greatest maritime adventure in decades! Ancient charts speak of treasures in the deepest trenches. Will you lead our expedition into the unknown?",
    progress:
      "The expedition is legendary already! Tales of your discoveries will be told in every port from here to the Northern Reaches.",
    complete:
      "By Neptune's beard! You've accomplished what mariners have dreamed of for centuries. The treasures you've found will make this harbor the envy of the seven seas!",
  },
  isMainQuest: true,
  chapter: 5,
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
  // Mountain Village Quests
  MOUNTAIN_MINING_TUTORIAL,
  MINING_SAFETY_LESSON,
  // The Great Discovery Quest Chain
  THE_GREAT_DISCOVERY_PART1,
  THE_GREAT_DISCOVERY_PART2,
  THE_GREAT_DISCOVERY_PART3,
  THE_GREAT_DISCOVERY_PART4,
  // Coastal Harbor Quests
  HARBOR_INTEGRATION,
  TRADING_APPRENTICE,
  MASTER_ANGLER,
  DEEP_SEA_EXPEDITION,
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
