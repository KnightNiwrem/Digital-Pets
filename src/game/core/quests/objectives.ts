/**
 * Quest objective tracking logic.
 */

import type { QuestObjective, QuestProgress } from "@/game/types/quest";

/**
 * Result of updating objective progress.
 */
export interface ObjectiveUpdateResult {
  /** Updated quest progress */
  progress: QuestProgress;
  /** Whether this update completed the objective */
  objectiveCompleted: boolean;
  /** Whether all required objectives are now complete */
  allRequiredComplete: boolean;
}

/**
 * Check if a single objective is complete.
 */
export function isObjectiveComplete(
  objective: QuestObjective,
  progress: QuestProgress,
): boolean {
  const current = progress.objectiveProgress[objective.id] ?? 0;
  return current >= objective.quantity;
}

/**
 * Check if all required (non-optional) objectives are complete.
 */
export function areAllRequiredObjectivesComplete(
  objectives: QuestObjective[],
  progress: QuestProgress,
): boolean {
  return objectives
    .filter((obj) => !obj.optional)
    .every((obj) => isObjectiveComplete(obj, progress));
}

/**
 * Update progress for an objective.
 */
export function updateObjectiveProgress(
  progress: QuestProgress,
  objectives: QuestObjective[],
  objectiveId: string,
  amount = 1,
): ObjectiveUpdateResult {
  const objective = objectives.find((obj) => obj.id === objectiveId);
  if (!objective) {
    return {
      progress,
      objectiveCompleted: false,
      allRequiredComplete: areAllRequiredObjectivesComplete(
        objectives,
        progress,
      ),
    };
  }

  const currentProgress = progress.objectiveProgress[objectiveId] ?? 0;
  const wasComplete = currentProgress >= objective.quantity;
  const newProgress = Math.min(currentProgress + amount, objective.quantity);
  const isNowComplete = newProgress >= objective.quantity;

  const updatedProgress: QuestProgress = {
    ...progress,
    objectiveProgress: {
      ...progress.objectiveProgress,
      [objectiveId]: newProgress,
    },
  };

  return {
    progress: updatedProgress,
    objectiveCompleted: !wasComplete && isNowComplete,
    allRequiredComplete: areAllRequiredObjectivesComplete(
      objectives,
      updatedProgress,
    ),
  };
}

/**
 * Find objectives that match a given action type and target.
 */
export function findMatchingObjectives(
  objectives: QuestObjective[],
  type: string,
  target: string,
): QuestObjective[] {
  return objectives.filter(
    (obj) =>
      obj.type === type && (obj.target === target || obj.target === "any"),
  );
}

/**
 * Get the completion percentage for a quest.
 */
export function getQuestCompletionPercent(
  objectives: QuestObjective[],
  progress: QuestProgress,
): number {
  const requiredObjectives = objectives.filter((obj) => !obj.optional);
  if (requiredObjectives.length === 0) return 100;

  let totalProgress = 0;
  for (const obj of requiredObjectives) {
    const current = progress.objectiveProgress[obj.id] ?? 0;
    totalProgress += Math.min(current / obj.quantity, 1);
  }

  return Math.floor((totalProgress / requiredObjectives.length) * 100);
}
