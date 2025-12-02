/**
 * Exploration system core logic.
 *
 * Implements the new activity-based exploration system with:
 * - Activity requirements checking
 * - Roll-based drop calculation
 * - Session management with energy refund on cancel
 * - Cooldown tracking per activity per location
 * - Skill XP rewards via skillFactors
 */

import { addXpToPlayerSkill } from "@/game/core/skills";
import { getActivityById } from "@/game/data/exploration/activities";
import { getDropTableById } from "@/game/data/exploration/dropTables";
import { getLocation } from "@/game/data/locations";
import type {
  ActiveExploration,
  ExplorationDrop,
  ExplorationRequirements,
} from "@/game/types/activity";
import type { Tick } from "@/game/types/common";
import { toMicro } from "@/game/types/common";
import { ActivityState, GROWTH_STAGE_ORDER } from "@/game/types/constants";
import type { ExplorationActivity } from "@/game/types/exploration";
import type { Pet } from "@/game/types/pet";
import type { PlayerSkills } from "@/game/types/skill";

/**
 * Base XP granted per exploration completion.
 */
const BASE_EXPLORATION_XP = 15;

/**
 * Result of checking if exploration can start.
 */
export interface CanStartExplorationResult {
  /** Whether the activity can be started */
  canStart: boolean;
  /** Reason why the activity cannot be started (if canStart is false) */
  reason?: string;
}

/**
 * Result of starting an exploration activity.
 */
export interface StartExplorationResult {
  /** Whether starting was successful */
  success: boolean;
  /** Updated pet state */
  pet: Pet;
  /** Error message if unsuccessful */
  message?: string;
}

/**
 * Result of completing an exploration activity.
 */
export interface CompleteExplorationResult {
  /** Whether completion was successful */
  success: boolean;
  /** Updated pet state with exploration cleared */
  pet: Pet;
  /** Items found during exploration */
  itemsFound: ExplorationDrop[];
  /** Skill XP gains by skill ID */
  skillXpGains: Record<string, number>;
  /** Message describing the result */
  message: string;
}

/**
 * Progress information for an active exploration.
 */
export interface ExplorationProgress {
  /** Activity being performed */
  activityId: string;
  /** Activity display name */
  activityName: string;
  /** Location ID */
  locationId: string;
  /** Total duration in ticks */
  totalTicks: Tick;
  /** Ticks remaining */
  ticksRemaining: Tick;
  /** Progress percentage (0-100) */
  progressPercent: number;
}

/**
 * Check if a pet meets exploration requirements.
 */
export function meetsRequirements(
  pet: Pet,
  skills: PlayerSkills,
  completedQuestIds: string[],
  requirements?: ExplorationRequirements,
): { meets: boolean; reason?: string } {
  if (!requirements) {
    return { meets: true };
  }

  // Check minimum skill levels
  if (requirements.minSkillLevels) {
    for (const [skillId, minLevel] of Object.entries(
      requirements.minSkillLevels,
    )) {
      const skill = skills[skillId as keyof PlayerSkills];
      if (!skill || skill.level < minLevel) {
        return {
          meets: false,
          reason: `Requires ${skillId} level ${minLevel}`,
        };
      }
    }
  }

  // Check minimum pet stage
  if (requirements.minPetStage) {
    const petStageIndex = GROWTH_STAGE_ORDER.indexOf(pet.growth.stage);
    const requiredIndex = GROWTH_STAGE_ORDER.indexOf(requirements.minPetStage);
    if (petStageIndex < requiredIndex) {
      return {
        meets: false,
        reason: `Requires ${requirements.minPetStage} stage or higher`,
      };
    }
  }

  // Check completed quests
  if (requirements.questCompleted) {
    for (const questId of requirements.questCompleted) {
      if (!completedQuestIds.includes(questId)) {
        return {
          meets: false,
          reason: `Requires quest "${questId}" to be completed`,
        };
      }
    }
  }

  return { meets: true };
}

/**
 * Check if an exploration activity can be started.
 */
export function canStartExplorationActivity(
  pet: Pet,
  skills: PlayerSkills,
  completedQuestIds: string[],
  locationId: string,
  activityId: string,
  currentTick: Tick,
): CanStartExplorationResult {
  // Check if pet is idle
  if (pet.activityState !== ActivityState.Idle) {
    return {
      canStart: false,
      reason: `Pet is currently ${pet.activityState}`,
    };
  }

  // Get the activity definition
  const activity = getActivityById(activityId);
  if (!activity) {
    return {
      canStart: false,
      reason: `Unknown activity: ${activityId}`,
    };
  }

  // Get the location
  const location = getLocation(locationId);
  if (!location) {
    return {
      canStart: false,
      reason: `Unknown location: ${locationId}`,
    };
  }

  // Check if this activity is available at this location
  const locationDropTables = location.dropTableIds?.[activityId];
  if (!locationDropTables || locationDropTables.length === 0) {
    return {
      canStart: false,
      reason: `${activity.name} is not available at this location`,
    };
  }

  // Check activity requirements
  const requirementCheck = meetsRequirements(
    pet,
    skills,
    completedQuestIds,
    activity.requirements,
  );
  if (!requirementCheck.meets) {
    return {
      canStart: false,
      reason: requirementCheck.reason,
    };
  }

  // Check energy
  const energyMicro = pet.energyStats.energy;
  const requiredEnergyMicro = toMicro(activity.energyCost);
  if (energyMicro < requiredEnergyMicro) {
    return {
      canStart: false,
      reason: `Not enough energy (need ${activity.energyCost})`,
    };
  }

  // Check cooldown
  const cooldownRemaining = getActivityCooldownRemaining(
    pet,
    locationId,
    activityId,
    currentTick,
  );
  if (cooldownRemaining > 0) {
    return {
      canStart: false,
      reason: `Activity on cooldown (${cooldownRemaining} ticks remaining)`,
    };
  }

  return { canStart: true };
}

/**
 * Start an exploration activity.
 */
export function startExplorationActivity(
  pet: Pet,
  skills: PlayerSkills,
  completedQuestIds: string[],
  locationId: string,
  activityId: string,
  currentTick: Tick,
): StartExplorationResult {
  // Verify we can start
  const canStartResult = canStartExplorationActivity(
    pet,
    skills,
    completedQuestIds,
    locationId,
    activityId,
    currentTick,
  );

  if (!canStartResult.canStart) {
    return {
      success: false,
      pet,
      message: canStartResult.reason,
    };
  }

  const activity = getActivityById(activityId);
  if (!activity) {
    return {
      success: false,
      pet,
      message: `Unknown activity: ${activityId}`,
    };
  }

  // Deduct energy (in micro units)
  const energyCostMicro = toMicro(activity.energyCost);
  const newEnergy = pet.energyStats.energy - energyCostMicro;

  // Create active exploration
  const activeExploration: ActiveExploration = {
    activityId,
    locationId,
    startTick: currentTick,
    durationTicks: activity.duration,
    ticksRemaining: activity.duration,
    energyCost: energyCostMicro,
  };

  return {
    success: true,
    pet: {
      ...pet,
      activityState: ActivityState.Exploring,
      activeExploration,
      energyStats: {
        energy: newEnergy,
      },
    },
  };
}

/**
 * Process one tick of exploration progress.
 * Returns updated ActiveExploration or null if exploration completed.
 */
export function processExplorationTick(
  exploration: ActiveExploration,
): ActiveExploration | null {
  const newTicksRemaining = exploration.ticksRemaining - 1;

  if (newTicksRemaining <= 0) {
    return null; // Exploration completed
  }

  return {
    ...exploration,
    ticksRemaining: newTicksRemaining as Tick,
  };
}

/**
 * Calculate drops from drop tables using a single roll.
 * The roll is compared against each entry's minRoll; entries where roll >= minRoll pass.
 */
export function calculateExplorationDrops(
  dropTableIds: string[],
  pet: Pet,
  skills: PlayerSkills,
  completedQuestIds: string[],
  roll?: number,
): ExplorationDrop[] {
  // Generate roll if not provided (for testing, we allow injecting roll)
  const actualRoll = roll ?? Math.random();

  const drops: Map<string, number> = new Map();

  for (const tableId of dropTableIds) {
    const dropTable = getDropTableById(tableId);
    if (!dropTable) continue;

    for (const entry of dropTable.entries) {
      // Check entry requirements
      const reqCheck = meetsRequirements(
        pet,
        skills,
        completedQuestIds,
        entry.requirements,
      );
      if (!reqCheck.meets) continue;

      // Check roll against minRoll
      if (actualRoll >= entry.minRoll) {
        const currentQty = drops.get(entry.itemId) ?? 0;
        drops.set(entry.itemId, currentQty + entry.quantity);
      }
    }
  }

  // Convert map to array
  return Array.from(drops.entries()).map(([itemId, quantity]) => ({
    itemId,
    quantity,
  }));
}

/**
 * Complete an exploration activity and calculate rewards.
 */
export function completeExplorationActivity(
  pet: Pet,
  skills: PlayerSkills,
  completedQuestIds: string[],
  totalTicks: Tick,
): CompleteExplorationResult {
  const exploration = pet.activeExploration;
  if (!exploration) {
    return {
      success: false,
      pet,
      itemsFound: [],
      skillXpGains: {},
      message: "No active exploration to complete",
    };
  }

  const activity = getActivityById(exploration.activityId);
  if (!activity) {
    return {
      success: false,
      pet: {
        ...pet,
        activityState: ActivityState.Idle,
        activeExploration: undefined,
      },
      itemsFound: [],
      skillXpGains: {},
      message: "Unknown activity",
    };
  }

  const location = getLocation(exploration.locationId);
  const locationName = location?.name ?? "Unknown";
  const dropTableIds = location?.dropTableIds?.[exploration.activityId] ?? [];

  // Calculate drops
  const itemsFound = calculateExplorationDrops(
    dropTableIds,
    pet,
    skills,
    completedQuestIds,
  );

  // Calculate skill XP gains based on activity's skillFactors
  const skillXpGains: Record<string, number> = {};
  for (const [skillId, factor] of Object.entries(activity.skillFactors)) {
    const xpGain = Math.floor(BASE_EXPLORATION_XP * factor);
    if (xpGain > 0) {
      skillXpGains[skillId] = xpGain;
    }
  }

  // Apply cooldown
  const cooldownEndTick = activity.cooldownDuration
    ? ((totalTicks + activity.cooldownDuration) as Tick)
    : undefined;

  const updatedCooldowns = applyCooldown(
    pet.activityCooldowns,
    exploration.locationId,
    exploration.activityId,
    cooldownEndTick,
  );

  // Clear exploration state
  const updatedPet: Pet = {
    ...pet,
    activityState: ActivityState.Idle,
    activeExploration: undefined,
    activityCooldowns: updatedCooldowns,
  };

  const itemCount = itemsFound.reduce((sum, drop) => sum + drop.quantity, 0);
  const message =
    itemCount > 0
      ? `Found ${itemCount} item${itemCount !== 1 ? "s" : ""} at ${locationName}!`
      : `Exploration complete at ${locationName}, but nothing was found this time.`;

  return {
    success: true,
    pet: updatedPet,
    itemsFound,
    skillXpGains,
    message,
  };
}

/**
 * Cancel an active exploration and refund energy.
 */
export function cancelExploration(pet: Pet): {
  pet: Pet;
  message: string;
} {
  if (!pet.activeExploration) {
    return {
      pet,
      message: "No active exploration to cancel",
    };
  }

  // Refund energy
  const energyRefund = pet.activeExploration.energyCost;

  return {
    pet: {
      ...pet,
      activityState: ActivityState.Idle,
      activeExploration: undefined,
      energyStats: {
        energy: pet.energyStats.energy + energyRefund,
      },
    },
    message: "Exploration cancelled. Energy has been refunded.",
  };
}

/**
 * Get the remaining cooldown ticks for an activity at a location.
 */
export function getActivityCooldownRemaining(
  pet: Pet,
  locationId: string,
  activityId: string,
  currentTick: Tick,
): Tick {
  const cooldowns = pet.activityCooldowns;
  if (!cooldowns) return 0 as Tick;

  const locationCooldowns = cooldowns[locationId];
  if (!locationCooldowns) return 0 as Tick;

  const cooldownEndTick = locationCooldowns[activityId];
  if (cooldownEndTick === undefined) return 0 as Tick;

  const remaining = cooldownEndTick - currentTick;
  return Math.max(0, remaining) as Tick;
}

/**
 * Apply a cooldown for an activity at a location.
 */
function applyCooldown(
  existingCooldowns: Record<string, Record<string, Tick>> | undefined,
  locationId: string,
  activityId: string,
  cooldownEndTick: Tick | undefined,
): Record<string, Record<string, Tick>> | undefined {
  if (cooldownEndTick === undefined) {
    return existingCooldowns;
  }

  const cooldowns = existingCooldowns ?? {};
  const locationCooldowns = cooldowns[locationId] ?? {};

  return {
    ...cooldowns,
    [locationId]: {
      ...locationCooldowns,
      [activityId]: cooldownEndTick,
    },
  };
}

/**
 * Get exploration progress information.
 */
export function getExplorationProgress(
  exploration: ActiveExploration,
): ExplorationProgress {
  const activity = getActivityById(exploration.activityId);
  const activityName = activity?.name ?? "Unknown";

  // Guard against division by zero for instant-completion activities
  if (exploration.durationTicks === 0) {
    return {
      activityId: exploration.activityId,
      activityName,
      locationId: exploration.locationId,
      totalTicks: exploration.durationTicks,
      ticksRemaining: exploration.ticksRemaining,
      progressPercent: 100,
    };
  }

  const elapsed = exploration.durationTicks - exploration.ticksRemaining;
  const progressPercent = Math.round(
    (elapsed / exploration.durationTicks) * 100,
  );

  return {
    activityId: exploration.activityId,
    activityName,
    locationId: exploration.locationId,
    totalTicks: exploration.durationTicks,
    ticksRemaining: exploration.ticksRemaining,
    progressPercent,
  };
}

/**
 * Get available activities for a location.
 * Returns activities that have drop tables defined at this location.
 */
export function getAvailableActivities(
  locationId: string,
): ExplorationActivity[] {
  const location = getLocation(locationId);
  if (!location?.dropTableIds) {
    return [];
  }

  const activityIds = Object.keys(location.dropTableIds);
  return activityIds
    .map((id) => getActivityById(id))
    .filter((a): a is ExplorationActivity => a !== undefined);
}

/**
 * Apply skill XP gains to player skills.
 */
export function applySkillXpGains(
  skills: PlayerSkills,
  skillXpGains: Record<string, number>,
): { skills: PlayerSkills; levelUps: Record<string, boolean> } {
  let updatedSkills = skills;
  const levelUps: Record<string, boolean> = {};

  for (const [skillId, xpGain] of Object.entries(skillXpGains)) {
    if (skillId in skills) {
      const result = addXpToPlayerSkill(
        updatedSkills,
        skillId as keyof PlayerSkills,
        xpGain,
      );
      updatedSkills = result.skills;
      levelUps[skillId] = result.result.leveledUp;
    }
  }

  return { skills: updatedSkills, levelUps };
}
