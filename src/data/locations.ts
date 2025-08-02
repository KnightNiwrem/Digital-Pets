// Location definitions for the game world

import type { Location, LocationType } from "@/types/World";

// Starting location - peaceful hometown
const HOMETOWN: Location = {
  id: "hometown",
  name: "Hometown",
  type: "town" as LocationType,
  description: "A peaceful town where your journey with your digital pet begins. The local shop has basic supplies.",
  activities: [
    {
      id: "hometown_foraging",
      name: "Forage in Town Square",
      type: "foraging",
      description: "Look for small items around the town square",
      energyCost: 10,
      duration: 20, // 5 minutes
      rewards: [
        { type: "item", id: "apple", amount: 1, probability: 0.6 },
        { type: "item", id: "water_bottle", amount: 1, probability: 0.4 },
        { type: "gold", amount: 5, probability: 0.3 },
      ],
    },
  ],
  shops: [
    {
      id: "hometown_general_store",
      name: "General Store",
      description: "A small shop with basic pet care supplies",
      keeper: "shopkeeper_sam",
      items: [
        { itemId: "apple", price: 10, stock: -1 },
        { itemId: "water_bottle", price: 8, stock: -1 },
        { itemId: "basic_medicine", price: 25, stock: 5 },
        { itemId: "soap", price: 15, stock: -1 },
      ],
    },
  ],
  npcs: [
    {
      id: "shopkeeper_sam",
      name: "Sam",
      description: "The friendly owner of the general store",
      sprite: "npc_sam",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to my shop! I have everything you need to care for your pet.",
          responses: [
            {
              id: "browse",
              text: "I'd like to browse your items.",
              effects: [{ type: "start_quest", questId: "shop_tutorial" }],
            },
            {
              id: "goodbye",
              text: "Thanks, I'll come back later.",
              nextNodeId: "farewell",
            },
          ],
        },
        {
          id: "farewell",
          text: "Come back anytime! Take good care of your pet.",
        },
      ],
      quests: ["shop_tutorial"],
      shop: "hometown_general_store",
    },
  ],
  connections: [
    {
      destinationId: "forest_path",
      travelTime: 60, // 15 minutes
      requirements: [{ type: "level", value: 1 }],
    },
    {
      destinationId: "town_garden",
      travelTime: 20, // 5 minutes - very close
    },
    {
      destinationId: "peaceful_meadow",
      travelTime: 40, // 10 minutes
    },
  ],
  sprite: "location_hometown",
  background: "bg_hometown",
};

// First explorable area
const FOREST_PATH: Location = {
  id: "forest_path",
  name: "Forest Path",
  type: "forest" as LocationType,
  description: "A winding path through a peaceful forest. Good for foraging and meeting wild pets.",
  activities: [
    {
      id: "forest_foraging",
      name: "Forage for Berries",
      type: "foraging",
      description: "Search for berries and herbs in the forest undergrowth",
      energyCost: 15,
      duration: 30, // 7.5 minutes
      rewards: [
        { type: "item", id: "berry", amount: 1, probability: 0.8 },
        { type: "item", id: "herb", amount: 1, probability: 0.5 },
        { type: "gold", amount: 8, probability: 0.4 },
      ],
    },
    {
      id: "forest_training",
      name: "Basic Training",
      type: "training",
      description: "Practice basic moves with your pet in the peaceful forest",
      energyCost: 20,
      duration: 60, // 15 minutes
      rewards: [{ type: "experience", amount: 10, probability: 1.0 }],
    },
  ],
  shops: [],
  npcs: [
    {
      id: "forest_ranger",
      name: "Forest Ranger",
      description: "A knowledgeable ranger who protects the forest",
      sprite: "npc_ranger",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to the forest! Be careful not to stray too far from the path.",
          responses: [
            {
              id: "ask_advice",
              text: "Any advice for new trainers?",
              nextNodeId: "advice",
            },
            {
              id: "goodbye",
              text: "Thanks for the warning!",
              nextNodeId: "farewell",
            },
          ],
        },
        {
          id: "advice",
          text: "Train your pet regularly and keep them well-fed. The forest is full of opportunities to grow stronger!",
        },
        {
          id: "farewell",
          text: "Safe travels! Come back if you need guidance.",
        },
      ],
      quests: ["forest_exploration"],
    },
  ],
  connections: [
    {
      destinationId: "hometown",
      travelTime: 60, // 15 minutes back
    },
    {
      destinationId: "riverside",
      travelTime: 80, // 20 minutes
      requirements: [{ type: "level", value: 3 }],
    },
    {
      destinationId: "quiet_pond",
      travelTime: 50, // 12.5 minutes
      requirements: [{ type: "level", value: 1 }],
    },
    {
      destinationId: "mountain_village",
      travelTime: 120, // 30 minutes to mountain
      requirements: [{ type: "level", value: 8 }],
    },
  ],
  unlockRequirements: [{ type: "level", value: 1 }],
  sprite: "location_forest",
  background: "bg_forest",
};

// Fishing area
const RIVERSIDE: Location = {
  id: "riverside",
  name: "Peaceful Riverside",
  type: "beach" as LocationType,
  description: "A calm river flows through this scenic area. Perfect for fishing and relaxation.",
  activities: [
    {
      id: "riverside_fishing",
      name: "Fish in the River",
      type: "fishing",
      description: "Cast your line and try to catch fresh fish",
      energyCost: 25,
      duration: 45, // 11.25 minutes
      rewards: [
        { type: "item", id: "fish", amount: 1, probability: 0.7 },
        { type: "item", id: "rare_fish", amount: 1, probability: 0.2 },
        { type: "gold", amount: 15, probability: 0.5 },
      ],
      requirements: [{ type: "item", value: "fishing_rod" }],
    },
    {
      id: "riverside_rest",
      name: "Peaceful Reflection",
      type: "training",
      description: "Sit quietly by the water and reflect with your pet, practicing mindfulness",
      energyCost: 5,
      duration: 30,
      rewards: [
        { type: "experience", amount: 8, probability: 1.0 },
        { type: "item", id: "herb", amount: 1, probability: 0.2 },
      ],
    },
  ],
  shops: [
    {
      id: "riverside_fishing_shop",
      name: "Angler's Supplies",
      description: "A small stall selling fishing equipment and fresh catch",
      keeper: "angler_joe",
      items: [
        { itemId: "fishing_rod", price: 100, stock: 1 },
        { itemId: "fish", price: 20, stock: 3 },
        { itemId: "bait", price: 5, stock: 20 },
      ],
    },
  ],
  npcs: [
    {
      id: "angler_joe",
      name: "Joe the Angler",
      description: "An experienced fisherman who knows all the best spots",
      sprite: "npc_angler",
      dialogue: [
        {
          id: "greeting",
          text: "Perfect day for fishing! The fish are really biting today.",
          responses: [
            {
              id: "buy_rod",
              text: "I need a fishing rod.",
              nextNodeId: "sell_rod",
            },
            {
              id: "fishing_tips",
              text: "Any fishing tips?",
              nextNodeId: "tips",
            },
          ],
        },
        {
          id: "sell_rod",
          text: "This rod will serve you well! Just 100 gold and you'll be catching fish in no time.",
        },
        {
          id: "tips",
          text: "Patience is key! Also, different bait works better for different fish.",
        },
      ],
      quests: ["fishing_lesson"],
      shop: "riverside_fishing_shop",
    },
  ],
  connections: [
    {
      destinationId: "forest_path",
      travelTime: 80, // 20 minutes back
    },
  ],
  unlockRequirements: [{ type: "level", value: 3 }],
  sprite: "location_riverside",
  background: "bg_riverside",
};

// Mining and high-altitude area
const MOUNTAIN_VILLAGE: Location = {
  id: "mountain_village",
  name: "Mountain Village",
  type: "town" as LocationType,
  description:
    "A hardy mountain village built around ancient mining operations. The air is thin but the people are resilient.",
  activities: [
    {
      id: "mountain_mining",
      name: "Mine for Ore",
      type: "mining",
      description: "Dig deep into the mountain veins to extract valuable ores and gems",
      energyCost: 35,
      duration: 90, // 22.5 minutes - more time-consuming than other activities
      rewards: [
        { type: "item", id: "iron_ore", amount: 1, probability: 0.7 },
        { type: "item", id: "silver_ore", amount: 1, probability: 0.4 },
        { type: "item", id: "gold_ore", amount: 1, probability: 0.2 },
        { type: "item", id: "precious_gem", amount: 1, probability: 0.1 },
        { type: "item", id: "crystal_fragment", amount: 1, probability: 0.05 },
        { type: "gold", amount: 25, probability: 0.6 },
      ],
      requirements: [{ type: "item", value: "pickaxe" }],
    },
    {
      id: "mountain_climbing",
      name: "Mountain Climbing Training",
      type: "training",
      description: "Train your pet's endurance and strength on the challenging mountain terrain",
      energyCost: 30,
      duration: 75, // 18.75 minutes
      rewards: [
        { type: "experience", amount: 20, probability: 1.0 },
        { type: "item", id: "crystal_fragment", amount: 1, probability: 0.15 },
      ],
    },
    {
      id: "mountain_rest",
      name: "High Altitude Training",
      type: "training",
      description: "Train in the crisp mountain air, building endurance and strength at high altitude",
      energyCost: 15,
      duration: 45,
      rewards: [
        { type: "experience", amount: 12, probability: 1.0 },
        { type: "item", id: "herb", amount: 1, probability: 0.3 }, // mountain herbs
        { type: "gold", amount: 5, probability: 0.2 },
      ],
    },
  ],
  shops: [
    {
      id: "mountain_blacksmith",
      name: "Mountain Blacksmith",
      description: "A skilled forge specializing in mining equipment and metal goods",
      keeper: "blacksmith_thor",
      items: [
        { itemId: "pickaxe", price: 75, stock: 3 },
        { itemId: "training_collar", price: 120, stock: 2 },
        { itemId: "strong_medicine", price: 40, stock: 4 },
        { itemId: "energy_drink", price: 30, stock: 10 },
      ],
    },
    {
      id: "mountain_trading_post",
      name: "Mining Supplies & Trading Post",
      description: "A general store catering to miners and travelers",
      keeper: "mining_guide_elena",
      items: [
        { itemId: "meat", price: 35, stock: 8 },
        { itemId: "protein_shake", price: 25, stock: 6 },
        { itemId: "exploration_pack", price: 65, stock: 2 },
        { itemId: "rope_toy", price: 20, stock: 5 },
      ],
    },
  ],
  npcs: [
    {
      id: "blacksmith_thor",
      name: "Thor the Blacksmith",
      description: "A burly blacksmith with arms like tree trunks and eyes that gleam with the fire of his forge",
      sprite: "npc_blacksmith",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to my forge, traveler! The mountains forge both metal and character. What brings you to our village?",
          responses: [
            {
              id: "buy_equipment",
              text: "I need mining equipment.",
              nextNodeId: "equipment_sales",
            },
            {
              id: "ask_about_mining",
              text: "Tell me about mining here.",
              nextNodeId: "mining_advice",
            },
            {
              id: "ask_about_village",
              text: "What's the history of this village?",
              nextNodeId: "village_history",
            },
          ],
        },
        {
          id: "equipment_sales",
          text: "Aye, good tools are essential for safe mining! My pickaxes are the finest in the region - they'll serve you well in the deep tunnels.",
        },
        {
          id: "mining_advice",
          text: "The mountain's been generous to us for generations. But she demands respect - never go into the deep tunnels without proper equipment, and always listen for the mountain's warnings.",
        },
        {
          id: "village_history",
          text: "This village was founded by my great-grandfather when he discovered the first silver vein. We've been mining these mountains for over a century, following the old ways and respecting the mountain spirits.",
        },
      ],
      quests: ["mountain_mining_tutorial", "the_great_discovery_part2"],
      shop: "mountain_blacksmith",
    },
    {
      id: "mining_guide_elena",
      name: "Elena the Mining Guide",
      description: "A weathered mountain woman with keen eyes and an encyclopedic knowledge of the local terrain",
      sprite: "npc_mining_guide",
      dialogue: [
        {
          id: "greeting",
          text: "Another newcomer to the mountains! I can see it in your eyes - the call of the deep places. But are you prepared for what lies beneath?",
          responses: [
            {
              id: "ask_guidance",
              text: "I need guidance for mining.",
              nextNodeId: "mining_guidance",
            },
            {
              id: "buy_supplies",
              text: "I need supplies for my journey.",
              nextNodeId: "supply_sales",
            },
            {
              id: "ask_about_tunnels",
              text: "What lies in the deep tunnels?",
              nextNodeId: "deep_tunnels",
            },
          ],
        },
        {
          id: "mining_guidance",
          text: "Listen well: the mountain has three levels. Surface mining for beginners, deep veins for the experienced, and the ancient tunnels... those are for heroes only.",
        },
        {
          id: "supply_sales",
          text: "Smart thinking! Preparation is the difference between a successful expedition and a rescue mission. Take a look at what I have in stock.",
        },
        {
          id: "deep_tunnels",
          text: "The ancient tunnels run deeper than any mine we've ever dug. Strange lights flicker there, and sometimes... sometimes you hear whispers in languages older than memory.",
        },
      ],
      quests: ["mining_safety_lesson"],
      shop: "mountain_trading_post",
    },
    {
      id: "village_elder_magnus",
      name: "Elder Magnus",
      description: "An ancient man with silver hair and eyes that hold the wisdom of the mountains",
      sprite: "npc_elder",
      dialogue: [
        {
          id: "greeting",
          text: "Young one, I sense great purpose in you. The mountains whisper of changing times - of discoveries that will reshape our understanding of this world.",
          responses: [
            {
              id: "ask_about_whispers",
              text: "What do the mountains whisper?",
              nextNodeId: "mountain_prophecy",
            },
            {
              id: "ask_about_discovery",
              text: "What kind of discoveries?",
              nextNodeId: "ancient_secrets",
            },
            {
              id: "respectful_farewell",
              text: "Thank you for your wisdom, Elder.",
              nextNodeId: "blessing",
            },
          ],
        },
        {
          id: "mountain_prophecy",
          text: "They speak of lights in the forest, of tremors in the deep places, and of a chosen one who will uncover the truth about our world's creation. Perhaps... perhaps that one is you.",
        },
        {
          id: "ancient_secrets",
          text: "Long ago, before the first mines were dug, this land held secrets beyond imagination. Ancient ruins lie hidden, waiting for one brave enough to seek them out.",
        },
        {
          id: "blessing",
          text: "May the mountain spirits guide your path, young traveler. Remember - true strength comes not from the treasures you find, but from the courage to seek them.",
        },
      ],
      quests: ["the_great_discovery_part1"],
    },
  ],
  connections: [
    {
      destinationId: "forest_path",
      travelTime: 120, // 30 minutes - longer journey to mountain
    },
    {
      destinationId: "ancient_ruins",
      travelTime: 100, // 25 minutes to ruins
      requirements: [{ type: "quest_completed", value: "the_great_discovery_part2" }],
    },
  ],
  unlockRequirements: [
    { type: "level", value: 8 },
    { type: "quest_completed", value: "fishing_lesson" },
  ],
  sprite: "location_mountain_village",
  background: "bg_mountain_village",
};

// Ancient Ruins - End-game exploration area unlocked by mountain village quest chain
const ANCIENT_RUINS: Location = {
  id: "ancient_ruins",
  name: "Ancient Ruins",
  type: "ruins" as LocationType,
  description:
    "Mysterious ruins from a forgotten civilization, filled with ancient technology and guarded secrets. The air hums with otherworldly energy.",
  activities: [
    {
      id: "artifact_hunting",
      name: "Hunt for Artifacts",
      type: "foraging",
      description: "Search through ancient chambers for valuable relics and artifacts",
      energyCost: 25,
      duration: 60, // 15 minutes
      rewards: [
        { type: "item", id: "ancient_relic", amount: 1, probability: 0.4 },
        { type: "item", id: "crystal_fragment", amount: 2, probability: 0.6 },
        { type: "item", id: "precious_gem", amount: 1, probability: 0.3 },
        { type: "experience", amount: 15, probability: 1.0 },
        { type: "gold", amount: 50, probability: 0.5 },
      ],
    },
    {
      id: "puzzle_solving",
      name: "Solve Ancient Puzzles",
      type: "training",
      description: "Decipher ancient mechanisms and unlock hidden chambers",
      energyCost: 30,
      duration: 90, // 22.5 minutes
      rewards: [
        { type: "experience", amount: 25, probability: 1.0 },
        { type: "item", id: "ancient_key", amount: 1, probability: 0.2 },
        { type: "item", id: "wisdom_scroll", amount: 1, probability: 0.3 },
        { type: "gold", amount: 75, probability: 0.4 },
      ],
    },
    {
      id: "guardian_challenge",
      name: "Challenge Ancient Guardians",
      type: "training",
      description: "Face the spectral guardians that protect the ruins' deepest secrets",
      energyCost: 40,
      duration: 120, // 30 minutes
      rewards: [
        { type: "experience", amount: 40, probability: 1.0 },
        { type: "item", id: "legendary_artifact", amount: 1, probability: 0.1 },
        { type: "item", id: "guardian_essence", amount: 1, probability: 0.5 },
        { type: "gold", amount: 100, probability: 0.6 },
      ],
    },
  ],
  shops: [
    {
      id: "artifact_exchange",
      name: "Ancient Artifact Exchange",
      description: "A mystical shop where ancient knowledge can be traded for powerful items",
      keeper: "treasure_hunter_zara",
      items: [
        { itemId: "ancient_potion", price: 200, stock: 2 },
        { itemId: "mystic_charm", price: 150, stock: 3 },
        { itemId: "energy_crystal", price: 100, stock: 5 },
        { itemId: "wisdom_scroll", price: 80, stock: 4 },
      ],
    },
  ],
  npcs: [
    {
      id: "archaeologist_vera",
      name: "Dr. Vera Cross",
      description: "A brilliant archaeologist studying the ruins' connection to the digital pet world's origins",
      sprite: "npc_archaeologist",
      dialogue: [
        {
          id: "greeting",
          text: "Fascinating! Another seeker of ancient truths. These ruins hold secrets that could rewrite our understanding of this world's very nature.",
          responses: [
            {
              id: "ask_about_ruins",
              text: "What have you discovered here?",
              nextNodeId: "ruins_discovery",
            },
            {
              id: "ask_about_origin",
              text: "What do you mean about our world's nature?",
              nextNodeId: "world_origin",
            },
            {
              id: "offer_help",
              text: "How can I help your research?",
              nextNodeId: "research_help",
            },
          ],
        },
        {
          id: "ruins_discovery",
          text: "These structures predate any known civilization by millennia. The technology here... it's beyond anything we understand. Almost as if it was designed to create and maintain entire digital ecosystems.",
        },
        {
          id: "world_origin",
          text: "I believe this entire world - our pets, the environments, even us - was created by the beings who built these ruins. We're living in their greatest masterpiece.",
        },
        {
          id: "research_help",
          text: "If you're serious about helping, I need someone brave enough to venture into the deepest chambers. The guardians there protect knowledge I desperately need to unlock.",
        },
      ],
      quests: ["the_great_discovery_part3"],
    },
    {
      id: "guardian_spirit_aeon",
      name: "Aeon the Guardian",
      description: "An ancient spectral entity bound to protect the ruins' most sacred knowledge",
      sprite: "npc_guardian_spirit",
      dialogue: [
        {
          id: "greeting",
          text: "Mortal child... you tread upon sacred ground. Few have proven worthy to hear the ancient truths. What brings you to this hallowed place?",
          responses: [
            {
              id: "seek_knowledge",
              text: "I seek the truth about this world.",
              nextNodeId: "ancient_wisdom",
            },
            {
              id: "show_respect",
              text: "I come with reverence for the ancients.",
              nextNodeId: "respectful_approach",
            },
            {
              id: "ask_about_purpose",
              text: "What is your purpose here?",
              nextNodeId: "guardian_duty",
            },
          ],
        },
        {
          id: "ancient_wisdom",
          text: "Truth... yes, the truth is what all seekers desire. But are you prepared for the weight of absolute knowledge? The creators of this realm embedded their consciousness into its very fabric.",
        },
        {
          id: "respectful_approach",
          text: "Your respect is noted, young one. The ancients valued wisdom above all else. They created this world as a sanctuary - a place where life could flourish in perfect harmony.",
        },
        {
          id: "guardian_duty",
          text: "I am the keeper of the final revelation. When the time comes for this world to face its greatest choice, I will guide the worthy to understand their true destiny.",
        },
      ],
      quests: ["the_great_discovery_part4"],
    },
    {
      id: "treasure_hunter_zara",
      name: "Zara the Treasure Hunter",
      description: "A skilled adventurer who has spent years mapping the ruins and collecting its treasures",
      sprite: "npc_treasure_hunter",
      dialogue: [
        {
          id: "greeting",
          text: "Well, well! Another treasure seeker drawn to these ancient halls. But be warned - these ruins don't give up their secrets easily.",
          responses: [
            {
              id: "ask_about_treasures",
              text: "What treasures have you found?",
              nextNodeId: "treasure_knowledge",
            },
            {
              id: "ask_for_tips",
              text: "Any advice for exploring safely?",
              nextNodeId: "exploration_tips",
            },
            {
              id: "browse_goods",
              text: "What do you have for trade?",
              nextNodeId: "trading_offer",
            },
          ],
        },
        {
          id: "treasure_knowledge",
          text: "Oh, the things I've seen! Artifacts that glow with inner light, crystals that sing ancient melodies, and scrolls written in languages that somehow you just... understand.",
        },
        {
          id: "exploration_tips",
          text: "Rule one: never go into the deep chambers alone. Rule two: if the walls start glowing, back away slowly. Rule three: always carry extra energy potions - the guardians don't mess around.",
        },
        {
          id: "trading_offer",
          text: "I've got some rare finds I'm willing to part with... for the right price. These ancient potions and charms can give you an edge against the ruins' challenges.",
        },
      ],
      quests: [],
      shop: "artifact_exchange",
    },
  ],
  connections: [
    {
      destinationId: "mountain_village",
      travelTime: 45, // 11.25 minutes
    },
  ],
  unlockRequirements: [{ type: "quest_completed", value: "the_great_discovery_part2" }],
  sprite: "location_ancient_ruins",
  background: "bg_ancient_ruins",
};

// Coastal Harbor - Advanced trading hub with maritime activities
const COASTAL_HARBOR: Location = {
  id: "coastal_harbor",
  name: "Coastal Harbor",
  type: "beach" as LocationType,
  description:
    "A bustling maritime trading hub where merchants from distant lands gather. The harbor is filled with exotic goods and the sound of creaking ships.",
  activities: [
    {
      id: "deep_sea_fishing",
      name: "Deep Sea Fishing",
      type: "fishing",
      description: "Venture into deeper waters for rare and exotic fish species",
      energyCost: 35,
      duration: 80, // 20 minutes
      rewards: [
        { type: "item", id: "exotic_fish", amount: 1, probability: 0.4 },
        { type: "item", id: "pearl", amount: 1, probability: 0.2 },
        { type: "item", id: "rare_fish", amount: 2, probability: 0.6 },
        { type: "experience", amount: 20, probability: 1.0 },
        { type: "gold", amount: 60, probability: 0.5 },
      ],
    },
    {
      id: "ship_maintenance",
      name: "Ship Maintenance Work",
      type: "training",
      description: "Help maintain the harbor's ships and improve your practical skills",
      energyCost: 25,
      duration: 60, // 15 minutes
      rewards: [
        { type: "experience", amount: 15, probability: 1.0 },
        { type: "item", id: "maritime_rope", amount: 1, probability: 0.4 },
        { type: "item", id: "ship_tools", amount: 1, probability: 0.3 },
        { type: "gold", amount: 40, probability: 0.7 },
      ],
    },
    {
      id: "trade_negotiations",
      name: "Trade Negotiations",
      type: "foraging",
      description: "Assist merchants with trade deals and learn about exotic goods",
      energyCost: 20,
      duration: 45, // 11.25 minutes
      rewards: [
        { type: "experience", amount: 12, probability: 1.0 },
        { type: "item", id: "trade_permit", amount: 1, probability: 0.3 },
        { type: "item", id: "exotic_spice", amount: 1, probability: 0.4 },
        { type: "gold", amount: 80, probability: 0.6 },
      ],
    },
  ],
  shops: [
    {
      id: "exotic_goods_emporium",
      name: "Exotic Goods Emporium",
      description: "A shop specializing in rare items from across the seven seas",
      keeper: "merchant_captain_elena",
      items: [
        { itemId: "exotic_fish", price: 80, stock: 8 },
        { itemId: "pearl", price: 150, stock: 3 },
        { itemId: "navigation_compass", price: 200, stock: 2 },
        { itemId: "sea_salt", price: 25, stock: 15 },
      ],
    },
    {
      id: "fishmongers_market",
      name: "Fresh Catch Market",
      description: "The best seafood in the region, brought in daily by local fishermen",
      keeper: "fishmonger_barnabus",
      items: [
        { itemId: "fish", price: 20, stock: -1 },
        { itemId: "rare_fish", price: 45, stock: 12 },
        { itemId: "exotic_fish", price: 85, stock: 6 },
        { itemId: "kelp_supplement", price: 35, stock: 8 },
      ],
    },
  ],
  npcs: [
    {
      id: "harbor_master_thaddeus",
      name: "Harbor Master Thaddeus",
      description: "A weathered sea captain who oversees all harbor operations with an iron fist and a kind heart",
      sprite: "npc_harbor_master",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to our harbor, landlubber! This port has seen traders from every corner of the world. What brings you to our bustling waters?",
          responses: [
            {
              id: "ask_about_harbor",
              text: "Tell me about this harbor.",
              nextNodeId: "harbor_history",
            },
            {
              id: "seek_work",
              text: "I'm looking for work around the docks.",
              nextNodeId: "harbor_work",
            },
            {
              id: "ask_about_ships",
              text: "What ships come through here?",
              nextNodeId: "ship_tales",
            },
          ],
        },
        {
          id: "harbor_history",
          text: "This harbor's been the crossroads of trade for three centuries. Ships from the Eastern Kingdoms, the Southern Archipelago, even the mysterious Northern Reaches dock here.",
        },
        {
          id: "harbor_work",
          text: "Always need good hands around here! Ships need constant maintenance, and the merchants can always use help with their negotiations. Hard work, but it pays well.",
        },
        {
          id: "ship_tales",
          text: "Ah, the stories I could tell! Merchant vessels laden with silks and spices, fishing boats returning with legendary catches, and sometimes... ships carrying far stranger cargo.",
        },
      ],
      quests: ["harbor_integration", "deep_sea_expedition"],
    },
    {
      id: "merchant_captain_elena",
      name: "Captain Elena Stormwind",
      description: "A renowned merchant captain whose ship 'Sea Phoenix' has traveled to every known port in the world",
      sprite: "npc_merchant_captain",
      dialogue: [
        {
          id: "greeting",
          text: "Greetings, fellow traveler! I've sailed the seven seas and traded with peoples from every known land. Perhaps you'd be interested in some of my exotic wares?",
          responses: [
            {
              id: "browse_goods",
              text: "What exotic goods do you have?",
              nextNodeId: "exotic_inventory",
            },
            {
              id: "ask_about_travels",
              text: "Tell me about your travels.",
              nextNodeId: "travel_stories",
            },
            {
              id: "trade_inquiry",
              text: "I'm interested in learning about trade.",
              nextNodeId: "trade_wisdom",
            },
          ],
        },
        {
          id: "exotic_inventory",
          text: "My ship carries treasures from distant shores: pearls from the Deep Coral Reefs, navigation tools crafted by the finest artisans, and spices that can transform any meal into a feast.",
        },
        {
          id: "travel_stories",
          text: "I've weathered storms that could sink mountains, traded with island peoples who speak in song, and discovered markets floating on the backs of great sea creatures. The world is vast and full of wonders!",
        },
        {
          id: "trade_wisdom",
          text: "Good trade isn't just about buying low and selling high - it's about understanding what people truly need and finding ways to bring it to them. Relationships matter more than gold in this business.",
        },
      ],
      quests: ["trading_apprentice"],
      shop: "exotic_goods_emporium",
    },
    {
      id: "fishmonger_barnabus",
      name: "Barnabus the Fishmonger",
      description:
        "A jolly fishmonger with an encyclopedic knowledge of sea life and the best fish recipes in the harbor",
      sprite: "npc_fishmonger",
      dialogue: [
        {
          id: "greeting",
          text: "Fresh catch today, friend! I've got fish so fresh they were swimming this morning. Looking for something special for your companion?",
          responses: [
            {
              id: "buy_fish",
              text: "What's the freshest catch today?",
              nextNodeId: "daily_catch",
            },
            {
              id: "ask_fishing_advice",
              text: "Any tips for deep sea fishing?",
              nextNodeId: "fishing_wisdom",
            },
            {
              id: "ask_about_recipes",
              text: "Do you know any good fish recipes?",
              nextNodeId: "cooking_advice",
            },
          ],
        },
        {
          id: "daily_catch",
          text: "Today's special is the exotic rainbow fish - caught in waters so deep they never see sunlight! Rich in nutrients and your pet will love the unique flavor.",
        },
        {
          id: "fishing_wisdom",
          text: "Deep waters hold the best fish, but they're trickier to catch. Use strong line, be patient, and always respect the sea. She'll reward those who understand her moods.",
        },
        {
          id: "cooking_advice",
          text: "The secret to great fish is simple preparation! Fresh herbs, a touch of sea salt, and never overcook. Let the natural flavors shine through.",
        },
      ],
      quests: ["master_angler"],
      shop: "fishmongers_market",
    },
  ],
  connections: [
    {
      destinationId: "riverside",
      travelTime: 50, // 12.5 minutes
    },
  ],
  unlockRequirements: [{ type: "quest_completed", value: "the_great_discovery_part3" }],
  sprite: "location_coastal_harbor",
  background: "bg_coastal_harbor",
};

// Town Garden - A peaceful garden area accessible from the start
const TOWN_GARDEN: Location = {
  id: "town_garden",
  name: "Town Garden",
  type: "forest" as LocationType,
  description: "A well-tended garden on the outskirts of town, perfect for gathering flowers and herbs.",
  activities: [
    {
      id: "flower_picking",
      name: "Pick Flowers",
      type: "foraging",
      description: "Gather beautiful flowers and useful herbs in the peaceful garden",
      energyCost: 8,
      duration: 15, // 3.75 minutes - shorter than other activities
      rewards: [
        { type: "item", id: "herb", amount: 1, probability: 0.7 },
        { type: "item", id: "honey", amount: 1, probability: 0.3 },
        { type: "gold", amount: 3, probability: 0.4 },
      ],
    },
    {
      id: "butterfly_watching",
      name: "Watch Butterflies",
      type: "foraging",
      description: "Observe butterflies and other garden creatures for a calming experience",
      energyCost: 5,
      duration: 20, // 5 minutes
      rewards: [
        { type: "experience", amount: 5, probability: 1.0 },
        { type: "item", id: "honey", amount: 1, probability: 0.2 },
      ],
    },
  ],
  shops: [],
  npcs: [
    {
      id: "gardener_marie",
      name: "Marie the Gardener",
      description: "A kind gardener who tends to the flowers and knows about plant care",
      sprite: "npc_gardener",
      dialogue: [
        {
          id: "greeting",
          text: "Welcome to our town garden! The flowers are especially beautiful today.",
          responses: [
            {
              id: "ask_about_plants",
              text: "Can you teach me about plants?",
              nextNodeId: "plant_knowledge",
            },
            {
              id: "compliment_garden",
              text: "Your garden is beautiful!",
              nextNodeId: "thank_you",
            },
          ],
        },
        {
          id: "plant_knowledge",
          text: "Plants need love and care, just like pets! The herbs here can help keep your companion healthy.",
        },
        {
          id: "thank_you",
          text: "Thank you so much! I've spent years nurturing these plants. Feel free to pick some herbs for your pet.",
        },
      ],
      quests: [],
    },
  ],
  connections: [
    {
      destinationId: "hometown",
      travelTime: 20, // 5 minutes back
    },
  ],
  sprite: "location_garden",
  background: "bg_garden",
};

// Peaceful Meadow - Open area for training and gathering
const PEACEFUL_MEADOW: Location = {
  id: "peaceful_meadow",
  name: "Peaceful Meadow",
  type: "forest" as LocationType,
  description: "A wide open meadow with soft grass and wildflowers, perfect for play and light training.",
  activities: [
    {
      id: "meadow_playing",
      name: "Play in Meadow",
      type: "training",
      description: "Let your pet run freely and play in the open meadow",
      energyCost: 12,
      duration: 25, // 6.25 minutes
      rewards: [
        { type: "experience", amount: 8, probability: 1.0 },
        { type: "item", id: "mushroom", amount: 1, probability: 0.3 },
      ],
    },
    {
      id: "wildflower_gathering",
      name: "Gather Wildflowers",
      type: "foraging",
      description: "Collect colorful wildflowers scattered across the meadow",
      energyCost: 10,
      duration: 18, // 4.5 minutes
      rewards: [
        { type: "item", id: "herb", amount: 1, probability: 0.5 },
        { type: "item", id: "honey", amount: 1, probability: 0.4 },
        { type: "gold", amount: 6, probability: 0.3 },
      ],
    },
    {
      id: "gentle_training",
      name: "Gentle Training",
      type: "training",
      description: "Practice basic skills in the safe, open environment",
      energyCost: 15,
      duration: 40, // 10 minutes
      rewards: [
        { type: "experience", amount: 12, probability: 1.0 },
        { type: "gold", amount: 5, probability: 0.2 },
      ],
    },
  ],
  shops: [],
  npcs: [
    {
      id: "wandering_musician",
      name: "Luna the Wandering Musician",
      description: "A traveling musician who plays soothing melodies in the meadow",
      sprite: "npc_musician",
      dialogue: [
        {
          id: "greeting",
          text: "What a lovely day for music! Your pet seems to enjoy my melodies.",
          responses: [
            {
              id: "compliment_music",
              text: "Your music is beautiful!",
              nextNodeId: "music_appreciation",
            },
            {
              id: "ask_about_travel",
              text: "Do you travel often?",
              nextNodeId: "travel_stories",
            },
          ],
        },
        {
          id: "music_appreciation",
          text: "Music soothes both pets and their companions. I hope it brings you peace on your journey.",
        },
        {
          id: "travel_stories",
          text: "I wander from place to place, sharing music with all who'll listen. Each location has its own special rhythm.",
        },
      ],
      quests: [],
    },
  ],
  connections: [
    {
      destinationId: "hometown",
      travelTime: 40, // 10 minutes back
    },
  ],
  sprite: "location_meadow",
  background: "bg_meadow",
};

// Quiet Pond - Basic fishing without equipment requirements
const QUIET_POND: Location = {
  id: "quiet_pond",
  name: "Quiet Pond",
  type: "beach" as LocationType,
  description: "A small, peaceful pond where you can try simple fishing and enjoy the tranquil water.",
  activities: [
    {
      id: "simple_fishing",
      name: "Simple Fishing",
      type: "fishing",
      description: "Try catching fish with basic techniques in the calm pond water",
      energyCost: 20,
      duration: 35, // 8.75 minutes
      rewards: [
        { type: "item", id: "fish", amount: 1, probability: 0.6 },
        { type: "experience", amount: 8, probability: 1.0 },
        { type: "gold", amount: 8, probability: 0.3 },
      ],
      // No fishing rod requirement - can fish with hands/simple methods
    },
    {
      id: "pond_meditation",
      name: "Mindful Practice",
      type: "training",
      description: "Practice mindful meditation with your pet by the tranquil pond",
      energyCost: 10,
      duration: 25, // 6.25 minutes
      rewards: [{ type: "experience", amount: 8, probability: 1.0 }],
    },
    {
      id: "water_plant_gathering",
      name: "Gather Water Plants",
      type: "foraging",
      description: "Collect useful plants that grow near the water's edge",
      energyCost: 12,
      duration: 22, // 5.5 minutes
      rewards: [
        { type: "item", id: "herb", amount: 1, probability: 0.6 },
        { type: "item", id: "kelp_supplement", amount: 1, probability: 0.2 },
        { type: "gold", amount: 4, probability: 0.4 },
      ],
    },
  ],
  shops: [],
  npcs: [
    {
      id: "old_fisherman_tom",
      name: "Old Tom",
      description: "An elderly local who's been fishing this pond for decades",
      sprite: "npc_old_fisherman",
      dialogue: [
        {
          id: "greeting",
          text: "Ah, another young soul drawn to the water! This pond's been my peaceful refuge for forty years.",
          responses: [
            {
              id: "ask_fishing_tips",
              text: "Can you teach me to fish?",
              nextNodeId: "fishing_wisdom",
            },
            {
              id: "ask_about_pond",
              text: "Tell me about this pond.",
              nextNodeId: "pond_history",
            },
          ],
        },
        {
          id: "fishing_wisdom",
          text: "Patience, young one. The fish can sense your intentions. Be calm, be quiet, and they'll come to you.",
        },
        {
          id: "pond_history",
          text: "This pond has always been special. The water's clear and sweet, and the fish here are gentle creatures, not easily frightened.",
        },
      ],
      quests: [],
    },
  ],
  connections: [
    {
      destinationId: "forest_path",
      travelTime: 50, // 12.5 minutes back
    },
  ],
  unlockRequirements: [{ type: "level", value: 1 }],
  sprite: "location_pond",
  background: "bg_pond",
};

// Export all locations
export const LOCATIONS: Location[] = [
  HOMETOWN,
  TOWN_GARDEN,
  PEACEFUL_MEADOW,
  FOREST_PATH,
  QUIET_POND,
  RIVERSIDE,
  MOUNTAIN_VILLAGE,
  ANCIENT_RUINS,
  COASTAL_HARBOR,
];

// Helper function to get location by ID
export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find(location => location.id === id);
}

// Helper function to get starting location
export function getStartingLocation(): Location {
  return HOMETOWN;
}

// Helper function to get available destinations from a location
export function getAvailableDestinations(fromLocationId: string): Location[] {
  const location = getLocationById(fromLocationId);
  if (!location) return [];

  return location.connections
    .map(connection => getLocationById(connection.destinationId))
    .filter((dest): dest is Location => dest !== undefined);
}

// Helper function to get NPC by ID from all locations
export function getNpcById(npcId: string): { id: string; name: string; description: string } | undefined {
  for (const location of LOCATIONS) {
    const npc = location.npcs.find(npc => npc.id === npcId);
    if (npc) {
      return {
        id: npc.id,
        name: npc.name,
        description: npc.description,
      };
    }
  }
  return undefined;
}
