/**
 * Training system core logic.
 */

import { checkActivityRequirements } from "@/game/core/activityGating";
import { calculatePetMaxStats } from "@/game/core/petStats";
import { getFacility, getSession } from "@/game/data/facilities";
import type {
  ActiveTraining,
  TrainingResult,
  TrainingSession,
  TrainingSessionType,
} from "@/game/types/activity";
import { type Tick, toMicro } from "@/game/types/common";
import {
  ActivityState,
  GROWTH_STAGE_ORDER,
  type GrowthStage,
} from "@/game/types/constants";
import type { Pet } from "@/game/types/pet";
import type { BattleStats } from "@/game/types/stats";

/**
 * Check if a training session is available based on pet's growth stage.
 * Exported for UI components to use for displaying session availability.
 */
export function isSessionAvailable(
  session: TrainingSession,
  petStage: GrowthStage,
): boolean {
  if (!session.minStage) return true;
  const currentStageIndex = GROWTH_STAGE_ORDER.indexOf(petStage);
  const requiredStageIndex = GROWTH_STAGE_ORDER.indexOf(session.minStage);
  return currentStageIndex >= requiredStageIndex;
}

/**
 * Check if a pet can start training at a specific facility with a specific session.
 */
export function canStartTraining(
  pet: Pet,
  facilityId: string,
  sessionType: TrainingSessionType,
): { canTrain: boolean; message: string } {
  // Get facility and session first (needed for energy cost check)
  const facility = getFacility(facilityId);
  if (!facility) {
    return { canTrain: false, message: "Training facility not found." };
  }

  const session = getSession(facilityId, sessionType);
  if (!session) {
    return { canTrain: false, message: "Training session not available." };
  }

  // Check activity state and energy requirements
  const gatingCheck = checkActivityRequirements(
    pet,
    "train",
    session.energyCost,
    ActivityState.Training,
  );
  if (!gatingCheck.allowed) {
    return { canTrain: false, message: gatingCheck.message };
  }

  // Check growth stage requirement
  if (!isSessionAvailable(session, pet.growth.stage)) {
    return {
      canTrain: false,
      message: `Requires ${session.minStage} stage or higher.`,
    };
  }

  return { canTrain: true, message: "Ready to train!" };
}

/**
 * Start a training session.
 * Returns the updated pet state or null if training cannot start.
 */
export function startTraining(
  pet: Pet,
  facilityId: string,
  sessionType: TrainingSessionType,
  currentTick: Tick,
): { success: boolean; pet: Pet; message: string } {
  const check = canStartTraining(pet, facilityId, sessionType);
  if (!check.canTrain) {
    return { success: false, pet, message: check.message };
  }

  const session = getSession(facilityId, sessionType);
  if (!session) {
    return { success: false, pet, message: "Session not found." };
  }

  const activeTraining: ActiveTraining = {
    facilityId,
    sessionType,
    startTick: currentTick,
    durationTicks: session.durationTicks,
    ticksRemaining: session.durationTicks,
    energyCost: toMicro(session.energyCost),
  };

  const newEnergy = pet.energyStats.energy - toMicro(session.energyCost);

  return {
    success: true,
    pet: {
      ...pet,
      activityState: ActivityState.Training,
      activeTraining,
      energyStats: {
        energy: Math.max(0, newEnergy),
      },
    },
    message: `Started ${session.name} at ${getFacility(facilityId)?.name ?? "facility"}!`,
  };
}

/**
 * Process one tick of training progress.
 * Returns updated ActiveTraining or null if training completed.
 */
export function processTrainingTick(
  training: ActiveTraining,
): ActiveTraining | null {
  const newTicksRemaining = training.ticksRemaining - 1;

  if (newTicksRemaining <= 0) {
    return null; // Training completed
  }

  return {
    ...training,
    ticksRemaining: newTicksRemaining,
  };
}

/**
 * Complete a training session and apply stat gains.
 */
export function completeTraining(pet: Pet): TrainingResult {
  if (!pet.activeTraining) {
    return {
      success: false,
      message: "No active training to complete.",
    };
  }

  const { facilityId, sessionType } = pet.activeTraining;
  const facility = getFacility(facilityId);
  const session = getSession(facilityId, sessionType);

  if (!facility || !session) {
    return {
      success: false,
      message: "Training data not found.",
    };
  }

  const statsGained: Partial<BattleStats> = {
    [facility.primaryStat]: session.primaryStatGain,
    [facility.secondaryStat]: session.secondaryStatGain,
  };

  return {
    success: true,
    message: `Training complete! Gained +${session.primaryStatGain} ${facility.primaryStat}${
      session.secondaryStatGain > 0
        ? ` and +${session.secondaryStatGain} ${facility.secondaryStat}`
        : ""
    }.`,
    statsGained,
  };
}

/**
 * Apply training completion to pet state.
 * Returns the updated pet with training cleared and trained stats applied.
 * Training gains are added to trainedBattleStats (not battleStats directly)
 * so they are preserved across stage transitions.
 */
export function applyTrainingCompletion(pet: Pet): Pet {
  const result = completeTraining(pet);

  if (!result.success || !result.statsGained) {
    // Just clear the training state
    return {
      ...pet,
      activityState: ActivityState.Idle,
      activeTraining: undefined,
    };
  }

  // Add gains to trainedBattleStats (preserved across stage transitions)
  const newTrainedBattleStats = { ...pet.trainedBattleStats };
  // Also update the total battleStats for immediate effect
  const newBattleStats = { ...pet.battleStats };

  for (const [stat, gain] of Object.entries(result.statsGained)) {
    if (stat in newTrainedBattleStats && typeof gain === "number") {
      newTrainedBattleStats[stat as keyof BattleStats] += gain;
      newBattleStats[stat as keyof BattleStats] += gain;
    }
  }

  return {
    ...pet,
    activityState: ActivityState.Idle,
    activeTraining: undefined,
    trainedBattleStats: newTrainedBattleStats,
    battleStats: newBattleStats,
  };
}

/**
 * Cancel an active training session.
 * Energy is refunded to the pet.
 */
export function cancelTraining(pet: Pet): {
  success: boolean;
  pet: Pet;
  message: string;
  energyRefunded: number;
} {
  if (!pet.activeTraining) {
    return {
      success: false,
      pet,
      message: "No training session to cancel.",
      energyRefunded: 0,
    };
  }

  const energyRefunded = pet.activeTraining.energyCost;
  const maxStats = calculatePetMaxStats(pet);
  const maxEnergy = maxStats?.energy ?? 0;

  return {
    success: true,
    pet: {
      ...pet,
      activityState: ActivityState.Idle,
      activeTraining: undefined,
      energyStats: {
        energy: Math.min(pet.energyStats.energy + energyRefunded, maxEnergy),
      },
    },
    message: "Training cancelled. Energy has been refunded.",
    energyRefunded,
  };
}

/**
 * Get training progress as a percentage.
 */
export function getTrainingProgress(training: ActiveTraining): number {
  const elapsed = training.durationTicks - training.ticksRemaining;
  return Math.round((elapsed / training.durationTicks) * 100);
}
