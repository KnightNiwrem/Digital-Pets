/**
 * Drop table definitions for exploration activities.
 *
 * Each drop table defines possible item drops with roll-based probability.
 * A single roll determines all drops: items with minRoll <= roll are awarded.
 * Higher skill levels can unlock additional entries for the same item.
 */

import { DRINK_ITEMS } from "@/game/data/items/drinks";
import { FOOD_ITEMS } from "@/game/data/items/food";
import { MATERIAL_ITEMS } from "@/game/data/items/materials";
import { GrowthStage } from "@/game/types/constants";
import type { DropTable } from "@/game/types/exploration";
import { SkillType } from "@/game/types/skill";
import { ActivityId } from "./activities";

// ============================================================================
// Sunny Meadow Drop Tables
// Beginner area - common items, low requirements
// ============================================================================

/**
 * Sunny Meadow foraging drops - herbs, berries, and basic materials.
 */
export const meadowForagingDropTable: DropTable = {
  id: "meadow_foraging",
  entries: [
    // Base herb drop - always available
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Second herb - higher roll required
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Bonus herb - requires foraging skill 3+
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 3 },
      },
    },
    // Base berries drop
    {
      itemId: FOOD_ITEMS.BERRIES.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Bonus berries - skill 5+
    {
      itemId: FOOD_ITEMS.BERRIES.id,
      quantity: 1,
      minRoll: 0.2,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 5 },
      },
    },
    // Plant fiber - common material
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Apple - rare find in meadow
    {
      itemId: FOOD_ITEMS.APPLE.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Misty Woods Drop Tables
// Intermediate area - better materials, some skill requirements
// ============================================================================

/**
 * Misty Woods foraging drops - mushrooms, wood, and herbs.
 */
export const woodsForagingDropTable: DropTable = {
  id: "woods_foraging",
  entries: [
    // Base wood drop
    {
      itemId: MATERIAL_ITEMS.WOOD.id,
      quantity: 1,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Second wood - higher roll
    {
      itemId: MATERIAL_ITEMS.WOOD.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Bonus wood - skill 4+
    {
      itemId: MATERIAL_ITEMS.WOOD.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 4 },
      },
    },
    // Mushroom drop
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Rare mushroom - skill 6+
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 1,
      minRoll: 0.2,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 6 },
      },
    },
    // Herb drop
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Monster fang - rare
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.85,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Whispering Coast Drop Tables
// Coastal area - fish, shells, and aquatic materials
// ============================================================================

/**
 * Whispering Coast foraging drops - coastal plants and shells.
 */
export const coastForagingDropTable: DropTable = {
  id: "coast_foraging",
  entries: [
    // Plant fiber from coastal grasses
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      quantity: 1,
      minRoll: 0.2,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Herb - coastal varieties
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.35,
      requirements: undefined,
    },
    // Berries - beach berries
    {
      itemId: FOOD_ITEMS.BERRIES.id,
      quantity: 1,
      minRoll: 0.15,
      requirements: undefined,
    },
    // Stone - beach pebbles
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Coconut - coastal fruit
    {
      itemId: DRINK_ITEMS.COCONUT.id,
      quantity: 1,
      minRoll: 0.55,
      requirements: undefined,
    },
  ],
};

/**
 * Whispering Coast fishing drops - fish and aquatic items.
 */
export const coastFishingDropTable: DropTable = {
  id: "coast_fishing",
  entries: [
    // Base fish catch
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 1,
      minRoll: 0.25,
      requirements: undefined,
    },
    // Second fish - better roll
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Bonus fish - fishing skill 3+
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: {
        minSkillLevels: { [SkillType.Fishing]: 3 },
      },
    },
    // Rare catch - fishing skill 5+
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: {
        minSkillLevels: { [SkillType.Fishing]: 5 },
      },
    },
  ],
};

// ============================================================================
// Crystal Caves Drop Tables
// Dungeon - mining focus, rare crystals
// ============================================================================

/**
 * Crystal Caves foraging drops - cave mushrooms and minerals.
 */
export const cavesForagingDropTable: DropTable = {
  id: "caves_foraging",
  entries: [
    // Cave mushrooms
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 1,
      minRoll: 0.25,
      requirements: undefined,
    },
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Crystal shard - rare
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.8,
      requirements: undefined,
    },
    // Extra crystal - skill 8+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 8 },
      },
    },
  ],
};

/**
 * Crystal Caves mining drops - ores and crystals.
 */
export const cavesMiningDropTable: DropTable = {
  id: "caves_mining",
  entries: [
    // Base stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.15,
      requirements: undefined,
    },
    // Iron ore - main reward
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.25,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.45,
      requirements: undefined,
    },
    // Bonus ore - mining skill 4+
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: {
        minSkillLevels: { [SkillType.Mining]: 4 },
      },
    },
    // Crystal - rare
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
    // Crystal - mining skill 6+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.55,
      requirements: {
        minSkillLevels: { [SkillType.Mining]: 6 },
      },
    },
    // Essence - very rare
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.95,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Scorched Highlands Drop Tables
// Volcanic area - fire materials, rare ores
// ============================================================================

/**
 * Scorched Highlands foraging drops - volcanic plants and materials.
 */
export const highlandsForagingDropTable: DropTable = {
  id: "highlands_foraging",
  entries: [
    // Fire-resistant herbs
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Stone - volcanic rock
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Monster fang - more common here
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: undefined,
    },
    // Extra fang - foraging skill 7+
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 7 },
      },
    },
  ],
};

/**
 * Scorched Highlands mining drops - volcanic ores.
 */
export const highlandsMiningDropTable: DropTable = {
  id: "highlands_mining",
  entries: [
    // Volcanic stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Iron ore - abundant
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.2,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: undefined,
    },
    // Bonus ore - mining 5+
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.35,
      requirements: {
        minSkillLevels: { [SkillType.Mining]: 5 },
      },
    },
    // Crystal - volcanic variety
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.75,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Ancient Grove Drop Tables
// Mystical forest - rare herbs and essence
// ============================================================================

/**
 * Ancient Grove foraging drops - rare herbs and mystical materials.
 */
export const groveForagingDropTable: DropTable = {
  id: "grove_foraging",
  entries: [
    // Premium herbs
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 2,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Bonus herbs - skill 5+
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 5 },
      },
    },
    // Ancient wood
    {
      itemId: MATERIAL_ITEMS.WOOD.id,
      quantity: 1,
      minRoll: 0.35,
      requirements: undefined,
    },
    // Berries
    {
      itemId: FOOD_ITEMS.BERRIES.id,
      quantity: 2,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Essence - mystical area has higher chance
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.85,
      requirements: undefined,
    },
    // Extra essence - foraging 10+
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 10 },
      },
    },
  ],
};

// ============================================================================
// Mushroom Hollow Drop Tables
// Fungal caves - mushrooms and unique materials
// ============================================================================

/**
 * Mushroom Hollow foraging drops - primarily mushrooms.
 */
export const hollowForagingDropTable: DropTable = {
  id: "hollow_foraging",
  entries: [
    // Abundant mushrooms
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 2,
      minRoll: 0.15,
      requirements: undefined,
    },
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 2,
      minRoll: 0.35,
      requirements: undefined,
    },
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 2,
      minRoll: 0.55,
      requirements: undefined,
    },
    // Bonus mushrooms - skill 4+
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 4 },
      },
    },
    // Fiber from fungal growths
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Crystal - bioluminescent
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.8,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Coral Reef Drop Tables
// Underwater - fish and aquatic materials
// ============================================================================

/**
 * Coral Reef foraging drops - underwater plants.
 */
export const reefForagingDropTable: DropTable = {
  id: "reef_foraging",
  entries: [
    // Aquatic fiber
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Underwater herbs
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.35,
      requirements: undefined,
    },
    // Crystal - coral crystal
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.75,
      requirements: undefined,
    },
    // Bonus crystal - skill 7+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 7 },
      },
    },
  ],
};

/**
 * Coral Reef fishing drops - best fishing spot.
 */
export const reefFishingDropTable: DropTable = {
  id: "reef_fishing",
  entries: [
    // Abundant fish
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 2,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Bonus fish - skill 4+
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: {
        minSkillLevels: { [SkillType.Fishing]: 4 },
      },
    },
    // Premium catch - skill 8+
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 3,
      minRoll: 0.3,
      requirements: {
        minSkillLevels: { [SkillType.Fishing]: 8 },
      },
    },
  ],
};

// ============================================================================
// Shadow Depths Drop Tables
// End-game dungeon - rare materials
// ============================================================================

/**
 * Shadow Depths foraging drops - rare shadow materials.
 */
export const depthsForagingDropTable: DropTable = {
  id: "depths_foraging",
  entries: [
    // Shadow mushrooms
    {
      itemId: FOOD_ITEMS.MUSHROOM.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: undefined,
    },
    // Monster fangs - common
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Bonus fangs - skill 10+
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 2,
      minRoll: 0.35,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 10 },
      },
    },
    // Crystal - shadow crystal
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: undefined,
    },
    // Essence - more common in depths
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.75,
      requirements: undefined,
    },
    // Extra essence - skill 15+
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 15 },
      },
    },
  ],
};

/**
 * Shadow Depths mining drops - rare ores and essence.
 */
export const depthsMiningDropTable: DropTable = {
  id: "depths_mining",
  entries: [
    // Iron ore
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Crystal - abundant
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.35,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.55,
      requirements: undefined,
    },
    // Bonus crystal - skill 8+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.4,
      requirements: {
        minSkillLevels: { [SkillType.Mining]: 8 },
      },
    },
    // Essence - high chance
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.65,
      requirements: undefined,
    },
    // Extra essence - skill 12+
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: {
        minSkillLevels: { [SkillType.Mining]: 12 },
      },
    },
  ],
};

// ============================================================================
// Frozen Peaks Drop Tables
// Ice mountain - ice materials
// ============================================================================

/**
 * Frozen Peaks foraging drops - cold-resistant plants.
 */
export const peaksForagingDropTable: DropTable = {
  id: "peaks_foraging",
  entries: [
    // Ice herbs
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 1,
      minRoll: 0.35,
      requirements: undefined,
    },
    // Stone - frost stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: undefined,
    },
    // Crystal - ice crystal
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: undefined,
    },
    // Bonus crystal - skill 8+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.45,
      requirements: {
        minSkillLevels: { [SkillType.Foraging]: 8 },
      },
    },
  ],
};

/**
 * Frozen Peaks mining drops - ice ores.
 */
export const peaksMiningDropTable: DropTable = {
  id: "peaks_mining",
  entries: [
    // Stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Iron ore
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.3,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Crystal - ice variety
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.55,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.75,
      requirements: undefined,
    },
    // Bonus crystal - skill 7+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.45,
      requirements: {
        minSkillLevels: { [SkillType.Mining]: 7 },
      },
    },
  ],
};

// ============================================================================
// Deep Exploration Drop Tables (for advanced areas)
// Used when performing deep exploration at any eligible location
// ============================================================================

/**
 * Generic deep exploration drop table for most areas.
 * Better rewards across the board.
 */
export const genericDeepExplorationDropTable: DropTable = {
  id: "generic_deep_exploration",
  entries: [
    // Guaranteed materials
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 3,
      minRoll: 0.1,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.WOOD.id,
      quantity: 2,
      minRoll: 0.15,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Good chance of ores
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.3,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Monster materials
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: undefined,
    },
    // Crystal - better chance
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
    // Bonus crystal - scouting skill 8+
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.55,
      requirements: {
        minSkillLevels: { [SkillType.Scouting]: 8 },
      },
    },
    // Essence - decent chance on deep exploration
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.75,
      requirements: undefined,
    },
    // Extra essence - adult pets with high skill
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: {
        minPetStage: GrowthStage.Adult,
      },
    },
  ],
};

// ============================================================================
// Volcanic Caldera Drop Tables
// End-game fire area
// ============================================================================

/**
 * Volcanic Caldera foraging drops.
 */
export const calderaForagingDropTable: DropTable = {
  id: "caldera_foraging",
  entries: [
    // Volcanic stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 3,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Monster fangs
    {
      itemId: MATERIAL_ITEMS.MONSTER_FANG.id,
      quantity: 2,
      minRoll: 0.35,
      requirements: undefined,
    },
    // Crystal - volcanic
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.55,
      requirements: undefined,
    },
    // Essence
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
  ],
};

/**
 * Volcanic Caldera mining drops.
 */
export const calderaMiningDropTable: DropTable = {
  id: "caldera_mining",
  entries: [
    // Iron ore - abundant
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 3,
      minRoll: 0.15,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.35,
      requirements: undefined,
    },
    // Crystal
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.45,
      requirements: undefined,
    },
    // Essence - higher chance
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.6,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.8,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Sunken Temple Drop Tables
// Underwater dungeon
// ============================================================================

/**
 * Sunken Temple foraging drops.
 */
export const templeForagingDropTable: DropTable = {
  id: "temple_foraging",
  entries: [
    // Aquatic materials
    {
      itemId: MATERIAL_ITEMS.FIBER.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 2,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Crystal - ancient temple crystal
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Essence - temple magic
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
  ],
};

/**
 * Sunken Temple fishing drops.
 */
export const templeFishingDropTable: DropTable = {
  id: "temple_fishing",
  entries: [
    // Temple fish
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 2,
      minRoll: 0.4,
      requirements: undefined,
    },
    // Ancient catch - skill 6+
    {
      itemId: FOOD_ITEMS.FISH.id,
      quantity: 3,
      minRoll: 0.3,
      requirements: {
        minSkillLevels: { [SkillType.Fishing]: 6 },
      },
    },
    // Essence from magical fish
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.85,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Glacial Cavern Drop Tables
// Ice dungeon
// ============================================================================

/**
 * Glacial Cavern foraging drops.
 */
export const glacialForagingDropTable: DropTable = {
  id: "glacial_foraging",
  entries: [
    // Ice plants
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 2,
      minRoll: 0.3,
      requirements: undefined,
    },
    // Ice crystal
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.45,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 1,
      minRoll: 0.65,
      requirements: undefined,
    },
    // Essence
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.75,
      requirements: undefined,
    },
  ],
};

/**
 * Glacial Cavern mining drops.
 */
export const glacialMiningDropTable: DropTable = {
  id: "glacial_mining",
  entries: [
    // Stone
    {
      itemId: MATERIAL_ITEMS.STONE.id,
      quantity: 2,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Iron ore
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 2,
      minRoll: 0.25,
      requirements: undefined,
    },
    // Crystal - ice-rich
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.4,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.6,
      requirements: undefined,
    },
    // Essence
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Celestial Spire Drop Tables
// Ultimate end-game zone
// ============================================================================

/**
 * Celestial Spire foraging drops.
 */
export const spireForagingDropTable: DropTable = {
  id: "spire_foraging",
  entries: [
    // Celestial herbs
    {
      itemId: MATERIAL_ITEMS.HERB.id,
      quantity: 3,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Crystal - celestial
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.35,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.55,
      requirements: undefined,
    },
    // Essence - abundant at peak
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.5,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.7,
      requirements: undefined,
    },
    // Extra essence - adult pets
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.4,
      requirements: {
        minPetStage: GrowthStage.Adult,
      },
    },
  ],
};

/**
 * Celestial Spire mining drops.
 */
export const spireMiningDropTable: DropTable = {
  id: "spire_mining",
  entries: [
    // Iron ore
    {
      itemId: MATERIAL_ITEMS.IRON_ORE.id,
      quantity: 3,
      minRoll: 0.2,
      requirements: undefined,
    },
    // Crystal - abundant
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.3,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.CRYSTAL.id,
      quantity: 2,
      minRoll: 0.5,
      requirements: undefined,
    },
    // Essence - high chance
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.45,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.65,
      requirements: undefined,
    },
    {
      itemId: MATERIAL_ITEMS.ESSENCE.id,
      quantity: 1,
      minRoll: 0.85,
      requirements: undefined,
    },
  ],
};

// ============================================================================
// Drop Table Registry
// ============================================================================

/**
 * All drop tables indexed by ID.
 */
export const DROP_TABLES: Record<string, DropTable> = {
  // Meadow
  [meadowForagingDropTable.id]: meadowForagingDropTable,
  // Woods
  [woodsForagingDropTable.id]: woodsForagingDropTable,
  // Coast
  [coastForagingDropTable.id]: coastForagingDropTable,
  [coastFishingDropTable.id]: coastFishingDropTable,
  // Caves
  [cavesForagingDropTable.id]: cavesForagingDropTable,
  [cavesMiningDropTable.id]: cavesMiningDropTable,
  // Highlands
  [highlandsForagingDropTable.id]: highlandsForagingDropTable,
  [highlandsMiningDropTable.id]: highlandsMiningDropTable,
  // Grove
  [groveForagingDropTable.id]: groveForagingDropTable,
  // Hollow
  [hollowForagingDropTable.id]: hollowForagingDropTable,
  // Reef
  [reefForagingDropTable.id]: reefForagingDropTable,
  [reefFishingDropTable.id]: reefFishingDropTable,
  // Depths
  [depthsForagingDropTable.id]: depthsForagingDropTable,
  [depthsMiningDropTable.id]: depthsMiningDropTable,
  // Peaks
  [peaksForagingDropTable.id]: peaksForagingDropTable,
  [peaksMiningDropTable.id]: peaksMiningDropTable,
  // Deep exploration
  [genericDeepExplorationDropTable.id]: genericDeepExplorationDropTable,
  // Caldera
  [calderaForagingDropTable.id]: calderaForagingDropTable,
  [calderaMiningDropTable.id]: calderaMiningDropTable,
  // Temple
  [templeForagingDropTable.id]: templeForagingDropTable,
  [templeFishingDropTable.id]: templeFishingDropTable,
  // Glacial
  [glacialForagingDropTable.id]: glacialForagingDropTable,
  [glacialMiningDropTable.id]: glacialMiningDropTable,
  // Spire
  [spireForagingDropTable.id]: spireForagingDropTable,
  [spireMiningDropTable.id]: spireMiningDropTable,
};

/**
 * Array of all drop tables for iteration.
 */
export const DROP_TABLES_LIST: readonly DropTable[] =
  Object.values(DROP_TABLES);

/**
 * Get a drop table by ID.
 */
export function getDropTableById(id: string): DropTable | undefined {
  return DROP_TABLES[id];
}

/**
 * Location to drop table mapping.
 * Maps locationId → activityId → array of drop table IDs.
 */
export const LOCATION_DROP_TABLE_IDS: Record<
  string,
  Record<string, string[]>
> = {
  meadow: {
    [ActivityId.Foraging]: [meadowForagingDropTable.id],
  },
  misty_woods: {
    [ActivityId.Foraging]: [woodsForagingDropTable.id],
  },
  whispering_coast: {
    [ActivityId.Foraging]: [coastForagingDropTable.id],
    [ActivityId.Fishing]: [coastFishingDropTable.id],
  },
  scorched_highlands: {
    [ActivityId.Foraging]: [highlandsForagingDropTable.id],
    [ActivityId.Mining]: [highlandsMiningDropTable.id],
  },
  crystal_caves: {
    [ActivityId.Foraging]: [cavesForagingDropTable.id],
    [ActivityId.Mining]: [cavesMiningDropTable.id],
  },
  shadow_depths: {
    [ActivityId.Foraging]: [depthsForagingDropTable.id],
    [ActivityId.Mining]: [depthsMiningDropTable.id],
    [ActivityId.DeepExploration]: [genericDeepExplorationDropTable.id],
  },
  ancient_grove: {
    [ActivityId.Foraging]: [groveForagingDropTable.id],
  },
  mushroom_hollow: {
    [ActivityId.Foraging]: [hollowForagingDropTable.id],
  },
  coral_reef: {
    [ActivityId.Foraging]: [reefForagingDropTable.id],
    [ActivityId.Fishing]: [reefFishingDropTable.id],
  },
  frozen_peaks: {
    [ActivityId.Foraging]: [peaksForagingDropTable.id],
    [ActivityId.Mining]: [peaksMiningDropTable.id],
  },
  volcanic_caldera: {
    [ActivityId.Foraging]: [calderaForagingDropTable.id],
    [ActivityId.Mining]: [calderaMiningDropTable.id],
    [ActivityId.DeepExploration]: [genericDeepExplorationDropTable.id],
  },
  sunken_temple: {
    [ActivityId.Foraging]: [templeForagingDropTable.id],
    [ActivityId.Fishing]: [templeFishingDropTable.id],
  },
  glacial_cavern: {
    [ActivityId.Foraging]: [glacialForagingDropTable.id],
    [ActivityId.Mining]: [glacialMiningDropTable.id],
    [ActivityId.DeepExploration]: [genericDeepExplorationDropTable.id],
  },
  celestial_spire: {
    [ActivityId.Foraging]: [spireForagingDropTable.id],
    [ActivityId.Mining]: [spireMiningDropTable.id],
    [ActivityId.DeepExploration]: [genericDeepExplorationDropTable.id],
  },
};
