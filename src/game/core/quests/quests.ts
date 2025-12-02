/**
 * Quest state machine and main quest logic.
 */

import { getNextDailyReset, getNextWeeklyReset } from "@/game/core/time";
import { QuestMessages } from "@/game/data/messages";
import { getDailyQuests, getQuest, getWeeklyQuests } from "@/game/data/quests";
import type { GameState } from "@/game/types/gameState";
import {
  createQuestProgress,
  type ObjectiveType,
  type Quest,
  type QuestProgress,
  QuestState,
  QuestType,
} from "@/game/types/quest";
import {
  areAllRequiredObjectivesComplete,
  findMatchingObjectives,
  updateObjectiveProgress,
} from "./objectives";
import { checkAllRequirements } from "./requirements";
import { grantQuestRewards, type RewardGrantResult } from "./rewards";

/**
 * Result of a location validation check.
 */
type LocationValidationResult =
  | { valid: true }
  | { valid: false; message: string };

/**
 * Validate that the player is at the required start location for a quest.
 */
function validateStartLocation(
  quest: Quest,
  currentLocationId: string,
): LocationValidationResult {
  if (quest.startLocationId && currentLocationId !== quest.startLocationId) {
    return {
      valid: false,
      message: QuestMessages.goToStartLocation,
    };
  }
  return { valid: true };
}

/**
 * Validate that the player is at the required completion location for a quest.
 */
function validateCompleteLocation(
  quest: Quest,
  currentLocationId: string,
): LocationValidationResult {
  if (
    quest.completeLocationId &&
    currentLocationId !== quest.completeLocationId
  ) {
    return {
      valid: false,
      message: QuestMessages.goToTurnInLocation,
    };
  }
  return { valid: true };
}

/**
 * Result of a quest action.
 */
export interface QuestActionResult {
  success: boolean;
  state: GameState;
  message: string;
  rewardsSummary?: string[];
}

/**
 * Get the current state of a quest for a player.
 */
export function getQuestState(
  state: GameState,
  questId: string,
): QuestState | null {
  const progress = state.quests.find((q) => q.questId === questId);
  if (progress) {
    return progress.state;
  }

  // Quest hasn't been started - check if available or locked
  const quest = getQuest(questId);
  if (!quest) return null;

  // Check chain requirement - previous quest must be completed
  if (quest.chainPrevious) {
    const prevProgress = state.quests.find(
      (q) => q.questId === quest.chainPrevious,
    );
    if (!prevProgress || prevProgress.state !== QuestState.Completed) {
      return QuestState.Locked;
    }
  }

  if (checkAllRequirements(state, quest.requirements)) {
    return QuestState.Available;
  }

  return QuestState.Locked;
}

/**
 * Get all available quests for a player.
 */
export function getAvailableQuests(
  state: GameState,
  allQuests: Quest[],
): Quest[] {
  return allQuests.filter((quest) => {
    const questState = getQuestState(state, quest.id);
    return questState === QuestState.Available;
  });
}

/**
 * Get all active quests for a player.
 */
export function getActiveQuests(state: GameState): QuestProgress[] {
  return state.quests.filter((q) => q.state === QuestState.Active);
}

/**
 * Get all completed quests for a player.
 */
export function getCompletedQuests(state: GameState): QuestProgress[] {
  return state.quests.filter((q) => q.state === QuestState.Completed);
}

/**
 * Start a quest.
 */
export function startQuest(
  state: GameState,
  questId: string,
): QuestActionResult {
  const quest = getQuest(questId);
  if (!quest) {
    return {
      success: false,
      state,
      message: QuestMessages.questNotFound,
    };
  }

  if (quest.type === QuestType.Timed) {
    return {
      success: false,
      state,
      message: QuestMessages.useStartTimedQuest,
    };
  }

  const currentState = getQuestState(state, questId);
  if (currentState !== QuestState.Available) {
    return {
      success: false,
      state,
      message:
        currentState === QuestState.Locked
          ? QuestMessages.questLocked
          : QuestMessages.questAlreadyStarted,
    };
  }

  // Check if quest requires starting at a specific location
  const locationCheck = validateStartLocation(
    quest,
    state.player.currentLocationId,
  );
  if (!locationCheck.valid) {
    return {
      success: false,
      state,
      message: locationCheck.message,
    };
  }

  const progress = createQuestProgress(questId);
  const newQuests = [...state.quests, progress];

  return {
    success: true,
    state: {
      ...state,
      quests: newQuests,
    },
    message: QuestMessages.startedQuest(quest.name),
  };
}

/**
 * Complete a quest and grant rewards.
 */
export function completeQuest(
  state: GameState,
  questId: string,
): QuestActionResult {
  const quest = getQuest(questId);
  if (!quest) {
    return {
      success: false,
      state,
      message: QuestMessages.questNotFound,
    };
  }

  const progressIndex = state.quests.findIndex((q) => q.questId === questId);
  if (progressIndex === -1) {
    return {
      success: false,
      state,
      message: QuestMessages.questNotStarted,
    };
  }

  const progress = state.quests[progressIndex];
  if (!progress || progress.state !== QuestState.Active) {
    return {
      success: false,
      state,
      message: QuestMessages.questNotActive,
    };
  }

  if (!areAllRequiredObjectivesComplete(quest.objectives, progress)) {
    return {
      success: false,
      state,
      message: QuestMessages.objectivesIncomplete,
    };
  }

  // Check if quest requires completing at a specific location
  const locationCheck = validateCompleteLocation(
    quest,
    state.player.currentLocationId,
  );
  if (!locationCheck.valid) {
    return {
      success: false,
      state,
      message: locationCheck.message,
    };
  }

  // Grant rewards
  const rewardResult: RewardGrantResult = grantQuestRewards(
    state,
    quest.rewards,
  );

  // Update quest progress to completed
  const updatedProgress: QuestProgress = {
    ...progress,
    state: QuestState.Completed,
    completedAt: Date.now(),
  };

  const newQuests = [...rewardResult.state.quests];
  newQuests[progressIndex] = updatedProgress;

  return {
    success: true,
    state: {
      ...rewardResult.state,
      quests: newQuests,
    },
    message: QuestMessages.completedQuest(quest.name),
    rewardsSummary: rewardResult.rewardsSummary,
  };
}

/**
 * Update quest progress based on an action.
 * This is called when the player performs actions that might advance quest objectives.
 */
export function updateQuestProgress(
  state: GameState,
  actionType: ObjectiveType,
  target: string,
  amount = 1,
): GameState {
  const newQuests = [...state.quests];
  let hasChanges = false;

  for (let i = 0; i < newQuests.length; i++) {
    let progress = newQuests[i];
    if (!progress || progress.state !== QuestState.Active) continue;

    const quest = getQuest(progress.questId);
    if (!quest) continue;

    const matchingObjectives = findMatchingObjectives(
      quest.objectives,
      actionType,
      target,
    );

    if (matchingObjectives.length === 0) continue;

    let questProgressChanged = false;
    for (const objective of matchingObjectives) {
      const result = updateObjectiveProgress(
        progress,
        quest.objectives,
        objective.id,
        amount,
      );

      if (result.progress !== progress) {
        progress = result.progress;
        questProgressChanged = true;
      }
    }

    if (questProgressChanged) {
      newQuests[i] = progress;
      hasChanges = true;
    }
  }

  return hasChanges ? { ...state, quests: newQuests } : state;
}

/**
 * Get quest progress for a specific quest.
 */
export function getQuestProgress(
  state: GameState,
  questId: string,
): QuestProgress | undefined {
  return state.quests.find((q) => q.questId === questId);
}

/**
 * Helper function to refresh repeatable quests (daily or weekly).
 * Removes all existing quest progress of the given type and creates fresh progress.
 */
function refreshRepeatableQuests(
  state: GameState,
  questType: typeof QuestType.Daily | typeof QuestType.Weekly,
  getQuests: () => Quest[],
  getNextReset: (currentTime: number) => number,
  currentTime: number,
): GameState {
  const questsToRefresh = getQuests();
  const nextReset = getNextReset(currentTime);

  // Remove all existing quest progress of the given type
  const otherQuests = state.quests.filter((progress) => {
    const quest = getQuest(progress.questId);
    return quest?.type !== questType;
  });

  // Create fresh progress for all quests of the given type
  const freshProgress: QuestProgress[] = questsToRefresh.map((quest) =>
    createQuestProgress(quest.id, nextReset),
  );

  return {
    ...state,
    quests: [...otherQuests, ...freshProgress],
  };
}

/**
 * Refresh daily quests.
 * Removes completed/expired daily quests and activates all daily quests.
 * Daily quests start in Active state (no manual acceptance required).
 */
export function refreshDailyQuests(
  state: GameState,
  currentTime: number = Date.now(),
): GameState {
  return refreshRepeatableQuests(
    state,
    QuestType.Daily,
    getDailyQuests,
    getNextDailyReset,
    currentTime,
  );
}

/**
 * Refresh weekly quests.
 * Removes completed/expired weekly quests and activates all weekly quests.
 * Weekly quests start in Active state (no manual acceptance required).
 */
export function refreshWeeklyQuests(
  state: GameState,
  currentTime: number = Date.now(),
): GameState {
  return refreshRepeatableQuests(
    state,
    QuestType.Weekly,
    getWeeklyQuests,
    getNextWeeklyReset,
    currentTime,
  );
}

/**
 * Check and expire timed quests that have passed their expiration time.
 * Only timed quests go to Expired state; daily/weekly are handled by refresh functions.
 */
export function processTimedQuestExpiration(
  state: GameState,
  currentTime: number = Date.now(),
): GameState {
  let hasChanges = false;
  let newQuests: QuestProgress[] | undefined;

  for (let i = 0; i < state.quests.length; i++) {
    const progress = state.quests[i];
    if (!progress) continue;

    // Only check active quests with expiration times
    if (
      progress.state !== QuestState.Active ||
      progress.expiresAt === undefined
    ) {
      continue;
    }

    const quest = getQuest(progress.questId);
    // Only timed quests go to Expired state
    if (quest?.type !== QuestType.Timed) {
      continue;
    }

    // Check if quest has expired
    if (currentTime >= progress.expiresAt) {
      if (!hasChanges) {
        // First change detected, create a shallow copy of the array
        newQuests = state.quests.slice();
        hasChanges = true;
      }
      if (newQuests) {
        newQuests[i] = {
          ...progress,
          state: QuestState.Expired,
        };
      }
    }
  }

  if (hasChanges && newQuests) {
    return { ...state, quests: newQuests };
  }
  return state;
}

/**
 * Get all expired quests (timed quests that were not completed in time).
 */
export function getExpiredQuests(state: GameState): QuestProgress[] {
  return state.quests.filter((q) => q.state === QuestState.Expired);
}

/**
 * Calculate remaining time until quest expiration in milliseconds.
 * Returns null if quest has no expiration or is not active.
 */
export function getQuestTimeRemaining(
  progress: QuestProgress,
  currentTime: number = Date.now(),
): number | null {
  if (
    progress.state !== QuestState.Active ||
    progress.expiresAt === undefined
  ) {
    return null;
  }
  const remaining = progress.expiresAt - currentTime;
  return remaining > 0 ? remaining : 0;
}

/**
 * Start a timed quest with calculated expiration.
 */
export function startTimedQuest(
  state: GameState,
  questId: string,
  currentTime: number = Date.now(),
): QuestActionResult {
  const quest = getQuest(questId);
  if (!quest) {
    return {
      success: false,
      state,
      message: QuestMessages.questNotFound,
    };
  }

  if (quest.type !== QuestType.Timed) {
    return {
      success: false,
      state,
      message: QuestMessages.notTimedQuest,
    };
  }

  if (!quest.durationMs) {
    return {
      success: false,
      state,
      message: QuestMessages.noDurationConfigured,
    };
  }

  const currentState = getQuestState(state, questId);
  if (currentState !== QuestState.Available) {
    return {
      success: false,
      state,
      message:
        currentState === QuestState.Locked
          ? QuestMessages.questLocked
          : QuestMessages.timedQuestNotAvailable,
    };
  }

  // Check if quest requires starting at a specific location
  const locationCheck = validateStartLocation(
    quest,
    state.player.currentLocationId,
  );
  if (!locationCheck.valid) {
    return {
      success: false,
      state,
      message: locationCheck.message,
    };
  }

  const expiresAt = currentTime + quest.durationMs;
  const progress = createQuestProgress(questId, expiresAt);
  const newQuests = [...state.quests, progress];

  return {
    success: true,
    state: {
      ...state,
      quests: newQuests,
    },
    message: QuestMessages.startedQuest(quest.name),
  };
}
