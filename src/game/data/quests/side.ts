/**
 * Side quests - optional quests with various rewards.
 */

import { GrowthStage } from "@/game/types/constants";
import {
  ObjectiveType,
  type Quest,
  QuestType,
  RequirementType,
  RewardType,
} from "@/game/types/quest";

// ========================================
// WILLOWBROOK SIDE QUESTS
// ========================================

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
      target: GrowthStage.Child,
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

// ========================================
// IRONHAVEN SIDE QUESTS
// ========================================

/**
 * Side Quest: Ore Collector
 * Gathering ores for the blacksmith.
 */
export const sideOreCollector: Quest = {
  id: "side_ore_collector",
  name: "Ore Collector",
  description:
    "Grom needs iron ore to keep his forge running. He'll pay well for quality materials.",
  type: QuestType.Side,
  giverId: "blacksmith_grom",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Child,
    },
  ],
  objectives: [
    {
      id: "collect_iron",
      type: ObjectiveType.Collect,
      description: "Collect Iron Ore",
      target: "material_iron_ore",
      quantity: 15,
    },
    {
      id: "collect_stone",
      type: ObjectiveType.Collect,
      description: "Collect Stone",
      target: "material_stone",
      quantity: 10,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 250,
    },
    {
      type: RewardType.Item,
      target: "equip_iron_bangle",
      quantity: 1,
    },
    {
      type: RewardType.XP,
      target: "mining",
      quantity: 75,
    },
  ],
};

/**
 * Side Quest: Forge Master
 * Crafting a special item with Grom.
 */
export const sideForgeMaster: Quest = {
  id: "side_forge_master",
  name: "Forge Master",
  description:
    "Grom has a special project in mind. Bring him rare materials and he'll craft something unique.",
  type: QuestType.Side,
  giverId: "blacksmith_grom",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_ore_collector",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.Teen,
    },
  ],
  objectives: [
    {
      id: "collect_crystals",
      type: ObjectiveType.Collect,
      description: "Collect Crystal Shards",
      target: "material_crystal",
      quantity: 5,
    },
    {
      id: "collect_iron",
      type: ObjectiveType.Collect,
      description: "Collect Iron Ore",
      target: "material_iron_ore",
      quantity: 10,
    },
    {
      id: "collect_fangs",
      type: ObjectiveType.Collect,
      description: "Collect Monster Fangs",
      target: "material_monster_fang",
      quantity: 8,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 400,
    },
    {
      type: RewardType.Item,
      target: "equip_guardians_pendant",
      quantity: 1,
    },
  ],
};

/**
 * Side Quest: Deep Mining
 * Exploring the deeper caves.
 */
export const sideDeepMining: Quest = {
  id: "side_deep_mining",
  name: "Deep Mining",
  description:
    "Delva has heard of a rich ore vein in the Crystal Caves. Explore and bring back samples.",
  type: QuestType.Side,
  giverId: "miner_delva",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Child,
    },
  ],
  objectives: [
    {
      id: "visit_caves",
      type: ObjectiveType.Visit,
      description: "Enter the Crystal Caves",
      target: "crystal_caves",
      quantity: 1,
    },
    {
      id: "collect_crystals",
      type: ObjectiveType.Collect,
      description: "Collect Crystal Shards",
      target: "material_crystal",
      quantity: 8,
    },
    {
      id: "defeat_creatures",
      type: ObjectiveType.Defeat,
      description: "Defeat cave dwellers",
      target: "any",
      quantity: 5,
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
      target: "mining",
      quantity: 100,
    },
    {
      type: RewardType.Item,
      target: "medicine_super_potion",
      quantity: 2,
    },
  ],
};

/**
 * Side Quest: Crystal Hunter
 * Finding the rarest crystals.
 */
export const sideCrystalHunter: Quest = {
  id: "side_crystal_hunter",
  name: "Crystal Hunter",
  description:
    "Delva wants to study the purest crystals. Find them in the deepest caves.",
  type: QuestType.Side,
  giverId: "miner_delva",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_deep_mining",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.YoungAdult,
    },
  ],
  objectives: [
    {
      id: "visit_depths",
      type: ObjectiveType.Visit,
      description: "Enter the Shadow Depths",
      target: "shadow_depths",
      quantity: 1,
    },
    {
      id: "collect_essence",
      type: ObjectiveType.Collect,
      description: "Collect Essence Drops",
      target: "material_essence",
      quantity: 5,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 800,
    },
    {
      type: RewardType.Item,
      target: "equip_hunters_eye",
      quantity: 1,
    },
    {
      type: RewardType.XP,
      target: "mining",
      quantity: 200,
    },
  ],
};

// ========================================
// TIDECREST SIDE QUESTS
// ========================================

/**
 * Side Quest: Big Catch
 * Catching impressive fish.
 */
export const sideBigCatch: Quest = {
  id: "side_big_catch",
  name: "The Big Catch",
  description:
    "Marina wants to see your fishing skills. Catch some impressive fish from different waters!",
  type: QuestType.Side,
  giverId: "fisher_marina",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_coastal_explorer",
    },
  ],
  objectives: [
    {
      id: "visit_reef",
      type: ObjectiveType.Visit,
      description: "Visit the Coral Reef",
      target: "coral_reef",
      quantity: 1,
    },
    {
      id: "collect_fish",
      type: ObjectiveType.Collect,
      description: "Collect Grilled Fish",
      target: "food_fish",
      quantity: 10,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 200,
    },
    {
      type: RewardType.XP,
      target: "fishing",
      quantity: 100,
    },
    {
      type: RewardType.Item,
      target: "drink_coconut",
      quantity: 5,
    },
  ],
};

/**
 * Side Quest: Pearl Diving
 * Finding valuable pearls underwater.
 */
export const sidePearlDiving: Quest = {
  id: "side_pearl_diving",
  name: "Pearl Diving",
  description:
    "The reef holds beautiful pearls. Marina knows the best spots - help her gather some!",
  type: QuestType.Side,
  giverId: "fisher_marina",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_big_catch",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.Teen,
    },
  ],
  objectives: [
    {
      id: "explore_reef",
      type: ObjectiveType.Explore,
      description: "Forage in the Coral Reef",
      target: "coral_reef",
      quantity: 5,
    },
    {
      id: "collect_materials",
      type: ObjectiveType.Collect,
      description: "Collect Coral Fragments",
      target: "material_crystal",
      quantity: 8,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 400,
    },
    {
      type: RewardType.XP,
      target: "fishing",
      quantity: 150,
    },
    {
      type: RewardType.Item,
      target: "equip_lucky_charm",
      quantity: 1,
    },
  ],
};

/**
 * Side Quest: Treasure Hunt
 * Captain Torrent's treasure map.
 */
export const sideTreasureHunt: Quest = {
  id: "side_treasure_hunt",
  name: "Treasure Hunt",
  description:
    "Captain Torrent has an old treasure map. Help him find the chest he buried years ago!",
  type: QuestType.Side,
  giverId: "captain_torrent",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Child,
    },
  ],
  objectives: [
    {
      id: "visit_coast",
      type: ObjectiveType.Visit,
      description: "Search the Whispering Coast",
      target: "whispering_coast",
      quantity: 1,
    },
    {
      id: "visit_reef",
      type: ObjectiveType.Visit,
      description: "Search the Coral Reef",
      target: "coral_reef",
      quantity: 1,
    },
    {
      id: "forage_reef",
      type: ObjectiveType.Explore,
      description: "Deep exploration of the reef",
      target: "coral_reef",
      quantity: 3,
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
      target: "equip_lucky_charm",
      quantity: 1,
    },
    {
      type: RewardType.Item,
      target: "food_feast",
      quantity: 2,
    },
  ],
};

/**
 * Side Quest: Temple Expedition
 * Exploring the outer temple.
 */
export const sideTempleExpedition: Quest = {
  id: "side_temple_expedition",
  name: "Temple Expedition",
  description:
    "Coral wants to explore the Sunken Temple's outer chambers. Join her expedition!",
  type: QuestType.Side,
  giverId: "explorer_coral",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Teen,
    },
  ],
  objectives: [
    {
      id: "visit_temple",
      type: ObjectiveType.Visit,
      description: "Enter the Sunken Temple",
      target: "sunken_temple",
      quantity: 1,
    },
    {
      id: "defeat_guardians",
      type: ObjectiveType.Defeat,
      description: "Defeat temple guardians",
      target: "any",
      quantity: 8,
    },
    {
      id: "explore_temple",
      type: ObjectiveType.Explore,
      description: "Explore the temple chambers",
      target: "sunken_temple",
      quantity: 3,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 600,
    },
    {
      type: RewardType.Item,
      target: "equip_guardians_pendant",
      quantity: 1,
    },
    {
      type: RewardType.XP,
      target: "scouting",
      quantity: 150,
    },
  ],
};

/**
 * Side Quest: Reef Survey
 * Mapping the coral reef.
 */
export const sideReefSurvey: Quest = {
  id: "side_reef_survey",
  name: "Reef Survey",
  description:
    "Coral needs help mapping the reef. Explore every corner and record what you find!",
  type: QuestType.Side,
  giverId: "explorer_coral",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Child,
    },
  ],
  objectives: [
    {
      id: "explore_reef",
      type: ObjectiveType.Explore,
      description: "Survey the Coral Reef",
      target: "coral_reef",
      quantity: 5,
    },
    {
      id: "defeat_creatures",
      type: ObjectiveType.Defeat,
      description: "Document reef creatures",
      target: "any",
      quantity: 6,
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
      target: "scouting",
      quantity: 100,
    },
    {
      type: RewardType.Item,
      target: "drink_coconut",
      quantity: 3,
    },
  ],
};

// ========================================
// EXPLORATION NPC SIDE QUESTS
// ========================================

/**
 * Side Quest: Rare Herbs
 * Gathering rare herbs from the grove.
 */
export const sideRareHerbs: Quest = {
  id: "side_rare_herbs",
  name: "Rare Herbs",
  description:
    "Fern is looking for rare medicinal herbs. Help her gather them from the Ancient Grove.",
  type: QuestType.Side,
  giverId: "herbalist_fern",
  requirements: [],
  objectives: [
    {
      id: "visit_grove",
      type: ObjectiveType.Visit,
      description: "Visit the Ancient Grove",
      target: "ancient_grove",
      quantity: 1,
    },
    {
      id: "collect_herbs",
      type: ObjectiveType.Collect,
      description: "Collect Wild Herbs",
      target: "material_herb",
      quantity: 15,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 150,
    },
    {
      type: RewardType.Item,
      target: "medicine_potion",
      quantity: 5,
    },
    {
      type: RewardType.XP,
      target: "foraging",
      quantity: 75,
    },
  ],
};

/**
 * Side Quest: Mushroom Mystery
 * Investigating the Mushroom Hollow.
 */
export const sideMushroomMystery: Quest = {
  id: "side_mushroom_mystery",
  name: "Mushroom Mystery",
  description:
    "Strange mushrooms are appearing in the hollow. Fern wants samples for her research.",
  type: QuestType.Side,
  giverId: "herbalist_fern",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_rare_herbs",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.Child,
    },
  ],
  objectives: [
    {
      id: "visit_hollow",
      type: ObjectiveType.Visit,
      description: "Enter the Mushroom Hollow",
      target: "mushroom_hollow",
      quantity: 1,
    },
    {
      id: "explore_hollow",
      type: ObjectiveType.Explore,
      description: "Explore the hollow",
      target: "mushroom_hollow",
      quantity: 4,
    },
    {
      id: "collect_mushrooms",
      type: ObjectiveType.Collect,
      description: "Collect Mushrooms",
      target: "food_mushroom",
      quantity: 10,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 300,
    },
    {
      type: RewardType.Item,
      target: "medicine_super_potion",
      quantity: 3,
    },
    {
      type: RewardType.XP,
      target: "foraging",
      quantity: 125,
    },
  ],
};

/**
 * Side Quest: Trial by Fire
 * Blaze's heat training challenge.
 */
export const sideTrialByFire: Quest = {
  id: "side_trial_by_fire",
  name: "Trial by Fire",
  description:
    "Blaze wants to test your pet's heat resistance. Survive the volcanic highlands!",
  type: QuestType.Side,
  giverId: "trainer_blaze",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Teen,
    },
  ],
  objectives: [
    {
      id: "visit_highlands",
      type: ObjectiveType.Visit,
      description: "Enter the Scorched Highlands",
      target: "scorched_highlands",
      quantity: 1,
    },
    {
      id: "defeat_fire",
      type: ObjectiveType.Defeat,
      description: "Defeat fire creatures",
      target: "any",
      quantity: 10,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 350,
    },
    {
      type: RewardType.Item,
      target: "battle_defense_boost",
      quantity: 3,
    },
    {
      type: RewardType.XP,
      target: "scouting",
      quantity: 100,
    },
  ],
};

/**
 * Side Quest: Volcanic Champion
 * Conquering the caldera.
 */
export const sideVolcanicChampion: Quest = {
  id: "side_volcanic_champion",
  name: "Volcanic Champion",
  description:
    "Only the strongest pets can survive the Volcanic Caldera. Prove your worth!",
  type: QuestType.Side,
  giverId: "trainer_blaze",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_trial_by_fire",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.YoungAdult,
    },
  ],
  objectives: [
    {
      id: "visit_caldera",
      type: ObjectiveType.Visit,
      description: "Enter the Volcanic Caldera",
      target: "volcanic_caldera",
      quantity: 1,
    },
    {
      id: "defeat_caldera",
      type: ObjectiveType.Defeat,
      description: "Defeat caldera creatures",
      target: "any",
      quantity: 15,
    },
    {
      id: "explore_caldera",
      type: ObjectiveType.Explore,
      description: "Explore the caldera depths",
      target: "volcanic_caldera",
      quantity: 3,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 750,
    },
    {
      type: RewardType.Item,
      target: "equip_hunters_eye",
      quantity: 1,
    },
  ],
};

/**
 * Side Quest: Cold Adaptation
 * Dr. Frost's research assistance.
 */
export const sideColdAdaptation: Quest = {
  id: "side_cold_adaptation",
  name: "Cold Adaptation",
  description:
    "Dr. Frost needs data on how pets adapt to cold. Help with the research!",
  type: QuestType.Side,
  giverId: "dr_frost",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.Teen,
    },
  ],
  objectives: [
    {
      id: "visit_peaks",
      type: ObjectiveType.Visit,
      description: "Explore the Frozen Peaks",
      target: "frozen_peaks",
      quantity: 1,
    },
    {
      id: "explore_peaks",
      type: ObjectiveType.Explore,
      description: "Gather cold adaptation data",
      target: "frozen_peaks",
      quantity: 4,
    },
    {
      id: "defeat_ice",
      type: ObjectiveType.Defeat,
      description: "Study ice creatures in battle",
      target: "any",
      quantity: 8,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 400,
    },
    {
      type: RewardType.Item,
      target: "medicine_antidote",
      quantity: 5,
    },
    {
      type: RewardType.XP,
      target: "scouting",
      quantity: 125,
    },
  ],
};

/**
 * Side Quest: Ice Sample Collection
 * Gathering rare ice samples.
 */
export const sideIceSampleCollection: Quest = {
  id: "side_ice_sample_collection",
  name: "Ice Sample Collection",
  description:
    "Dr. Frost needs ice samples from the Glacial Cavern. Bring back pristine specimens!",
  type: QuestType.Side,
  giverId: "dr_frost",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_cold_adaptation",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.YoungAdult,
    },
  ],
  objectives: [
    {
      id: "visit_cavern",
      type: ObjectiveType.Visit,
      description: "Enter the Glacial Cavern",
      target: "glacial_cavern",
      quantity: 1,
    },
    {
      id: "explore_cavern",
      type: ObjectiveType.Explore,
      description: "Collect ice samples",
      target: "glacial_cavern",
      quantity: 5,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 700,
    },
    {
      type: RewardType.Item,
      target: "equip_guardians_pendant",
      quantity: 1,
    },
  ],
};

/**
 * Side Quest: Embrace Darkness
 * Learning from Gloom.
 */
export const sideEmbraceDarkness: Quest = {
  id: "side_embrace_darkness",
  name: "Embrace Darkness",
  description:
    "Gloom offers to teach the secrets of shadow. But first, you must prove you can survive the dark.",
  type: QuestType.Side,
  giverId: "shadow_gloom",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.YoungAdult,
    },
  ],
  objectives: [
    {
      id: "explore_depths",
      type: ObjectiveType.Explore,
      description: "Navigate the Shadow Depths",
      target: "shadow_depths",
      quantity: 5,
    },
    {
      id: "defeat_shadows",
      type: ObjectiveType.Defeat,
      description: "Defeat shadow creatures",
      target: "any",
      quantity: 12,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 600,
    },
    {
      type: RewardType.Item,
      target: "material_essence",
      quantity: 3,
    },
    {
      type: RewardType.XP,
      target: "scouting",
      quantity: 175,
    },
  ],
};

/**
 * Side Quest: Shadow Essence
 * Collecting essence for Gloom.
 */
export const sideShadowEssence: Quest = {
  id: "side_shadow_essence",
  name: "Shadow Essence",
  description:
    "Gloom needs pure shadow essence for a ritual. Gather it from the darkest depths.",
  type: QuestType.Side,
  giverId: "shadow_gloom",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_embrace_darkness",
    },
  ],
  objectives: [
    {
      id: "collect_essence",
      type: ObjectiveType.Collect,
      description: "Collect Essence Drops",
      target: "material_essence",
      quantity: 10,
    },
    {
      id: "defeat_powerful",
      type: ObjectiveType.Defeat,
      description: "Defeat powerful shadows",
      target: "any",
      quantity: 20,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 1000,
    },
    {
      type: RewardType.Item,
      target: "equip_hunters_eye",
      quantity: 1,
    },
  ],
};

// ========================================
// STARFALL SANCTUARY SIDE QUESTS
// ========================================

/**
 * Side Quest: Starlight Gathering
 * Collecting cosmic energy.
 */
export const sideStarlightGathering: Quest = {
  id: "side_starlight_gathering",
  name: "Starlight Gathering",
  description:
    "Sage Lumina needs crystallized starlight for her research. It only appears in the highest places.",
  type: QuestType.Side,
  giverId: "sage_lumina",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.YoungAdult,
    },
  ],
  objectives: [
    {
      id: "visit_sanctuary",
      type: ObjectiveType.Visit,
      description: "Study at Starfall Sanctuary",
      target: "starfall_sanctuary",
      quantity: 1,
    },
    {
      id: "collect_crystals",
      type: ObjectiveType.Collect,
      description: "Collect Crystal Shards",
      target: "material_crystal",
      quantity: 15,
    },
    {
      id: "collect_essence",
      type: ObjectiveType.Collect,
      description: "Collect Essence Drops",
      target: "material_essence",
      quantity: 5,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 800,
    },
    {
      type: RewardType.Item,
      target: "food_feast",
      quantity: 3,
    },
  ],
};

/**
 * Side Quest: Lost Knowledge
 * Recovering ancient texts.
 */
export const sideLostKnowledge: Quest = {
  id: "side_lost_knowledge",
  name: "Lost Knowledge",
  description:
    "Archivist Echo has located fragments of ancient texts. Recover them from dangerous locations.",
  type: QuestType.Side,
  giverId: "archivist_echo",
  requirements: [
    {
      type: RequirementType.Stage,
      target: GrowthStage.YoungAdult,
    },
  ],
  objectives: [
    {
      id: "visit_temple",
      type: ObjectiveType.Visit,
      description: "Search the Sunken Temple",
      target: "sunken_temple",
      quantity: 1,
    },
    {
      id: "visit_depths",
      type: ObjectiveType.Visit,
      description: "Search the Shadow Depths",
      target: "shadow_depths",
      quantity: 1,
    },
    {
      id: "visit_cavern",
      type: ObjectiveType.Visit,
      description: "Search the Glacial Cavern",
      target: "glacial_cavern",
      quantity: 1,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 900,
    },
    {
      type: RewardType.XP,
      target: "social",
      quantity: 200,
    },
  ],
};

/**
 * Side Quest: Ancient Texts
 * The ultimate knowledge quest.
 */
export const sideAncientTexts: Quest = {
  id: "side_ancient_texts",
  name: "Ancient Texts",
  description:
    "Echo believes the Celestial Spire holds the oldest texts. Brave its heights and return with knowledge.",
  type: QuestType.Side,
  giverId: "archivist_echo",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "side_lost_knowledge",
    },
    {
      type: RequirementType.Stage,
      target: GrowthStage.Adult,
    },
  ],
  objectives: [
    {
      id: "visit_spire",
      type: ObjectiveType.Visit,
      description: "Climb the Celestial Spire",
      target: "celestial_spire",
      quantity: 1,
    },
    {
      id: "explore_spire",
      type: ObjectiveType.Explore,
      description: "Search for ancient knowledge",
      target: "celestial_spire",
      quantity: 5,
    },
    {
      id: "defeat_guardians",
      type: ObjectiveType.Defeat,
      description: "Overcome the spire guardians",
      target: "any",
      quantity: 20,
    },
  ],
  rewards: [
    {
      type: RewardType.Currency,
      target: "coins",
      quantity: 2000,
    },
    {
      type: RewardType.Item,
      target: "equip_hunters_eye",
      quantity: 1,
    },
    {
      type: RewardType.Item,
      target: "food_feast",
      quantity: 5,
    },
  ],
};

/**
 * All side quests indexed by ID.
 */
export const sideQuests: Record<string, Quest> = {
  // Willowbrook
  [sideCoastalExplorer.id]: sideCoastalExplorer,
  [sideMaterialGatherer.id]: sideMaterialGatherer,
  [sideMonsterHunter.id]: sideMonsterHunter,
  [sideRareCollector.id]: sideRareCollector,
  [sideGourmetChef.id]: sideGourmetChef,
  // Ironhaven
  [sideOreCollector.id]: sideOreCollector,
  [sideForgeMaster.id]: sideForgeMaster,
  [sideDeepMining.id]: sideDeepMining,
  [sideCrystalHunter.id]: sideCrystalHunter,
  // Tidecrest
  [sideBigCatch.id]: sideBigCatch,
  [sidePearlDiving.id]: sidePearlDiving,
  [sideTreasureHunt.id]: sideTreasureHunt,
  [sideTempleExpedition.id]: sideTempleExpedition,
  [sideReefSurvey.id]: sideReefSurvey,
  // Exploration NPCs
  [sideRareHerbs.id]: sideRareHerbs,
  [sideMushroomMystery.id]: sideMushroomMystery,
  [sideTrialByFire.id]: sideTrialByFire,
  [sideVolcanicChampion.id]: sideVolcanicChampion,
  [sideColdAdaptation.id]: sideColdAdaptation,
  [sideIceSampleCollection.id]: sideIceSampleCollection,
  [sideEmbraceDarkness.id]: sideEmbraceDarkness,
  [sideShadowEssence.id]: sideShadowEssence,
  // Starfall Sanctuary
  [sideStarlightGathering.id]: sideStarlightGathering,
  [sideLostKnowledge.id]: sideLostKnowledge,
  [sideAncientTexts.id]: sideAncientTexts,
};
