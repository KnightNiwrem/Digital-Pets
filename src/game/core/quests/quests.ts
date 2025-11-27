/**
 * Quest state machine and main quest logic.
 */

import { getQuest } from "@/game/data/quests";
import type { GameState } from "@/game/types/gameState";
import {
  createQuestProgress,
  type ObjectiveType,
  type Quest,
  type QuestProgress,
  QuestState,
} from "@/game/types/quest";
import {
  areAllRequiredObjectivesComplete,
  findMatchingObjectives,
  updateObjectiveProgress,
} from "./objectives";
import { checkAllRequirements } from "./requirements";
import { grantQuestRewards, type RewardGrantResult } from "./rewards";

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
      message: "Quest not found.",
    };
  }

  const currentState = getQuestState(state, questId);
  if (currentState !== QuestState.Available) {
    return {
      success: false,
      state,
      message:
        currentState === QuestState.Locked
          ? "Quest requirements not met."
          : "Quest is already in progress or completed.",
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
    message: `Started quest: ${quest.name}`,
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
      message: "Quest not found.",
    };
  }

  const progressIndex = state.quests.findIndex((q) => q.questId === questId);
  if (progressIndex === -1) {
    return {
      success: false,
      state,
      message: "Quest not started.",
    };
  }

  const progress = state.quests[progressIndex];
  if (!progress || progress.state !== QuestState.Active) {
    return {
      success: false,
      state,
      message: "Quest is not active.",
    };
  }

  if (!areAllRequiredObjectivesComplete(quest.objectives, progress)) {
    return {
      success: false,
      state,
      message: "Not all objectives are complete.",
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
    message: `Completed quest: ${quest.name}`,
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
  let currentState = state;

  for (let i = 0; i < currentState.quests.length; i++) {
    const progress = currentState.quests[i];
    if (!progress || progress.state !== QuestState.Active) continue;

    const quest = getQuest(progress.questId);
    if (!quest) continue;

    const matchingObjectives = findMatchingObjectives(
      quest.objectives,
      actionType,
      target,
    );

    for (const objective of matchingObjectives) {
      const result = updateObjectiveProgress(
        progress,
        quest.objectives,
        objective.id,
        amount,
      );

      if (result.progress !== progress) {
        const newQuests = [...currentState.quests];
        newQuests[i] = result.progress;
        currentState = {
          ...currentState,
          quests: newQuests,
        };
      }
    }
  }

  return currentState;
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
