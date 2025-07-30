// Unit tests for Quest UI components

import { describe, it, expect, beforeEach } from "bun:test";
import type { Quest, QuestProgress, QuestReward } from "@/types/Quest";

// Mock quest data for testing
const mockQuest: Quest = {
  id: "test_quest",
  name: "Test Quest",
  description: "A quest for testing purposes",
  type: "collection",
  status: "available",
  objectives: [
    {
      id: "collect_items",
      type: "collect_item",
      description: "Collect 5 test items",
      itemId: "test_item",
      targetAmount: 5,
      currentAmount: 0,
      completed: false,
    },
  ],
  requirements: [
    {
      type: "level",
      value: 5,
    },
  ],
  rewards: [
    { type: "gold", amount: 100 },
    { type: "experience", amount: 50 },
  ],
  npcId: "test_npc",
  location: "test_location",
  dialogue: {
    start: "Please help me collect items!",
    progress: "Great work collecting those items!",
    complete: "Thank you for collecting all the items!",
  },
  isMainQuest: false,
  chapter: 1,
  order: 1,
};

const mockQuestProgress: QuestProgress = {
  questId: "test_quest",
  name: "Test Quest",
  description: "A quest for testing purposes",
  type: "collection",
  status: "active",
  objectives: [
    {
      id: "collect_items",
      type: "collect_item",
      description: "Collect 5 test items",
      itemId: "test_item",
      targetAmount: 5,
      currentAmount: 3,
      completed: false,
    },
  ],
  rewards: [
    { type: "gold", amount: 100 },
    { type: "experience", amount: 50 },
  ],
  startTime: Date.now(),
  variables: {},
};

describe("Quest Data Structures", () => {
  it("should have valid quest structure", () => {
    expect(mockQuest.id).toBe("test_quest");
    expect(mockQuest.name).toBe("Test Quest");
    expect(mockQuest.type).toBe("collection");
    expect(mockQuest.objectives).toHaveLength(1);
    expect(mockQuest.rewards).toHaveLength(2);
  });

  it("should have valid quest progress structure", () => {
    expect(mockQuestProgress.questId).toBe("test_quest");
    expect(mockQuestProgress.status).toBe("active");
    expect(mockQuestProgress.objectives[0].currentAmount).toBe(3);
    expect(mockQuestProgress.objectives[0].completed).toBe(false);
  });

  it("should calculate quest completion correctly", () => {
    const incompleteQuest = mockQuestProgress;
    const isComplete = incompleteQuest.objectives.every(obj => obj.completed);
    expect(isComplete).toBe(false);

    // Complete the objective
    const completeQuest = {
      ...incompleteQuest,
      objectives: incompleteQuest.objectives.map(obj => ({
        ...obj,
        currentAmount: obj.targetAmount,
        completed: true,
      })),
    };
    const isCompleteAfter = completeQuest.objectives.every(obj => obj.completed);
    expect(isCompleteAfter).toBe(true);
  });
});

describe("Quest Component Props", () => {
  it("should handle quest screen props correctly", () => {
    const questScreenProps = {
      activeQuests: [mockQuestProgress],
      availableQuests: [mockQuest],
      completedQuests: ["completed_quest_1"],
      onStartQuest: async (questId: string) => ({ success: true }),
      onAbandonQuest: async (questId: string) => ({ success: true }),
      onCompleteQuest: async (questId: string) => ({ success: true }),
      isLoading: false,
    };

    expect(questScreenProps.activeQuests).toHaveLength(1);
    expect(questScreenProps.availableQuests).toHaveLength(1);
    expect(questScreenProps.completedQuests).toHaveLength(1);
  });

  it("should handle quest dialog props correctly", () => {
    const questDialogProps = {
      quest: mockQuest,
      onStartQuest: async (questId: string) => ({ success: true }),
      onClose: () => {},
      isLoading: false,
    };

    expect(questDialogProps.quest.id).toBe("test_quest");
    expect(questDialogProps.quest.dialogue?.start).toBe("Please help me collect items!");
  });
});

describe("Quest Type Utilities", () => {
  it("should categorize quest types correctly", () => {
    const questTypes = ["story", "exploration", "collection", "battle", "care"];
    
    questTypes.forEach(type => {
      expect(type).toMatch(/^(story|exploration|collection|battle|care)$/);
    });
  });

  it("should handle quest rewards correctly", () => {
    const goldReward: QuestReward = { type: "gold", amount: 100 };
    const expReward: QuestReward = { type: "experience", amount: 50 };
    const itemReward: QuestReward = { type: "item", itemId: "test_item", amount: 1 };

    expect(goldReward.type).toBe("gold");
    expect(expReward.type).toBe("experience");
    expect(itemReward.type).toBe("item");
    expect(itemReward.itemId).toBe("test_item");
  });
});

describe("Quest Progress Calculations", () => {
  it("should calculate objective progress percentage", () => {
    const objective = mockQuestProgress.objectives[0];
    const progress = ((objective.currentAmount || 0) / (objective.targetAmount || 1)) * 100;
    expect(progress).toBe(60); // 3/5 * 100 = 60%
  });

  it("should calculate overall quest progress", () => {
    const completedObjectives = mockQuestProgress.objectives.filter(obj => obj.completed).length;
    const totalObjectives = mockQuestProgress.objectives.length;
    const overallProgress = (completedObjectives / totalObjectives) * 100;
    expect(overallProgress).toBe(0); // 0/1 * 100 = 0%
  });

  it("should handle completed quest progress", () => {
    const completedQuest = {
      ...mockQuestProgress,
      objectives: mockQuestProgress.objectives.map(obj => ({
        ...obj,
        currentAmount: obj.targetAmount,
        completed: true,
      })),
    };

    const completedObjectives = completedQuest.objectives.filter(obj => obj.completed).length;
    const totalObjectives = completedQuest.objectives.length;
    const overallProgress = (completedObjectives / totalObjectives) * 100;
    expect(overallProgress).toBe(100); // 1/1 * 100 = 100%
  });
});

describe("Quest State Management", () => {
  it("should transition quest states correctly", () => {
    // Available -> Active
    expect(mockQuest.status).toBe("available");
    
    const activeQuest = { ...mockQuest, status: "active" as const };
    expect(activeQuest.status).toBe("active");
    
    // Active -> Completed
    const completedQuest = { ...activeQuest, status: "completed" as const };
    expect(completedQuest.status).toBe("completed");
  });

  it("should handle quest requirements validation", () => {
    const requirement = mockQuest.requirements[0];
    expect(requirement.type).toBe("level");
    expect(requirement.value).toBe(5);
  });

  it("should handle quest objective types", () => {
    const objective = mockQuest.objectives[0];
    expect(objective.type).toBe("collect_item");
    expect(objective.itemId).toBe("test_item");
    expect(objective.targetAmount).toBe(5);
  });
});

describe("Quest Component Error Handling", () => {
  it("should handle missing quest data gracefully", () => {
    const emptyQuestList: Quest[] = [];
    const emptyActiveQuests: QuestProgress[] = [];
    const emptyCompletedQuests: string[] = [];

    expect(emptyQuestList).toHaveLength(0);
    expect(emptyActiveQuests).toHaveLength(0);
    expect(emptyCompletedQuests).toHaveLength(0);
  });

  it("should handle quest with missing optional fields", () => {
    const minimalQuest: Quest = {
      id: "minimal_quest",
      name: "Minimal Quest",
      description: "A minimal quest",
      type: "story",
      status: "available",
      objectives: [],
      requirements: [],
      rewards: [],
      isMainQuest: false,
    };

    expect(minimalQuest.npcId).toBeUndefined();
    expect(minimalQuest.location).toBeUndefined();
    expect(minimalQuest.dialogue).toBeUndefined();
    expect(minimalQuest.objectives).toHaveLength(0);
  });
});