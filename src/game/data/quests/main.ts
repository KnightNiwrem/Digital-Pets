/**
 * Main story quest chain.
 */

import {
  ObjectiveType,
  type Quest,
  QuestType,
  RequirementType,
  RewardType,
} from "@/game/types/quest";

/**
 * Main Quest 1: A New Journey
 * Introduction to the wider world after the tutorial.
 */
export const mainNewJourney: Quest = {
  id: "main_new_journey",
  name: "A New Journey",
  description:
    "Your bond with your pet has grown stronger. It's time to venture beyond the meadow and discover what lies in the wider world.",
  type: QuestType.Main,
  giverId: "trainer_oak",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "tutorial_training",
    },
  ],
  objectives: [
    {
      id: "visit_woods",
      type: ObjectiveType.Visit,
      description: "Explore the Misty Woods",
      target: "misty_woods",
      quantity: 1,
    },
    {
      id: "win_battle",
      type: ObjectiveType.Defeat,
      description: "Win a battle in the Misty Woods",
      target: "any",
      quantity: 1,
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
      quantity: 3,
    },
  ],
  chainNext: "main_crystal_discovery",
};

/**
 * Main Quest 2: Crystal Discovery
 * Discover the Crystal Caves.
 */
export const mainCrystalDiscovery: Quest = {
  id: "main_crystal_discovery",
  name: "Crystal Discovery",
  description:
    "Rumors speak of hidden caves filled with glowing crystals. Find the entrance to the Crystal Caves and explore their mysteries.",
  type: QuestType.Main,
  giverId: "trainer_oak",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "main_new_journey",
    },
    {
      type: RequirementType.Stage,
      target: "child",
    },
  ],
  objectives: [
    {
      id: "visit_caves",
      type: ObjectiveType.Visit,
      description: "Find and enter the Crystal Caves",
      target: "crystal_caves",
      quantity: 1,
    },
    {
      id: "collect_crystal",
      type: ObjectiveType.Collect,
      description: "Collect Crystal Shards",
      target: "material_crystal",
      quantity: 3,
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
      target: "equip_lucky_charm",
      quantity: 1,
    },
    {
      type: RewardType.Unlock,
      target: "coralite",
      quantity: 1,
    },
  ],
  chainPrevious: "main_new_journey",
  chainNext: "main_rising_flames",
};

/**
 * Main Quest 3: Rising Flames
 * Venture to the Scorched Highlands.
 */
export const mainRisingFlames: Quest = {
  id: "main_rising_flames",
  name: "Rising Flames",
  description:
    "Something stirs in the volcanic highlands. The ground rumbles and smoke rises. Investigate the disturbance.",
  type: QuestType.Main,
  giverId: "trainer_oak",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "main_crystal_discovery",
    },
    {
      type: RequirementType.Stage,
      target: "teen",
    },
  ],
  objectives: [
    {
      id: "visit_highlands",
      type: ObjectiveType.Visit,
      description: "Travel to the Scorched Highlands",
      target: "scorched_highlands",
      quantity: 1,
    },
    {
      id: "defeat_emberfox",
      type: ObjectiveType.Defeat,
      description: "Defeat wild Emberfox",
      target: "emberfox",
      quantity: 3,
    },
    {
      id: "collect_ore",
      type: ObjectiveType.Collect,
      description: "Collect Iron Ore",
      target: "material_iron_ore",
      quantity: 5,
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
      target: "medicine_super_potion",
      quantity: 3,
    },
    {
      type: RewardType.Unlock,
      target: "emberfox",
      quantity: 1,
    },
  ],
  chainPrevious: "main_crystal_discovery",
  chainNext: "main_shadow_depths",
};

/**
 * Main Quest 4: Into the Shadow Depths
 * The final main story quest.
 */
export const mainShadowDepths: Quest = {
  id: "main_shadow_depths",
  name: "Into the Shadow Depths",
  description:
    "Ancient legends speak of a realm of eternal darkness. Only the bravest pets dare to venture into the Shadow Depths.",
  type: QuestType.Main,
  giverId: "trainer_oak",
  requirements: [
    {
      type: RequirementType.Quest,
      target: "main_rising_flames",
    },
    {
      type: RequirementType.Stage,
      target: "youngAdult",
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
      id: "defeat_shadowmoth",
      type: ObjectiveType.Defeat,
      description: "Defeat powerful Shadowmoth",
      target: "shadowmoth",
      quantity: 5,
    },
    {
      id: "collect_essence",
      type: ObjectiveType.Collect,
      description: "Collect Essence Drops",
      target: "material_essence",
      quantity: 3,
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
    {
      type: RewardType.Unlock,
      target: "shadowmoth",
      quantity: 1,
    },
  ],
  chainPrevious: "main_rising_flames",
};

/**
 * All main story quests indexed by ID.
 */
export const mainQuests: Record<string, Quest> = {
  [mainNewJourney.id]: mainNewJourney,
  [mainCrystalDiscovery.id]: mainCrystalDiscovery,
  [mainRisingFlames.id]: mainRisingFlames,
  [mainShadowDepths.id]: mainShadowDepths,
};
