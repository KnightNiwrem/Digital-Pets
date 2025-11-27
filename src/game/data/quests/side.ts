/**
 * Side quests - optional quests with various rewards.
 */

import {
  ObjectiveType,
  type Quest,
  QuestType,
  RequirementType,
  RewardType,
} from "@/game/types/quest";

/**
 * Side Quest: Coastal Explorer
 * Encourages visiting the Whispering Coast.
 */
export const sideCoastalExplorer: Quest = {
  id: "side_coastal_explorer",
  name: "Coastal Explorer",
  description:
    "Mira has heard rumors of a beautiful coastline. She'd love some coconuts from there!",
  type: QuestType.Side,
  giverId: "shopkeeper_mira",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "tutorial_exploration",
    },
  ],
  objectives: [
    {
      id: "visit_coast",
      type: ObjectiveType.Visit,
      description: "Visit the Whispering Coast",
      target: "whispering_coast",
      quantity: 1,
    },
    {
      id: "collect_coconuts",
      type: ObjectiveType.Collect,
      description: "Collect Coconut Water",
      target: "drink_coconut",
      quantity: 5,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 100,
    },
    {
      type: RewardType.Item,
      target: "drink_smoothie",
      quantity: 3,
    },
  ],
};

/**
 * Side Quest: Material Gatherer
 * Teaches players about material collection.
 */
export const sideMaterialGatherer: Quest = {
  id: "side_material_gatherer",
  name: "Material Gatherer",
  description:
    "Oak needs some basic materials for his research. Help him gather wood and herbs.",
  type: QuestType.Side,
  giverId: "trainer_oak",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "tutorial_first_steps",
    },
  ],
  objectives: [
    {
      id: "collect_wood",
      type: ObjectiveType.Collect,
      description: "Collect Wood",
      target: "material_wood",
      quantity: 10,
    },
    {
      id: "collect_herbs",
      type: ObjectiveType.Collect,
      description: "Collect Wild Herbs",
      target: "material_herb",
      quantity: 5,
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
      target: "medicine_bandage",
      quantity: 5,
    },
    {
      type: RewardType.XP,
      target: "foraging",
      quantity: 50,
    },
  ],
};

/**
 * Side Quest: Monster Hunter
 * Introduces battle-focused gameplay.
 */
export const sideMonsterHunter: Quest = {
  id: "side_monster_hunter",
  name: "Monster Hunter",
  description:
    "Wild creatures have been causing trouble. Help deal with them and collect their fangs.",
  type: QuestType.Side,
  giverId: "trainer_oak",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "tutorial_training",
    },
    {
      type: RequirementType.Stage,
      target: "child",
    },
  ],
  objectives: [
    {
      id: "defeat_creatures",
      type: ObjectiveType.Defeat,
      description: "Defeat wild creatures",
      target: "any",
      quantity: 10,
    },
    {
      id: "collect_fangs",
      type: ObjectiveType.Collect,
      description: "Collect Monster Fangs",
      target: "material_monster_fang",
      quantity: 5,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 200,
    },
    {
      type: RewardType.Item,
      target: "battle_attack_boost",
      quantity: 3,
    },
    {
      type: RewardType.Item,
      target: "equip_iron_bangle",
      quantity: 1,
    },
  ],
};

/**
 * Side Quest: The Rare Collector
 * Encourages deep exploration for rare items.
 */
export const sideRareCollector: Quest = {
  id: "side_rare_collector",
  name: "The Rare Collector",
  description:
    "A mysterious collector is seeking rare crystals. Find them and you'll be rewarded handsomely.",
  type: QuestType.Side,
  giverId: "shopkeeper_mira",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "main_crystal_discovery",
    },
  ],
  objectives: [
    {
      id: "collect_crystals",
      type: ObjectiveType.Collect,
      description: "Collect Crystal Shards",
      target: "material_crystal",
      quantity: 10,
    },
    {
      id: "collect_essence",
      type: ObjectiveType.Collect,
      description: "Collect Essence Drops",
      target: "material_essence",
      quantity: 2,
      optional: true,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 500,
    },
    {
      type: RewardType.Item,
      target: "equip_guardians_pendant",
      quantity: 1,
    },
  ],
};

/**
 * Side Quest: Gourmet Chef
 * Collect food variety.
 */
export const sideGourmetChef: Quest = {
  id: "side_gourmet_chef",
  name: "Gourmet Chef",
  description:
    "Mira wants to expand her shop's food selection. Help her gather different foods!",
  type: QuestType.Side,
  giverId: "shopkeeper_mira",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "tutorial_first_steps",
    },
  ],
  objectives: [
    {
      id: "collect_berries",
      type: ObjectiveType.Collect,
      description: "Collect Mixed Berries",
      target: "food_berries",
      quantity: 5,
    },
    {
      id: "collect_fish",
      type: ObjectiveType.Collect,
      description: "Collect Grilled Fish",
      target: "food_fish",
      quantity: 3,
    },
    {
      id: "collect_honey",
      type: ObjectiveType.Collect,
      description: "Collect Wild Honey",
      target: "food_honey",
      quantity: 3,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 120,
    },
    {
      type: RewardType.Item,
      target: "food_feast",
      quantity: 1,
    },
  ],
};

/**
 * All side quests indexed by ID.
 */
export const sideQuests: Record<string, Quest> = {
  [sideCoastalExplorer.id]: sideCoastalExplorer,
  [sideMaterialGatherer.id]: sideMaterialGatherer,
  [sideMonsterHunter.id]: sideMonsterHunter,
  [sideRareCollector.id]: sideRareCollector,
  [sideGourmetChef.id]: sideGourmetChef,
};
