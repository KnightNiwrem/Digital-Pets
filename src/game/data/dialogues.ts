/**
 * Dialogue tree definitions for NPCs.
 */

import {
  type DialogueAction,
  DialogueActionType,
  type DialogueCondition,
  DialogueConditionType,
  type DialogueNode,
  DialogueNodeType,
  type DialogueTree,
} from "@/game/types/npc";
import { QuestState } from "@/game/types/quest";

/**
 * Helper to create a message node.
 */
function messageNode(
  id: string,
  text: string,
  nextNodeId?: string,
): DialogueNode {
  return {
    id,
    type: DialogueNodeType.Message,
    text,
    nextNodeId,
  };
}

/**
 * Helper to create a choice node.
 */
function choiceNode(
  id: string,
  text: string,
  choices: {
    text: string;
    nextNodeId: string;
    conditions?: DialogueCondition[];
    action?: DialogueAction;
  }[],
): DialogueNode {
  return {
    id,
    type: DialogueNodeType.Choice,
    text,
    choices,
  };
}

/**
 * Helper to create an end node.
 */
function endNode(id: string, text: string): DialogueNode {
  return {
    id,
    type: DialogueNodeType.End,
    text,
  };
}

/**
 * Helper to create a shop node.
 */
function shopNode(id: string, text: string): DialogueNode {
  return {
    id,
    type: DialogueNodeType.Shop,
    text,
  };
}

// ========================================
// WILLOWBROOK DIALOGUES
// ========================================

/**
 * Mira's dialogue tree.
 */
export const miraDialogue: DialogueTree = {
  id: "mira_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "Welcome to my shop! I have all sorts of supplies for your pet. What can I help you with today?",
      [
        { text: "I'd like to browse your wares.", nextNodeId: "shop" },
        { text: "Tell me about Willowbrook.", nextNodeId: "about_town" },
        { text: "Just passing through. Goodbye!", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "Take your time and look around! Let me know if you need anything.",
    ),
    about_town: messageNode(
      "about_town",
      "Willowbrook has been a peaceful haven for pet owners for generations. The meadows to the east are great for foraging, and the Misty Woods beyond hold many mysteries.",
      "about_town_2",
    ),
    about_town_2: choiceNode(
      "about_town_2",
      "Is there anything else you'd like to know?",
      [
        { text: "I'd like to see your shop.", nextNodeId: "shop" },
        { text: "That's all, thank you!", nextNodeId: "farewell" },
      ],
    ),
    farewell: endNode(
      "farewell",
      "Safe travels! Come back anytime you need supplies.",
    ),
  },
};

/**
 * Oak's dialogue tree.
 */
export const oakDialogue: DialogueTree = {
  id: "oak_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "Ah, a fellow pet trainer! I've dedicated my life to understanding these wonderful creatures. How can I assist you?",
      [
        // Complete First Steps
        {
          text: "I've completed the basic care tasks.",
          nextNodeId: "complete_first_steps",
          conditions: [
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_first_steps",
              value: QuestState.Active,
            },
            {
              type: DialogueConditionType.QuestObjectivesComplete,
              targetId: "tutorial_first_steps",
              value: true,
            },
          ],
          action: {
            type: DialogueActionType.CompleteQuest,
            targetId: "tutorial_first_steps",
          },
        },
        // Start First Steps
        {
          text: "I'm ready to start my journey!",
          nextNodeId: "start_adventure",
          conditions: [
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_first_steps",
              value: QuestState.Available,
            },
          ],
          action: {
            type: DialogueActionType.StartQuest,
            targetId: "tutorial_first_steps",
          },
        },
        // Complete Exploration
        {
          text: "I've explored the area and found some things.",
          nextNodeId: "complete_exploration",
          conditions: [
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_exploration",
              value: QuestState.Active,
            },
            {
              type: DialogueConditionType.QuestObjectivesComplete,
              targetId: "tutorial_exploration",
              value: true,
            },
          ],
          action: {
            type: DialogueActionType.CompleteQuest,
            targetId: "tutorial_exploration",
          },
        },
        // Start Exploration
        {
          text: "I'm ready for my next challenge!",
          nextNodeId: "next_quest",
          conditions: [
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_first_steps",
              value: QuestState.Completed,
            },
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_exploration",
              value: QuestState.Available,
            },
          ],
          action: {
            type: DialogueActionType.StartQuest,
            targetId: "tutorial_exploration",
          },
        },
        // Complete Training
        {
          text: "I've finished my pet's training session.",
          nextNodeId: "complete_training",
          conditions: [
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_training",
              value: QuestState.Active,
            },
            {
              type: DialogueConditionType.QuestObjectivesComplete,
              targetId: "tutorial_training",
              value: true,
            },
          ],
          action: {
            type: DialogueActionType.CompleteQuest,
            targetId: "tutorial_training",
          },
        },
        // Start Training
        {
          text: "How can I make my pet stronger?",
          nextNodeId: "training_quest",
          conditions: [
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_exploration",
              value: QuestState.Completed,
            },
            {
              type: DialogueConditionType.QuestState,
              targetId: "tutorial_training",
              value: QuestState.Available,
            },
          ],
          action: {
            type: DialogueActionType.StartQuest,
            targetId: "tutorial_training",
          },
        },
        { text: "Any tips for training?", nextNodeId: "training_tips" },
        {
          text: "What should new trainers know?",
          nextNodeId: "beginner_advice",
        },
        { text: "I should get going.", nextNodeId: "farewell" },
      ],
    ),
    start_adventure: messageNode(
      "start_adventure",
      "That's the spirit! I've prepared a few tasks to help you get started. Open your Quest Log to see what needs to be done.",
      "greeting",
    ),
    complete_first_steps: messageNode(
      "complete_first_steps",
      "Wonderful! You're taking good care of your pet. Here's a small reward for your efforts.",
      "greeting",
    ),
    next_quest: messageNode(
      "next_quest",
      "Excellent work! You're learning fast. Now, go out and explore the world. There's much to discover!",
      "greeting",
    ),
    complete_exploration: messageNode(
      "complete_exploration",
      "You found some interesting items! Exploration is key to survival. Keep up the good work.",
      "greeting",
    ),
    training_quest: messageNode(
      "training_quest",
      "Training is essential for any pet. Visit the training grounds and help your pet reach its full potential!",
      "greeting",
    ),
    complete_training: messageNode(
      "complete_training",
      "Impressive! Your pet is growing stronger every day. I think you're ready for even greater challenges now.",
      "greeting",
    ),
    training_tips: messageNode(
      "training_tips",
      "The key to effective training is consistency and patience. Make sure your pet is well-rested and well-fed before training sessions. A happy pet learns faster!",
      "training_tips_2",
    ),
    training_tips_2: choiceNode(
      "training_tips_2",
      "Different training focuses develop different strengths. Would you like to know more?",
      [
        { text: "Tell me about battle stats.", nextNodeId: "battle_stats" },
        { text: "I think I understand. Thanks!", nextNodeId: "farewell" },
      ],
    ),
    battle_stats: messageNode(
      "battle_stats",
      "Every pet has six core attributes: Strength for power, Endurance for toughness, Agility for speed, Precision for accuracy, Fortitude for resilience, and Cunning for tactical advantage.",
      "battle_stats_2",
    ),
    battle_stats_2: endNode(
      "battle_stats_2",
      "Master these, and your pet will become a formidable partner. Good luck with your training!",
    ),
    beginner_advice: messageNode(
      "beginner_advice",
      "New to pet raising? The most important thing is taking care of your pet's basic needs. Keep them fed, hydrated, and happy. A healthy pet is a strong pet!",
      "beginner_advice_2",
    ),
    beginner_advice_2: messageNode(
      "beginner_advice_2",
      "Don't forget to let them rest when they're tired. And clean up after them - a messy environment isn't good for anyone!",
      "beginner_advice_3",
    ),
    beginner_advice_3: endNode(
      "beginner_advice_3",
      "Once you've got the basics down, you can focus on training and exploration. You'll do great!",
    ),
    farewell: endNode(
      "farewell",
      "May your journey together be filled with adventure and growth. Until next time!",
    ),
  },
};

// ========================================
// IRONHAVEN DIALOGUES
// ========================================

/**
 * Grom's dialogue tree.
 */
export const gromDialogue: DialogueTree = {
  id: "grom_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*The forge crackles behind him* Ah, a traveler! Name's Grom. I forge the finest equipment in these mountains. What brings you to my smithy?",
      [
        { text: "I'd like to see your wares.", nextNodeId: "shop" },
        { text: "Tell me about Ironhaven.", nextNodeId: "about_town" },
        { text: "I need ore for crafting.", nextNodeId: "about_ore" },
        { text: "Just looking around.", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "Take a look at what I've got. Everything's made right here in my forge!",
    ),
    about_town: messageNode(
      "about_town",
      "Ironhaven was built by miners centuries ago. The mountains are rich with ore and crystals, but they're also dangerous. Many tunnels lead deep underground...",
      "about_town_2",
    ),
    about_town_2: messageNode(
      "about_town_2",
      "The Crystal Caves to the south are popular with adventurers, and to the north lie the Frozen Peaks. Not many return from there.",
      "greeting",
    ),
    about_ore: messageNode(
      "about_ore",
      "Iron ore can be found in the highlands and caves. If you're looking for rarer materials, you'll need to venture deeper. The Shadow Depths hold the most precious finds.",
      "about_ore_2",
    ),
    about_ore_2: endNode(
      "about_ore_2",
      "Bring me quality ore, and I'll pay a fair price. Or we can work together to forge something special.",
    ),
    farewell: endNode(
      "farewell",
      "*returns to hammering* Safe travels, and watch out for cave-ins!",
    ),
  },
};

/**
 * Delva's dialogue tree.
 */
export const delvaDialogue: DialogueTree = {
  id: "delva_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*adjusts her mining helmet* Well met, adventurer! I've been mining these tunnels for thirty years. Looking for some guidance underground?",
      [
        { text: "Tell me about mining.", nextNodeId: "mining_tips" },
        { text: "What dangers should I watch for?", nextNodeId: "dangers" },
        { text: "I'm looking for rare crystals.", nextNodeId: "crystals" },
        { text: "I should keep moving.", nextNodeId: "farewell" },
      ],
    ),
    mining_tips: messageNode(
      "mining_tips",
      "Mining's not just about swinging a pickaxe. You need to read the rock - look for color variations, listen for hollow sounds, and always check your surroundings.",
      "mining_tips_2",
    ),
    mining_tips_2: endNode(
      "mining_tips_2",
      "The deeper you go, the better the ore, but also the more dangerous. Start with the Highlands, then work your way to the caves.",
    ),
    dangers: messageNode(
      "dangers",
      "Underground, you'll face cave-ins, toxic fumes, and creatures that live in the dark. Some say there are things in the Shadow Depths that haven't seen light in centuries.",
      "dangers_2",
    ),
    dangers_2: endNode(
      "dangers_2",
      "Keep your pet close and your energy high. Many have entered those depths unprepared and never returned.",
    ),
    crystals: messageNode(
      "crystals",
      "Crystals, eh? The purest ones form deep in the caves where pressure is highest. I've seen some that glow with their own inner light!",
      "crystals_2",
    ),
    crystals_2: endNode(
      "crystals_2",
      "Check the Crystal Caves first. If you need truly rare specimens, you'll have to brave the Shadow Depths. Good luck!",
    ),
    farewell: endNode(
      "farewell",
      "May your pickaxe stay sharp and your lantern stay lit!",
    ),
  },
};

// ========================================
// TIDECREST DIALOGUES
// ========================================

/**
 * Marina's dialogue tree.
 */
export const marinaDialogue: DialogueTree = {
  id: "marina_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*mending a fishing net* Ahoy there! Welcome to Tidecrest. I'm Marina - been fishing these waters since before I could walk. What can I do for you?",
      [
        { text: "Show me your fishing supplies.", nextNodeId: "shop" },
        { text: "Any fishing tips?", nextNodeId: "fishing_tips" },
        { text: "Tell me about the local waters.", nextNodeId: "about_waters" },
        { text: "See you around.", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "Got everything you need for a good day's fishing. Fresh bait too!",
    ),
    fishing_tips: messageNode(
      "fishing_tips",
      "Fishing is all about patience and knowing your quarry. Different fish prefer different depths and times of day. The rare ones... they need special lures.",
      "fishing_tips_2",
    ),
    fishing_tips_2: endNode(
      "fishing_tips_2",
      "Start at the coast, then try the reef. If you're feeling brave, the waters around the Sunken Temple hold legendary catches!",
    ),
    about_waters: messageNode(
      "about_waters",
      "The Whispering Coast is calm and good for beginners. Beyond it lies the Coral Reef - beautiful but with stronger currents and fiercer fish.",
      "about_waters_2",
    ),
    about_waters_2: messageNode(
      "about_waters_2",
      "And then there's the Sunken Temple... ancient ruins beneath the waves. Captain Torrent knows more about that place than anyone.",
      "greeting",
    ),
    farewell: endNode(
      "farewell",
      "May the tides be in your favor! Come back if you catch anything interesting.",
    ),
  },
};

/**
 * Captain Torrent's dialogue tree.
 */
export const torrentDialogue: DialogueTree = {
  id: "torrent_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*takes a long puff from his pipe* Another curious soul, eh? I'm Captain Torrent. I've sailed every sea and seen things that would make your hair stand on end.",
      [
        { text: "Tell me about your adventures.", nextNodeId: "adventures" },
        { text: "What's the Sunken Temple?", nextNodeId: "temple" },
        {
          text: "Any treasures waiting to be found?",
          nextNodeId: "treasures",
        },
        { text: "I should go.", nextNodeId: "farewell" },
      ],
    ),
    adventures: messageNode(
      "adventures",
      "Ha! Where to begin? I've weathered hurricanes, outrun pirates, and once... once I saw something rise from the deep that shouldn't exist.",
      "adventures_2",
    ),
    adventures_2: messageNode(
      "adventures_2",
      "*his eyes grow distant* That was near the Sunken Temple. The creature that guards that place... it's older than the sea itself.",
      "greeting",
    ),
    temple: messageNode(
      "temple",
      "The Sunken Temple was once above the waves, belonging to an ancient civilization. When their city fell, the temple sank with it. Strange glyphs still glow on its walls.",
      "temple_2",
    ),
    temple_2: messageNode(
      "temple_2",
      "Some say it holds artifacts of incredible power. Others say it's cursed. *leans in* I say both are true.",
      "greeting",
    ),
    treasures: messageNode(
      "treasures",
      "*chuckles* Aye, there's treasure aplenty beneath the waves. Pearls, ancient coins, and things more valuable than gold.",
      "treasures_2",
    ),
    treasures_2: endNode(
      "treasures_2",
      "But treasure is guarded, always. The Coral Reef has minor baubles. The real prizes? They're in the Temple. If you're brave enough.",
    ),
    farewell: endNode(
      "farewell",
      "*waves his pipe* Fair winds to you, adventurer. And remember - the sea takes what it wants, but rewards those who respect it.",
    ),
  },
};

// ========================================
// STARFALL SANCTUARY DIALOGUES
// ========================================

/**
 * Sage Lumina's dialogue tree.
 */
export const luminaDialogue: DialogueTree = {
  id: "lumina_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*her form shimmers with starlight* Welcome, traveler. I am Lumina. You have journeyed far to reach this place. What wisdom do you seek?",
      [
        {
          text: "Tell me about this sanctuary.",
          nextNodeId: "about_sanctuary",
        },
        { text: "What can I learn here?", nextNodeId: "training" },
        { text: "What lies in the Celestial Spire?", nextNodeId: "spire" },
        { text: "I'm not ready. I should go.", nextNodeId: "farewell" },
      ],
    ),
    about_sanctuary: messageNode(
      "about_sanctuary",
      "Starfall Sanctuary has existed since the first stars fell to earth. It is a place of learning, of understanding the bond between pet and trainer.",
      "about_sanctuary_2",
    ),
    about_sanctuary_2: messageNode(
      "about_sanctuary_2",
      "Only those who have proven themselves worthy may enter. You have survived the Shadow Depths and earned your place here.",
      "greeting",
    ),
    training: messageNode(
      "training",
      "Here, we teach the deepest secrets of pet evolution and the cosmic energies that flow through all living things.",
      "training_2",
    ),
    training_2: endNode(
      "training_2",
      "Master these teachings, and your pet will transcend ordinary limits. But the path is long and demanding.",
    ),
    spire: messageNode(
      "spire",
      "The Celestial Spire is the ultimate test. A tower that reaches into the realm of stars, where only the most powerful may climb.",
      "spire_2",
    ),
    spire_2: messageNode(
      "spire_2",
      "At its peak awaits... something. An entity of pure cosmic energy. Few have reached it. Fewer still have returned.",
      "greeting",
    ),
    farewell: endNode(
      "farewell",
      "*bows gracefully* The stars will guide your path. Return when you are ready to learn.",
    ),
  },
};

/**
 * Archivist Echo's dialogue tree.
 */
export const echoDialogue: DialogueTree = {
  id: "echo_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*a whispered voice from the shadows* Knowledge has weight. Truth has cost. What do you seek in these archives, traveler?",
      [
        { text: "I want to see your collection.", nextNodeId: "shop" },
        { text: "What knowledge do you keep?", nextNodeId: "knowledge" },
        { text: "Tell me about ancient pets.", nextNodeId: "ancient_pets" },
        { text: "I'll come back another time.", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "Browse carefully. Some of these texts are... temperamental. They choose their readers.",
    ),
    knowledge: messageNode(
      "knowledge",
      "Everything ever known about pets rests in these halls. Their origins, their potential, their connection to the stars themselves.",
      "knowledge_2",
    ),
    knowledge_2: endNode(
      "knowledge_2",
      "I preserve what others would forget. The dangerous knowledge. The forbidden techniques. All of it waits here for those worthy enough to learn.",
    ),
    ancient_pets: messageNode(
      "ancient_pets",
      "In ages past, pets were different. More powerful. More... aware. The ones we know today are but echoes of what once existed.",
      "ancient_pets_2",
    ),
    ancient_pets_2: messageNode(
      "ancient_pets_2",
      "Some believe the original species still exist, hidden in places where time has no meaning. The Celestial Spire, perhaps, or beyond...",
      "greeting",
    ),
    farewell: endNode(
      "farewell",
      "*fades slightly into shadow* Knowledge waits patiently. Return when curiosity drives you back.",
    ),
  },
};

// ========================================
// WANDERING NPC DIALOGUES
// ========================================

/**
 * Fern's dialogue tree.
 */
export const fernDialogue: DialogueTree = {
  id: "fern_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*gently places herbs in a basket* Oh! A fellow traveler in the grove. I'm Fern. I gather medicinal plants to help injured pets. Can I help you?",
      [
        { text: "Show me your remedies.", nextNodeId: "shop" },
        { text: "Tell me about healing herbs.", nextNodeId: "herbs" },
        { text: "What grows in this grove?", nextNodeId: "grove" },
        { text: "I'll let you work. Goodbye.", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "I've prepared some remedies from my recent foraging. Take what you need!",
    ),
    herbs: messageNode(
      "herbs",
      "Every plant has healing properties if you know how to use them. Moonpetal soothes burns, Starbloom restores energy, and Shadowroot... well, that's for special cases.",
      "herbs_2",
    ),
    herbs_2: endNode(
      "herbs_2",
      "The rarest herbs grow in the strangest places. The Mushroom Hollow has some unique specimens you won't find anywhere else!",
    ),
    grove: messageNode(
      "grove",
      "The Ancient Grove is sacred. The trees here are older than any record. They've seen civilizations rise and fall.",
      "grove_2",
    ),
    grove_2: endNode(
      "grove_2",
      "Forage gently and take only what you need. The grove provides for those who respect it.",
    ),
    farewell: endNode(
      "farewell",
      "*returns to gathering* May nature's blessing follow you on your journey!",
    ),
  },
};

/**
 * Blaze's dialogue tree.
 */
export const blazeDialogue: DialogueTree = {
  id: "blaze_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*wipes sweat from brow* Welcome to the highlands, trainer! I'm Blaze. I train pets to withstand extreme heat. Think your pet can handle it?",
      [
        { text: "Tell me about heat training.", nextNodeId: "training" },
        { text: "What lives in the volcano?", nextNodeId: "volcano" },
        { text: "Is the caldera safe to explore?", nextNodeId: "caldera" },
        { text: "Not today. See you.", nextNodeId: "farewell" },
      ],
    ),
    training: messageNode(
      "training",
      "Heat training builds thermal resistance and raw power. Start slow - even the strongest pet can be overwhelmed by volcanic temperatures.",
      "training_2",
    ),
    training_2: endNode(
      "training_2",
      "Master fire, and few enemies will stand against you. But respect it - fire is both a tool and a danger.",
    ),
    volcano: messageNode(
      "volcano",
      "Emberfox are the most common. Fierce, fast, and hot to the touch. But deeper in, there are things that have never known cold...",
      "volcano_2",
    ),
    volcano_2: endNode(
      "volcano_2",
      "The Volcanic Caldera is their domain. Only enter if you're truly prepared.",
    ),
    caldera: messageNode(
      "caldera",
      "*laughs* Safe? Nothing about the caldera is safe. The ground shifts, lava pools appear without warning, and the creatures there are brutal.",
      "caldera_2",
    ),
    caldera_2: endNode(
      "caldera_2",
      "But if you want the rarest volcanic materials and the strongest fire training, it's the only place. Risk and reward, my friend.",
    ),
    farewell: endNode(
      "farewell",
      "Stay cool out there... or don't! Ha! *returns to training*",
    ),
  },
};

/**
 * Dr. Frost's dialogue tree.
 */
export const frostDialogue: DialogueTree = {
  id: "frost_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*adjusts thick goggles* Fascinating! Another specimen- I mean, visitor! I'm Dr. Frost. I study cold adaptation in creatures. What brings you to the peaks?",
      [
        { text: "What are you researching?", nextNodeId: "research" },
        { text: "How do creatures survive here?", nextNodeId: "survival" },
        {
          text: "What's in the Glacial Cavern?",
          nextNodeId: "cavern",
        },
        { text: "I need to warm up. Goodbye.", nextNodeId: "farewell" },
      ],
    ),
    research: messageNode(
      "research",
      "I'm documenting how creatures develop cold resistance! Some produce antifreeze compounds, others generate internal heat, and a few simply... embrace the cold entirely.",
      "research_2",
    ),
    research_2: endNode(
      "research_2",
      "My research could help trainers prepare their pets for any environment. If you find any unusual ice samples, please bring them to me!",
    ),
    survival: messageNode(
      "survival",
      "The creatures here have adapted over millennia. Their fur is denser, their metabolisms slower, and they've developed unique hunting strategies.",
      "survival_2",
    ),
    survival_2: endNode(
      "survival_2",
      "Your pet will need protection from the cold. Energy drains faster here, and some attacks can freeze a pet solid if they're not resistant!",
    ),
    cavern: messageNode(
      "cavern",
      "The Glacial Cavern is a natural wonder - ice formations older than recorded history! But it's also home to creatures that have evolved in total isolation.",
      "cavern_2",
    ),
    cavern_2: endNode(
      "cavern_2",
      "They're unlike anything you've encountered. Be prepared for surprises, and bring plenty of warming supplies!",
    ),
    farewell: endNode(
      "farewell",
      "*scribbles in notebook* Yes, yes, stay warm! Science waits for no one - including me!",
    ),
  },
};

/**
 * Coral's dialogue tree.
 */
export const coralDialogue: DialogueTree = {
  id: "coral_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*adjusts diving mask* Oh, surface-dweller! I'm Coral. I've mapped every inch of this reef. Planning to explore the depths?",
      [
        { text: "Tell me about the reef.", nextNodeId: "reef" },
        { text: "What should I know about diving?", nextNodeId: "diving" },
        { text: "Have you been to the Sunken Temple?", nextNodeId: "temple" },
        { text: "Maybe later. See you.", nextNodeId: "farewell" },
      ],
    ),
    reef: messageNode(
      "reef",
      "The Coral Reef is alive with color and danger! Beautiful fish, precious materials, and creatures that protect their territory fiercely.",
      "reef_2",
    ),
    reef_2: endNode(
      "reef_2",
      "The currents can be tricky, and some of the larger predators are no joke. But for the prepared explorer, it's a treasure trove!",
    ),
    diving: messageNode(
      "diving",
      "Underwater exploration requires endurance. Your pet needs to handle the pressure and the cold. Energy depletes faster, and there's no quick escape.",
      "diving_2",
    ),
    diving_2: endNode(
      "diving_2",
      "Start shallow, practice your navigation, and always know your way back. The depths can be disorienting.",
    ),
    temple: messageNode(
      "temple",
      "*her eyes light up* The Sunken Temple! I've been to the outer chambers. Ancient architecture, glowing symbols, guardian creatures...",
      "temple_2",
    ),
    temple_2: messageNode(
      "temple_2",
      "But the inner sanctum remains unexplored. Something prevents entry - a puzzle, a guardian, or perhaps something worse.",
      "greeting",
    ),
    farewell: endNode(
      "farewell",
      "Happy exploring! The reef has many secrets - come find me if you uncover something interesting!",
    ),
  },
};

/**
 * Gloom's dialogue tree.
 */
export const gloomDialogue: DialogueTree = {
  id: "gloom_dialogue",
  startNodeId: "greeting",
  nodes: {
    greeting: choiceNode(
      "greeting",
      "*materializes from shadows* You... have ventured deep. I am Gloom. I have answers you seek... for a price.",
      [
        { text: "What do you sell?", nextNodeId: "shop" },
        { text: "What are you?", nextNodeId: "identity" },
        { text: "What secrets lie deeper?", nextNodeId: "secrets" },
        { text: "I'll stay in the light.", nextNodeId: "farewell" },
      ],
    ),
    shop: shopNode(
      "shop",
      "Items that cannot be found in sunlight. Essences, shadow materials, and... other things. Browse carefully.",
    ),
    identity: messageNode(
      "identity",
      "*shifts and flickers* I was like you once. A trainer who ventured too deep. The shadows embraced me, and I embraced them back.",
      "identity_2",
    ),
    identity_2: endNode(
      "identity_2",
      "Do not pity me. In darkness, I have found power. And knowledge that the light-dwellers fear to understand.",
    ),
    secrets: messageNode(
      "secrets",
      "Beyond these depths... there are places where reality bends. Where creatures exist that predate the world itself.",
      "secrets_2",
    ),
    secrets_2: messageNode(
      "secrets_2",
      "The Celestial Spire above and the endless depths below are mirrors of each other. Light and dark, creation and void.",
      "secrets_3",
    ),
    secrets_3: endNode(
      "secrets_3",
      "Master both, and you might understand what pets truly are. But that knowledge comes at a cost few are willing to pay.",
    ),
    farewell: endNode(
      "farewell",
      "*fades back into darkness* The shadows will wait. They always do. Return when you are ready to see.",
    ),
  },
};

/**
 * All dialogue trees indexed by ID.
 */
export const dialogues: Record<string, DialogueTree> = {
  // Willowbrook
  [miraDialogue.id]: miraDialogue,
  [oakDialogue.id]: oakDialogue,
  // Ironhaven
  [gromDialogue.id]: gromDialogue,
  [delvaDialogue.id]: delvaDialogue,
  // Tidecrest
  [marinaDialogue.id]: marinaDialogue,
  [torrentDialogue.id]: torrentDialogue,
  // Starfall Sanctuary
  [luminaDialogue.id]: luminaDialogue,
  [echoDialogue.id]: echoDialogue,
  // Wandering NPCs
  [fernDialogue.id]: fernDialogue,
  [blazeDialogue.id]: blazeDialogue,
  [frostDialogue.id]: frostDialogue,
  [coralDialogue.id]: coralDialogue,
  [gloomDialogue.id]: gloomDialogue,
};

/**
 * Get a dialogue tree by ID.
 */
export function getDialogue(dialogueId: string): DialogueTree | undefined {
  return dialogues[dialogueId];
}
