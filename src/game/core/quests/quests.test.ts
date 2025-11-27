/**
 * Tests for quest system logic.
 */

import { expect, test } from "bun:test";
import {
  tutorialExploration,
  tutorialFirstSteps,
} from "@/game/data/quests/tutorial";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import {
  ObjectiveType,
  type QuestProgress,
  QuestState,
} from "@/game/types/quest";
import { areAllRequiredObjectivesComplete } from "./objectives";
import {
  completeQuest,
  getActiveQuests,
  getAvailableQuests,
  getQuestState,
  startQuest,
  updateQuestProgress,
} from "./quests";

function createTestState(
  overrides: Partial<GameState> = {},
  quests: QuestProgress[] = [],
): GameState {
  return {
    ...createInitialGameState(),
    isInitialized: true,
    quests,
    ...overrides,
  };
}

test("getQuestState returns Available for quest with no requirements", () => {
  const state = createTestState();
  const result = getQuestState(state, tutorialFirstSteps.id);
  expect(result).toBe(QuestState.Available);
});

test("getQuestState returns Locked for quest in chain when previous not completed", () => {
  const state = createTestState();
  const result = getQuestState(state, tutorialExploration.id);
  expect(result).toBe(QuestState.Locked);
});

test("getQuestState returns Active for started quest", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState({}, [progress]);
  const result = getQuestState(state, tutorialFirstSteps.id);
  expect(result).toBe(QuestState.Active);
});

test("getQuestState returns Completed for finished quest", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Completed,
    objectiveProgress: {},
    completedAt: Date.now(),
  };
  const state = createTestState({}, [progress]);
  const result = getQuestState(state, tutorialFirstSteps.id);
  expect(result).toBe(QuestState.Completed);
});

test("getAvailableQuests returns quests that can be started", () => {
  const state = createTestState();
  const available = getAvailableQuests(state, [
    tutorialFirstSteps,
    tutorialExploration,
  ]);
  expect(available.length).toBe(1);
  expect(available[0]?.id).toBe(tutorialFirstSteps.id);
});

test("getActiveQuests returns quests in progress", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState({}, [progress]);
  const active = getActiveQuests(state);
  expect(active.length).toBe(1);
  expect(active[0]?.questId).toBe(tutorialFirstSteps.id);
});

test("startQuest adds quest to active quests", () => {
  const state = createTestState();
  const result = startQuest(state, tutorialFirstSteps.id);
  expect(result.success).toBe(true);
  expect(result.state.quests.length).toBe(1);
  expect(result.state.quests[0]?.state).toBe(QuestState.Active);
});

test("startQuest fails for already active quest", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState({}, [progress]);
  const result = startQuest(state, tutorialFirstSteps.id);
  expect(result.success).toBe(false);
});

test("startQuest fails for locked quest", () => {
  const state = createTestState();
  const result = startQuest(state, tutorialExploration.id);
  expect(result.success).toBe(false);
});

test("completeQuest fails when objectives not complete", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState({}, [progress]);
  const result = completeQuest(state, tutorialFirstSteps.id);
  expect(result.success).toBe(false);
});

test("completeQuest succeeds when all objectives complete", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {
      feed_pet: 1,
      give_water: 1,
    },
  };
  const state = createTestState({}, [progress]);
  const result = completeQuest(state, tutorialFirstSteps.id);
  expect(result.success).toBe(true);
  expect(result.state.quests[0]?.state).toBe(QuestState.Completed);
});

test("completeQuest grants currency reward", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {
      feed_pet: 1,
      give_water: 1,
    },
  };
  const state = createTestState({}, [progress]);
  const initialCoins = state.player.currency.coins;
  const result = completeQuest(state, tutorialFirstSteps.id);
  expect(result.success).toBe(true);
  expect(result.state.player.currency.coins).toBe(initialCoins + 50);
});

test("updateQuestProgress advances matching objectives", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const state = createTestState({}, [progress]);
  const updated = updateQuestProgress(state, ObjectiveType.Care, "feed");
  const questProgress = updated.quests[0];
  expect(questProgress?.objectiveProgress.feed_pet).toBe(1);
});

test("areAllRequiredObjectivesComplete returns true when all complete", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {
      feed_pet: 1,
      give_water: 1,
    },
  };
  const result = areAllRequiredObjectivesComplete(
    tutorialFirstSteps.objectives,
    progress,
  );
  expect(result).toBe(true);
});

test("areAllRequiredObjectivesComplete returns false when incomplete", () => {
  const progress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: {
      feed_pet: 1,
    },
  };
  const result = areAllRequiredObjectivesComplete(
    tutorialFirstSteps.objectives,
    progress,
  );
  expect(result).toBe(false);
});
