/**
 * Exploration activity definitions.
 *
 * Each activity defines its properties, requirements, and skill rewards.
 * Activities are available at locations that include them in their dropTableIds.
 */

import type { Tick } from "@/game/types/common";
import { GrowthStage } from "@/game/types/constants";
import type { ExplorationActivity } from "@/game/types/exploration";
import { SkillType } from "@/game/types/skill";

/**
 * Activity IDs as a const object for type-safe references.
 */
export const ActivityId = {
  Foraging: "foraging",
  Mining: "mining",
  Fishing: "fishing",
  DeepExploration: "deep_exploration",
} as const;

export type ActivityId = (typeof ActivityId)[keyof typeof ActivityId];

/**
 * Foraging - Basic gathering activity available from the start.
 * Low energy cost, short duration, rewards foraging skill XP.
 */
export const foragingActivity: ExplorationActivity = {
  id: ActivityId.Foraging,
  name: "Foraging",
  description:
    "Search the area for herbs, berries, and other natural resources. A safe activity for pets of all ages.",
  duration: 10 as Tick,
  energyCost: 15,
  requirements: undefined, // No requirements - available from start
  encounterChance: 0.15, // Low encounter chance
  cooldownDuration: 5 as Tick,
  skillFactors: {
    [SkillType.Foraging]: 1.0, // Primary skill
  },
};

/**
 * Mining - Resource extraction activity requiring mining skill.
 * Higher energy cost, longer duration, better material rewards.
 */
export const miningActivity: ExplorationActivity = {
  id: ActivityId.Mining,
  name: "Mining",
  description:
    "Extract ores and minerals from rocky areas. Requires some mining knowledge to perform safely.",
  duration: 15 as Tick,
  energyCost: 20,
  requirements: {
    minSkillLevels: {
      [SkillType.Mining]: 1,
    },
  },
  encounterChance: 0.2, // Low-medium encounter chance
  cooldownDuration: 8 as Tick,
  skillFactors: {
    [SkillType.Mining]: 1.0, // Primary skill
  },
};

/**
 * Fishing - Aquatic resource gathering activity.
 * Available at coastal/water locations.
 */
export const fishingActivity: ExplorationActivity = {
  id: ActivityId.Fishing,
  name: "Fishing",
  description:
    "Cast a line and see what bites. Patience is key to catching the best fish.",
  duration: 12 as Tick,
  energyCost: 18,
  requirements: {
    minSkillLevels: {
      [SkillType.Fishing]: 1,
    },
  },
  encounterChance: 0.1, // Low encounter chance - peaceful activity
  cooldownDuration: 6 as Tick,
  skillFactors: {
    [SkillType.Fishing]: 1.0, // Primary skill
  },
};

/**
 * Deep Exploration - Advanced exploration requiring multiple skills.
 * High energy cost, long duration, best rewards and highest encounter chance.
 */
export const deepExplorationActivity: ExplorationActivity = {
  id: ActivityId.DeepExploration,
  name: "Deep Exploration",
  description:
    "Venture deep into unexplored territory. Dangerous but potentially very rewarding for experienced adventurers.",
  duration: 30 as Tick,
  energyCost: 40,
  requirements: {
    minPetStage: GrowthStage.Adult,
    minSkillLevels: {
      [SkillType.Foraging]: 5,
      [SkillType.Scouting]: 5,
    },
  },
  encounterChance: 0.5, // High encounter chance
  cooldownDuration: 20 as Tick,
  skillFactors: {
    [SkillType.Foraging]: 0.5,
    [SkillType.Scouting]: 0.5,
    [SkillType.Mining]: 0.25, // Bonus XP for related skills
  },
};

/**
 * All exploration activities indexed by ID.
 */
export const EXPLORATION_ACTIVITIES: Record<string, ExplorationActivity> = {
  [ActivityId.Foraging]: foragingActivity,
  [ActivityId.Mining]: miningActivity,
  [ActivityId.Fishing]: fishingActivity,
  [ActivityId.DeepExploration]: deepExplorationActivity,
};

/**
 * Array of all exploration activities for iteration.
 */
export const EXPLORATION_ACTIVITIES_LIST: readonly ExplorationActivity[] =
  Object.values(EXPLORATION_ACTIVITIES);

/**
 * Get an exploration activity by ID.
 */
export function getActivityById(id: string): ExplorationActivity | undefined {
  return EXPLORATION_ACTIVITIES[id];
}
