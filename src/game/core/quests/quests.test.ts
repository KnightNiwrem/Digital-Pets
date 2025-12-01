/**
 * Tests for quest system logic.
 */

import { expect, test } from "bun:test";
import { dailyCareRoutine } from "@/game/data/quests/daily";
import {
  tutorialExploration,
  tutorialFirstSteps,
} from "@/game/data/quests/tutorial";
import { weeklyCaretaker } from "@/game/data/quests/weekly";
import { createInitialGameState, type GameState } from "@/game/types/gameState";
import {
  ObjectiveType,
  type Quest,
  type QuestProgress,
  QuestState,
  QuestType,
} from "@/game/types/quest";
import { areAllRequiredObjectivesComplete } from "./objectives";
import {
  completeQuest,
  getActiveQuests,
  getAvailableQuests,
  getExpiredQuests,
  getQuestState,
  getQuestTimeRemaining,
  processTimedQuestExpiration,
  refreshDailyQuests,
  refreshWeeklyQuests,
  startQuest,
  startTimedQuest,
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

test("completeQuest grants item reward", () => {
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
  // Tutorial quest rewards 3 apples (food_apple)
  const appleItem = result.state.player.inventory.items.find(
    (item) => item.itemId === "food_apple",
  );
  expect(appleItem).toBeDefined();
  expect(appleItem?.quantity).toBe(3);
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

// Tests for refreshDailyQuests

test("refreshDailyQuests activates all daily quests", () => {
  const state = createTestState();
  const result = refreshDailyQuests(state);

  // Should have all daily quests as active
  const dailyQuestProgress = result.quests.filter((q) =>
    q.questId.startsWith("daily_"),
  );
  expect(dailyQuestProgress.length).toBeGreaterThan(0);

  // All daily quests should be in Active state
  for (const progress of dailyQuestProgress) {
    expect(progress.state).toBe(QuestState.Active);
  }
});

test("refreshDailyQuests preserves non-daily quests", () => {
  const tutorialProgress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: { feed_pet: 1 },
  };
  const state = createTestState({}, [tutorialProgress]);
  const result = refreshDailyQuests(state);

  // Tutorial quest should still be present
  const tutorial = result.quests.find(
    (q) => q.questId === tutorialFirstSteps.id,
  );
  expect(tutorial).toBeDefined();
  expect(tutorial?.state).toBe(QuestState.Active);
  expect(tutorial?.objectiveProgress.feed_pet).toBe(1);
});

test("refreshDailyQuests resets completed daily quests", () => {
  const completedDailyProgress: QuestProgress = {
    questId: dailyCareRoutine.id,
    state: QuestState.Completed,
    objectiveProgress: { feed_pet: 2, water_pet: 2 },
    completedAt: Date.now(),
  };
  const state = createTestState({}, [completedDailyProgress]);
  const result = refreshDailyQuests(state);

  // Daily quest should be reset to Active with empty progress
  const dailyCare = result.quests.find(
    (q) => q.questId === dailyCareRoutine.id,
  );
  expect(dailyCare).toBeDefined();
  expect(dailyCare?.state).toBe(QuestState.Active);
  expect(dailyCare?.objectiveProgress).toEqual({});
  expect(dailyCare?.completedAt).toBeUndefined();
});

test("refreshDailyQuests resets in-progress daily quests", () => {
  const inProgressDailyProgress: QuestProgress = {
    questId: dailyCareRoutine.id,
    state: QuestState.Active,
    objectiveProgress: { feed_pet: 1 },
    startedAt: Date.now() - 86400000, // Started yesterday
  };
  const state = createTestState({}, [inProgressDailyProgress]);
  const result = refreshDailyQuests(state);

  // Daily quest should be reset with fresh progress
  const dailyCare = result.quests.find(
    (q) => q.questId === dailyCareRoutine.id,
  );
  expect(dailyCare).toBeDefined();
  expect(dailyCare?.state).toBe(QuestState.Active);
  expect(dailyCare?.objectiveProgress).toEqual({});
});

test("refreshDailyQuests sets expiresAt for daily quests", () => {
  const state = createTestState();
  const currentTime = Date.now();
  const result = refreshDailyQuests(state, currentTime);

  const dailyQuest = result.quests.find(
    (q) => q.questId === dailyCareRoutine.id,
  );
  expect(dailyQuest?.expiresAt).toBeDefined();
  // Should expire at next midnight
  expect(dailyQuest?.expiresAt).toBeGreaterThan(currentTime);
});

// Tests for refreshWeeklyQuests

test("refreshWeeklyQuests activates all weekly quests", () => {
  const state = createTestState();
  const result = refreshWeeklyQuests(state);

  const weeklyQuestProgress = result.quests.filter((q) =>
    q.questId.startsWith("weekly_"),
  );
  expect(weeklyQuestProgress.length).toBeGreaterThan(0);

  for (const progress of weeklyQuestProgress) {
    expect(progress.state).toBe(QuestState.Active);
  }
});

test("refreshWeeklyQuests preserves non-weekly quests", () => {
  const tutorialProgress: QuestProgress = {
    questId: tutorialFirstSteps.id,
    state: QuestState.Active,
    objectiveProgress: { feed_pet: 1 },
  };
  const state = createTestState({}, [tutorialProgress]);
  const result = refreshWeeklyQuests(state);

  const tutorial = result.quests.find(
    (q) => q.questId === tutorialFirstSteps.id,
  );
  expect(tutorial).toBeDefined();
  expect(tutorial?.state).toBe(QuestState.Active);
});

test("refreshWeeklyQuests resets completed weekly quests", () => {
  const completedWeeklyProgress: QuestProgress = {
    questId: weeklyCaretaker.id,
    state: QuestState.Completed,
    objectiveProgress: { feed_pet_weekly: 14 },
    completedAt: Date.now(),
  };
  const state = createTestState({}, [completedWeeklyProgress]);
  const result = refreshWeeklyQuests(state);

  const weeklyQuest = result.quests.find(
    (q) => q.questId === weeklyCaretaker.id,
  );
  expect(weeklyQuest).toBeDefined();
  expect(weeklyQuest?.state).toBe(QuestState.Active);
  expect(weeklyQuest?.objectiveProgress).toEqual({});
});

test("refreshWeeklyQuests sets expiresAt for weekly quests", () => {
  const state = createTestState();
  const currentTime = Date.now();
  const result = refreshWeeklyQuests(state, currentTime);

  const weeklyQuest = result.quests.find(
    (q) => q.questId === weeklyCaretaker.id,
  );
  expect(weeklyQuest?.expiresAt).toBeDefined();
  // Should expire at next Monday midnight
  expect(weeklyQuest?.expiresAt).toBeGreaterThan(currentTime);
});

// Tests for timed quest expiration

test("processTimedQuestExpiration expires timed quests past deadline", () => {
  const expiredTime = Date.now() - 1000; // 1 second ago
  const timedProgress: QuestProgress = {
    questId: "timed_test_quest",
    state: QuestState.Active,
    objectiveProgress: {},
    startedAt: Date.now() - 3600000,
    expiresAt: expiredTime,
  };

  // Mock a timed quest in the quests registry
  const { quests } = require("@/game/data/quests");
  try {
    quests.timed_test_quest = {
      id: "timed_test_quest",
      name: "Test Timed Quest",
      type: QuestType.Timed,
      durationMs: 3600000,
    } as Quest;

    const state = createTestState({}, [timedProgress]);
    const result = processTimedQuestExpiration(state);

    const timedQuest = result.quests.find(
      (q) => q.questId === "timed_test_quest",
    );
    expect(timedQuest?.state).toBe(QuestState.Expired);
  } finally {
    // Cleanup
    delete quests.timed_test_quest;
  }
});

test("processTimedQuestExpiration does not expire daily quests", () => {
  const expiredTime = Date.now() - 1000;
  const dailyProgress: QuestProgress = {
    questId: dailyCareRoutine.id,
    state: QuestState.Active,
    objectiveProgress: {},
    expiresAt: expiredTime,
  };

  const state = createTestState({}, [dailyProgress]);
  const result = processTimedQuestExpiration(state);

  const dailyQuest = result.quests.find(
    (q) => q.questId === dailyCareRoutine.id,
  );
  // Daily quests should NOT be expired by this function
  expect(dailyQuest?.state).toBe(QuestState.Active);
});

test("getQuestTimeRemaining returns remaining time for active quest", () => {
  const futureExpiry = Date.now() + 3600000; // 1 hour from now
  const progress: QuestProgress = {
    questId: "test_quest",
    state: QuestState.Active,
    objectiveProgress: {},
    expiresAt: futureExpiry,
  };

  const remaining = getQuestTimeRemaining(progress);
  expect(remaining).toBeGreaterThan(0);
  expect(remaining).toBeLessThanOrEqual(3600000);
});

test("getQuestTimeRemaining returns null for quest without expiration", () => {
  const progress: QuestProgress = {
    questId: "test_quest",
    state: QuestState.Active,
    objectiveProgress: {},
  };

  const remaining = getQuestTimeRemaining(progress);
  expect(remaining).toBeNull();
});

test("getQuestTimeRemaining returns 0 for expired quest", () => {
  const pastExpiry = Date.now() - 1000;
  const progress: QuestProgress = {
    questId: "test_quest",
    state: QuestState.Active,
    objectiveProgress: {},
    expiresAt: pastExpiry,
  };

  const remaining = getQuestTimeRemaining(progress);
  expect(remaining).toBe(0);
});

test("getExpiredQuests returns only expired quests", () => {
  const activeProgress: QuestProgress = {
    questId: "active_quest",
    state: QuestState.Active,
    objectiveProgress: {},
  };
  const expiredProgress: QuestProgress = {
    questId: "expired_quest",
    state: QuestState.Expired,
    objectiveProgress: {},
  };
  const completedProgress: QuestProgress = {
    questId: "completed_quest",
    state: QuestState.Completed,
    objectiveProgress: {},
  };

  const state = createTestState({}, [
    activeProgress,
    expiredProgress,
    completedProgress,
  ]);
  const expired = getExpiredQuests(state);

  expect(expired.length).toBe(1);
  expect(expired[0]?.questId).toBe("expired_quest");
});

// Tests for startTimedQuest

test("startTimedQuest successfully starts a timed quest with expiration", () => {
  const { quests } = require("@/game/data/quests");
  const currentTime = Date.now();
  const durationMs = 3600000; // 1 hour

  try {
    quests.timed_available_quest = {
      id: "timed_available_quest",
      name: "Test Timed Quest",
      description: "A test timed quest",
      type: QuestType.Timed,
      giverId: "test_npc",
      requirements: [],
      durationMs,
      objectives: [],
      rewards: [],
    } as Quest;

    const state = createTestState();
    const result = startTimedQuest(state, "timed_available_quest", currentTime);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Started quest: Test Timed Quest");

    const progress = result.state.quests.find(
      (q) => q.questId === "timed_available_quest",
    );
    expect(progress).toBeDefined();
    expect(progress?.state).toBe(QuestState.Active);
    expect(progress?.expiresAt).toBe(currentTime + durationMs);
  } finally {
    delete quests.timed_available_quest;
  }
});

test("startTimedQuest rejects non-existent quests", () => {
  const state = createTestState();
  const result = startTimedQuest(state, "nonexistent_quest");

  expect(result.success).toBe(false);
  expect(result.message).toBe("Quest not found.");
});

test("startTimedQuest rejects non-timed quest types", () => {
  const state = createTestState();
  const result = startTimedQuest(state, tutorialFirstSteps.id);

  expect(result.success).toBe(false);
  expect(result.message).toBe("Quest is not a timed quest.");
});

test("startTimedQuest rejects quests without durationMs configured", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.timed_no_duration = {
      id: "timed_no_duration",
      name: "No Duration Quest",
      description: "A timed quest without duration",
      type: QuestType.Timed,
      giverId: "test_npc",
      requirements: [],
      objectives: [],
      rewards: [],
    } as Quest;

    const state = createTestState();
    const result = startTimedQuest(state, "timed_no_duration");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Timed quest has no duration configured.");
  } finally {
    delete quests.timed_no_duration;
  }
});

test("startTimedQuest rejects quests not in Available state", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.timed_locked_quest = {
      id: "timed_locked_quest",
      name: "Locked Timed Quest",
      description: "A locked timed quest",
      type: QuestType.Timed,
      giverId: "test_npc",
      durationMs: 3600000,
      objectives: [],
      rewards: [],
      requirements: [{ type: "quest", target: "nonexistent_quest" }],
    } as Quest;

    const state = createTestState();
    const result = startTimedQuest(state, "timed_locked_quest");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Quest requirements not met.");
  } finally {
    delete quests.timed_locked_quest;
  }
});

test("startTimedQuest rejects already active quests", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.timed_already_active = {
      id: "timed_already_active",
      name: "Already Active Quest",
      description: "An already active quest",
      type: QuestType.Timed,
      giverId: "test_npc",
      requirements: [],
      durationMs: 3600000,
      objectives: [],
      rewards: [],
    } as Quest;

    const activeProgress: QuestProgress = {
      questId: "timed_already_active",
      state: QuestState.Active,
      objectiveProgress: {},
      expiresAt: Date.now() + 3600000,
    };
    const state = createTestState({}, [activeProgress]);
    const result = startTimedQuest(state, "timed_already_active");

    expect(result.success).toBe(false);
    expect(result.message).toBe(
      "Quest is already in progress, completed, or expired.",
    );
  } finally {
    delete quests.timed_already_active;
  }
});

// Test for startQuest rejecting timed quests

test("startQuest rejects timed quests", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.timed_via_startquest = {
      id: "timed_via_startquest",
      name: "Timed Quest via startQuest",
      description: "A timed quest via startQuest",
      type: QuestType.Timed,
      giverId: "test_npc",
      requirements: [],
      durationMs: 3600000,
      objectives: [],
      rewards: [],
    } as Quest;

    const state = createTestState();
    const result = startQuest(state, "timed_via_startquest");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Use startTimedQuest for timed quests.");
  } finally {
    delete quests.timed_via_startquest;
  }
});

// Tests for location-based quest restrictions

// Shared mock quest fixtures for location-based tests
const locationStartQuest: Quest = {
  id: "location_start_quest",
  name: "Location Start Quest",
  description: "A quest that must be started at a specific location",
  type: QuestType.Side,
  giverId: "test_npc",
  requirements: [],
  objectives: [],
  rewards: [],
  startLocationId: "town_square",
};

const locationCompleteQuest: Quest = {
  id: "location_complete_quest",
  name: "Location Complete Quest",
  description: "A quest that must be completed at a specific location",
  type: QuestType.Side,
  giverId: "test_npc",
  requirements: [],
  objectives: [],
  rewards: [],
  completeLocationId: "guild_hall",
};

const differentLocationsQuest: Quest = {
  id: "different_locations_quest",
  name: "Different Locations Quest",
  description: "Start in one place, complete in another",
  type: QuestType.Side,
  giverId: "test_npc",
  requirements: [],
  objectives: [],
  rewards: [],
  startLocationId: "town_square",
  completeLocationId: "guild_hall",
};

const timedLocationQuest: Quest = {
  id: "timed_location_quest",
  name: "Timed Location Quest",
  description: "A timed quest with location requirement",
  type: QuestType.Timed,
  giverId: "test_npc",
  requirements: [],
  objectives: [],
  rewards: [],
  durationMs: 3600000,
  startLocationId: "arena",
};

test("startQuest fails when not at required start location", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.location_start_quest = locationStartQuest;

    // Player is at "home" by default
    const state = createTestState();
    const result = startQuest(state, "location_start_quest");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Go to start location");
  } finally {
    delete quests.location_start_quest;
  }
});

test("startQuest succeeds when at required start location", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.location_start_quest = locationStartQuest;

    const state = createTestState({
      player: {
        ...createTestState().player,
        currentLocationId: "town_square",
      },
    });
    const result = startQuest(state, "location_start_quest");

    expect(result.success).toBe(true);
    expect(result.message).toBe("Started quest: Location Start Quest");
  } finally {
    delete quests.location_start_quest;
  }
});

test("startQuest succeeds when no start location restriction", () => {
  // tutorialFirstSteps has no startLocationId, so it should work from any location
  const state = createTestState({
    player: {
      ...createTestState().player,
      currentLocationId: "random_location",
    },
  });
  const result = startQuest(state, tutorialFirstSteps.id);

  expect(result.success).toBe(true);
});

test("completeQuest fails when not at required complete location", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.location_complete_quest = locationCompleteQuest;

    const progress: QuestProgress = {
      questId: "location_complete_quest",
      state: QuestState.Active,
      objectiveProgress: {},
    };
    // Player is at "home" by default
    const state = createTestState({}, [progress]);
    const result = completeQuest(state, "location_complete_quest");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Go to turn-in location");
  } finally {
    delete quests.location_complete_quest;
  }
});

test("completeQuest succeeds when at required complete location", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.location_complete_quest = locationCompleteQuest;

    const progress: QuestProgress = {
      questId: "location_complete_quest",
      state: QuestState.Active,
      objectiveProgress: {},
    };
    const state = createTestState(
      {
        player: {
          ...createTestState().player,
          currentLocationId: "guild_hall",
        },
      },
      [progress],
    );
    const result = completeQuest(state, "location_complete_quest");

    expect(result.success).toBe(true);
    expect(result.message).toBe("Completed quest: Location Complete Quest");
  } finally {
    delete quests.location_complete_quest;
  }
});

test("quest with different start and complete locations works correctly", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.different_locations_quest = differentLocationsQuest;

    // Start at town_square
    const startState = createTestState({
      player: {
        ...createTestState().player,
        currentLocationId: "town_square",
      },
    });
    const startResult = startQuest(startState, "different_locations_quest");

    expect(startResult.success).toBe(true);

    // Try to complete at town_square (should fail)
    const failCompleteResult = completeQuest(
      startResult.state,
      "different_locations_quest",
    );
    expect(failCompleteResult.success).toBe(false);
    expect(failCompleteResult.message).toBe("Go to turn-in location");

    // Move to guild_hall and complete
    const movedState = {
      ...startResult.state,
      player: {
        ...startResult.state.player,
        currentLocationId: "guild_hall",
      },
    };
    const completeResult = completeQuest(
      movedState,
      "different_locations_quest",
    );

    expect(completeResult.success).toBe(true);
  } finally {
    delete quests.different_locations_quest;
  }
});

test("startTimedQuest fails when not at required start location", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.timed_location_quest = timedLocationQuest;

    // Player is at "home" by default
    const state = createTestState();
    const result = startTimedQuest(state, "timed_location_quest");

    expect(result.success).toBe(false);
    expect(result.message).toBe("Go to start location");
  } finally {
    delete quests.timed_location_quest;
  }
});

test("startTimedQuest succeeds when at required start location", () => {
  const { quests } = require("@/game/data/quests");

  try {
    quests.timed_location_quest = timedLocationQuest;

    const state = createTestState({
      player: {
        ...createTestState().player,
        currentLocationId: "arena",
      },
    });
    const result = startTimedQuest(state, "timed_location_quest");

    expect(result.success).toBe(true);
    expect(result.message).toBe("Started quest: Timed Location Quest");
  } finally {
    delete quests.timed_location_quest;
  }
});
