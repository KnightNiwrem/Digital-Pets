// Unit tests for QuestSystem

import { describe, it, expect, beforeEach } from "bun:test";
import { QuestSystem } from "@/systems/QuestSystem";
import { QUESTS, getQuestById } from "@/data/quests";
import type { GameState, Quest, QuestProgress } from "@/types";

// Test data setup
function createMockGameState(): GameState {
  return {
    metadata: {
      version: "1.0.0",
      lastSaveTime: Date.now(),
      saveCount: 1,
      platform: "web",
      gameVersion: "1.0.0",
    },
    currentPet: {
      id: "test-pet",
      name: "Test Pet",
      species: {
        id: "wild_beast",
        name: "Wild Beast",
        rarity: "common",
        description: "Test pet",
        baseStats: { attack: 25, defense: 20, speed: 30, health: 100 },
        growthRates: { attack: 1.2, defense: 1.1, speed: 1.3, health: 1.15, energy: 1.1 },
        sprite: "beast.png",
        icon: "beast-icon.png",
      },
      rarity: "common",
      growthStage: 1,
      satiety: 80,
      hydration: 75,
      happiness: 90,
      satietyTicksLeft: 1000,
      hydrationTicksLeft: 900,
      happinessTicksLeft: 1100,
      poopTicksLeft: 500,
      poopCount: 0,
      sickByPoopTicksLeft: 10000,
      life: 1000000,
      maxEnergy: 100,
      currentEnergy: 85,
      health: "healthy",
      state: "idle",
      attack: 25,
      defense: 20,
      speed: 30,
      maxHealth: 100,
      currentHealth: 100,
      moves: [],
      birthTime: Date.now() - 100000,
      lastCareTime: Date.now() - 50000,
      totalLifetime: 100000,
    },
    ownedPets: [],
    inventory: {
      slots: [
        {
          item: {
            id: "apple",
            name: "Fresh Apple",
            description: "A crisp, red apple that pets love.",
            type: "consumable",
            rarity: "common",
            icon: "item_apple",
            effects: [{ type: "satiety", value: 25 }],
            value: 10,
            stackable: true,
          },
          quantity: 3,
          slotIndex: 0,
        },
        {
          item: {
            id: "water_bottle",
            name: "Water Bottle",
            description: "Clean, refreshing water.",
            type: "consumable",
            rarity: "common",
            icon: "item_water",
            effects: [{ type: "hydration", value: 30 }],
            value: 8,
            stackable: true,
          },
          quantity: 2,
          slotIndex: 1,
        },
      ],
      gold: 150,
      maxSlots: 20,
    },
    world: {
      currentLocationId: "hometown",
      unlockedLocations: ["hometown", "forest_path"],
      visitedLocations: ["hometown"],
      travelState: undefined,
      activeActivities: [],
    },
    questLog: QuestSystem.initializeQuestLog(),
    currentBattle: null,
    playerStats: {
      level: 1,
      experience: 0,
      experienceToNextLevel: 100,
      totalPetsOwned: 1,
      totalQuestsCompleted: 0,
      totalBattlesWon: 0,
      totalLocationsVisited: 1,
      totalPlayTime: 0,
      longestPetLifespan: 0,
      highestPetLevel: 0,
      mostGoldOwned: 150,
      firstPetSpecies: "wild_beast",
    },
    settings: {
      masterVolume: 0.7,
      musicVolume: 0.8,
      soundEffectsVolume: 0.6,
      showNotifications: true,
      animationSpeed: "normal",
      theme: "auto",
      autoSaveInterval: 4,
      offlineProgressEnabled: true,
      reducedMotion: false,
      highContrast: false,
      largeText: false,
    },
    metrics: {
      sessionStartTime: Date.now(),
      ticksThisSession: 0,
      totalSessions: 1,
      totalTicks: 0,
      totalPlayTime: 0,
      totalFeedings: 0,
      totalDrinks: 0,
      totalPlays: 0,
      totalCleanings: 0,
      totalMedicineUsed: 0,
      totalBattles: 0,
      totalForaging: 0,
      totalFishing: 0,
      totalMining: 0,
      totalTraining: 0,
      totalGoldEarned: 0,
      totalGoldSpent: 0,
      totalItemsUsed: 0,
      totalItemsSold: 0,
    },
    gameTime: {
      totalTicks: 0,
      lastTickTime: Date.now(),
      isPaused: false,
    },
    tutorial: {
      completed: false,
      currentStep: null,
      skippedSteps: [],
    },
    achievements: {},
    notifications: [],
  };
}

describe("QuestSystem", () => {
  let gameState: GameState;
  let petCareQuest: Quest;
  let shopTutorialQuest: Quest;

  beforeEach(() => {
    gameState = createMockGameState();
    petCareQuest = getQuestById("pet_care_basics")!;
    shopTutorialQuest = getQuestById("shop_tutorial")!;
  });

  describe("initializeQuestLog", () => {
    it("should create an empty quest log", () => {
      const questLog = QuestSystem.initializeQuestLog();

      expect(questLog.activeQuests).toEqual([]);
      expect(questLog.completedQuests).toEqual([]);
      expect(questLog.failedQuests).toEqual([]);
      expect(questLog.availableQuests).toEqual([]);
      expect(questLog.questChains).toEqual([]);
    });
  });

  describe("canStartQuest", () => {
    it("should allow starting quest with no requirements", () => {
      const result = QuestSystem.canStartQuest(petCareQuest, gameState);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it("should prevent starting already completed quest", () => {
      gameState.questLog!.completedQuests.push(petCareQuest.id);

      const result = QuestSystem.canStartQuest(petCareQuest, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Quest has already been completed.");
    });

    it("should prevent starting already active quest", () => {
      const questProgress: QuestProgress = {
        questId: petCareQuest.id,
        name: petCareQuest.name,
        description: petCareQuest.description,
        type: petCareQuest.type,
        status: "active",
        objectives: petCareQuest.objectives.map(obj => ({ ...obj, currentAmount: 0, completed: false })),
        rewards: petCareQuest.rewards,
        startTime: Date.now(),
        variables: {},
      };
      gameState.questLog!.activeQuests.push(questProgress);

      const result = QuestSystem.canStartQuest(petCareQuest, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Quest is already active.");
    });

    it("should prevent starting quest with unmet requirements", () => {
      const forestQuest = getQuestById("forest_exploration")!;

      const result = QuestSystem.canStartQuest(forestQuest, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Required quest not completed.");
    });

    it("should prevent starting quest when at max active quests", () => {
      // Fill up active quests to max
      for (let i = 0; i < 10; i++) {
        const questProgress: QuestProgress = {
          questId: `fake_quest_${i}`,
          name: `Fake Quest ${i}`,
          description: "A fake quest for testing",
          type: "collection",
          status: "active",
          objectives: [],
          rewards: [],
          startTime: Date.now(),
          variables: {},
        };
        gameState.questLog!.activeQuests.push(questProgress);
      }

      const result = QuestSystem.canStartQuest(petCareQuest, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Too many active quests. Complete some quests first.");
    });
  });

  describe("startQuest", () => {
    it("should successfully start a valid quest", () => {
      const result = QuestSystem.startQuest(petCareQuest, gameState);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Check that updated gameState is returned
      const updatedGameState = result.data!;
      expect(updatedGameState.questLog!.activeQuests).toHaveLength(1);
      expect(updatedGameState.questLog!.activeQuests[0].questId).toBe(petCareQuest.id);
      expect(updatedGameState.questLog!.activeQuests[0].status).toBe("active");
      expect(updatedGameState.questLog!.activeQuests[0].name).toBe(petCareQuest.name);
      expect(updatedGameState.questLog!.activeQuests[0].type).toBe(petCareQuest.type);
    });

    it("should initialize objectives correctly", () => {
      QuestSystem.startQuest(petCareQuest, gameState);

      const questProgress = gameState.questLog!.activeQuests[0];
      expect(questProgress.objectives).toHaveLength(petCareQuest.objectives.length);

      for (const objective of questProgress.objectives) {
        expect(objective.currentAmount).toBe(0);
        expect(objective.completed).toBe(false);
      }
    });

    it("should fail to start invalid quest", () => {
      gameState.questLog!.completedQuests.push(petCareQuest.id);

      const result = QuestSystem.startQuest(petCareQuest, gameState);

      expect(result.success).toBe(false);
      expect(gameState.questLog!.activeQuests).toHaveLength(0);
    });
  });

  describe("updateObjectiveProgress", () => {
    beforeEach(() => {
      QuestSystem.startQuest(petCareQuest, gameState);
    });

    it("should successfully update objective progress", () => {
      const objective = petCareQuest.objectives[0]; // feed_pet objective

      const result = QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, 1, gameState);

      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("update_objective");

      const questProgress = gameState.questLog!.activeQuests[0];
      const updatedObjective = questProgress.objectives.find(obj => obj.id === objective.id);
      expect(updatedObjective?.currentAmount).toBe(1);
      expect(updatedObjective?.completed).toBe(false);
    });

    it("should complete objective when target is reached", () => {
      const objective = petCareQuest.objectives[0]; // feed_pet objective (target: 3)

      const result = QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, 3, gameState);

      expect(result.success).toBe(true);

      const questProgress = gameState.questLog!.activeQuests[0];
      const updatedObjective = questProgress.objectives.find(obj => obj.id === objective.id);
      expect(updatedObjective?.currentAmount).toBe(3);
      expect(updatedObjective?.completed).toBe(true);
    });

    it("should not exceed target amount", () => {
      const objective = petCareQuest.objectives[0]; // feed_pet objective (target: 3)

      QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, 5, gameState);

      const questProgress = gameState.questLog!.activeQuests[0];
      const updatedObjective = questProgress.objectives.find(obj => obj.id === objective.id);
      expect(updatedObjective?.currentAmount).toBe(3); // capped at target
    });

    it("should fail for non-existent quest", () => {
      const result = QuestSystem.updateObjectiveProgress("fake_quest", "fake_objective", 1, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Quest is not active.");
    });

    it("should fail for non-existent objective", () => {
      const result = QuestSystem.updateObjectiveProgress(petCareQuest.id, "fake_objective", 1, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Objective not found.");
    });

    it("should fail for already completed objective", () => {
      const objective = petCareQuest.objectives[0];

      // Complete the objective first
      QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, 3, gameState);

      // Try to update again
      const result = QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, 1, gameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Objective is already completed.");
    });
  });

  describe("isQuestComplete", () => {
    beforeEach(() => {
      QuestSystem.startQuest(petCareQuest, gameState);
    });

    it("should return false for incomplete quest", () => {
      const isComplete = QuestSystem.isQuestComplete(petCareQuest.id, gameState);
      expect(isComplete).toBe(false);
    });

    it("should return true when all objectives are complete", () => {
      // Complete all objectives
      for (const objective of petCareQuest.objectives) {
        QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, objective.targetAmount || 1, gameState);
      }

      const isComplete = QuestSystem.isQuestComplete(petCareQuest.id, gameState);
      expect(isComplete).toBe(true);
    });

    it("should return false for non-existent quest", () => {
      const isComplete = QuestSystem.isQuestComplete("fake_quest", gameState);
      expect(isComplete).toBe(false);
    });
  });

  describe("completeQuest", () => {
    beforeEach(() => {
      const startResult = QuestSystem.startQuest(petCareQuest, gameState);
      if (startResult.success && startResult.data) {
        // Update gameState with the started quest
        gameState.questLog = startResult.data.questLog;
      }

      // Complete all objectives
      for (const objective of petCareQuest.objectives) {
        QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, objective.targetAmount || 1, gameState);
      }
    });

    it("should successfully complete quest", () => {
      const initialGold = gameState.inventory.gold;

      const result = QuestSystem.completeQuest(gameState, petCareQuest.id);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      // Check that updated gameState is returned
      const updatedGameState = result.data!;
      expect(updatedGameState.questLog!.activeQuests).toHaveLength(0);
      expect(updatedGameState.questLog!.completedQuests).toContain(petCareQuest.id);

      // Check that gold didn't change (pet care quest doesn't give gold)
      expect(updatedGameState.inventory.gold).toBe(initialGold);
    });

    it("should fail for quest with incomplete objectives", () => {
      // Complete the prerequisite quest to start shop tutorial
      gameState.questLog!.completedQuests.push("pet_care_basics");

      // Start a new quest and don't complete objectives
      const startResult = QuestSystem.startQuest(shopTutorialQuest, gameState);
      if (startResult.success && startResult.data) {
        gameState.questLog = startResult.data.questLog;
      }

      const result = QuestSystem.completeQuest(gameState, shopTutorialQuest.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Not all objectives are complete.");
    });

    it("should fail for non-active quest", () => {
      const result = QuestSystem.completeQuest(gameState, shopTutorialQuest.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Quest is not active.");
    });
  });

  describe("processGameAction", () => {
    beforeEach(() => {
      QuestSystem.startQuest(petCareQuest, gameState);
    });

    it("should update quest progress for relevant actions", () => {
      const events = QuestSystem.processGameAction("pet_care", { action: "feed" }, QUESTS, gameState);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe("objective_completed");
      expect(events[0].questId).toBe(petCareQuest.id);

      // Check objective progress was updated
      const questProgress = gameState.questLog!.activeQuests[0];
      const feedObjective = questProgress.objectives.find(obj => obj.id === "feed_pet");
      expect(feedObjective?.currentAmount).toBe(1);
    });

    it("should complete quest when all objectives are finished via actions", () => {
      // Complete all objectives through actions
      QuestSystem.processGameAction("pet_care", { action: "feed" }, QUESTS, gameState);
      QuestSystem.processGameAction("pet_care", { action: "feed" }, QUESTS, gameState);
      QuestSystem.processGameAction("pet_care", { action: "feed" }, QUESTS, gameState);

      QuestSystem.processGameAction("pet_care", { action: "drink" }, QUESTS, gameState);
      QuestSystem.processGameAction("pet_care", { action: "drink" }, QUESTS, gameState);
      QuestSystem.processGameAction("pet_care", { action: "drink" }, QUESTS, gameState);

      QuestSystem.processGameAction("pet_care", { action: "play" }, QUESTS, gameState);
      const events = QuestSystem.processGameAction("pet_care", { action: "play" }, QUESTS, gameState);

      // Should have quest completion event
      const completionEvent = events.find(e => e.type === "quest_completed");
      expect(completionEvent).toBeDefined();
      expect(completionEvent?.questId).toBe(petCareQuest.id);

      // Quest should be completed
      expect(gameState.questLog!.completedQuests).toContain(petCareQuest.id);
      expect(gameState.questLog!.activeQuests).toHaveLength(0);
    });

    it("should ignore irrelevant actions", () => {
      const events = QuestSystem.processGameAction("irrelevant_action", { data: "test" }, QUESTS, gameState);

      expect(events).toHaveLength(0);

      // Check no objective progress was made
      const questProgress = gameState.questLog!.activeQuests[0];
      for (const objective of questProgress.objectives) {
        expect(objective.currentAmount).toBe(0);
      }
    });
  });

  describe("getAvailableQuests", () => {
    it("should return quests with no requirements", () => {
      const availableQuests = QuestSystem.getAvailableQuests(QUESTS, gameState);

      expect(availableQuests).toContainEqual(petCareQuest);
      expect(availableQuests).not.toContainEqual(shopTutorialQuest); // has requirement
    });

    it("should return quests with met requirements", () => {
      // Complete the required quest
      gameState.questLog!.completedQuests.push("shop_tutorial");

      const availableQuests = QuestSystem.getAvailableQuests(QUESTS, gameState);
      const forestQuest = getQuestById("forest_exploration");

      expect(availableQuests).toContainEqual(forestQuest);
    });

    it("should exclude already completed quests", () => {
      gameState.questLog!.completedQuests.push(petCareQuest.id);

      const availableQuests = QuestSystem.getAvailableQuests(QUESTS, gameState);

      expect(availableQuests).not.toContainEqual(petCareQuest);
    });

    it("should exclude already active quests", () => {
      QuestSystem.startQuest(petCareQuest, gameState);

      const availableQuests = QuestSystem.getAvailableQuests(QUESTS, gameState);

      expect(availableQuests).not.toContainEqual(petCareQuest);
    });
  });

  describe("getActiveQuests", () => {
    it("should return empty array for no active quests", () => {
      const activeQuests = QuestSystem.getActiveQuests(gameState);
      expect(activeQuests).toEqual([]);
    });

    it("should return active quest progress", () => {
      QuestSystem.startQuest(petCareQuest, gameState);

      const activeQuests = QuestSystem.getActiveQuests(gameState);

      expect(activeQuests).toHaveLength(1);
      expect(activeQuests[0].questId).toBe(petCareQuest.id);
      expect(activeQuests[0].status).toBe("active");
    });
  });

  describe("getCompletedQuests", () => {
    it("should return empty array for no completed quests", () => {
      const completedQuests = QuestSystem.getCompletedQuests(gameState);
      expect(completedQuests).toEqual([]);
    });

    it("should return completed quest IDs", () => {
      gameState.questLog!.completedQuests.push(petCareQuest.id);

      const completedQuests = QuestSystem.getCompletedQuests(gameState);

      expect(completedQuests).toEqual([petCareQuest.id]);
    });
  });

  describe("Quest Reward Distribution", () => {
    // Mock quest with various reward types for testing
    const mockQuestWithRewards: Quest = {
      id: "reward_test_quest",
      name: "Reward Test Quest",
      description: "A quest for testing reward distribution",
      type: "story",
      status: "not_started",
      objectives: [
        {
          id: "test_objective",
          type: "care_action",
          description: "Test objective",
          careAction: "feed",
          targetAmount: 1,
          currentAmount: 0,
          completed: false,
        },
      ],
      requirements: [],
      rewards: [
        { type: "gold", amount: 50 },
        { type: "experience", amount: 100 },
        { type: "item", itemId: "apple", amount: 3 },
        { type: "item", itemId: "water_bottle", amount: 2 },
      ],
      npcId: "test_npc",
      location: "hometown",
      dialogue: {
        start: "Test start",
        progress: "Test progress",
        complete: "Test complete",
      },
      isMainQuest: false,
      chapter: 1,
      order: 1,
    };

    beforeEach(() => {
      // Start the mock quest and complete its objectives
      QuestSystem.startQuest(mockQuestWithRewards, gameState);
      const questProgress = gameState.questLog!.activeQuests[0];
      questProgress.objectives[0].currentAmount = 1;
      questProgress.objectives[0].completed = true;
    });

    it("should distribute gold rewards correctly", () => {
      const initialGold = gameState.inventory.gold;

      const result = QuestSystem.completeQuest(gameState, mockQuestWithRewards.id);

      expect(result.success).toBe(true);
      expect(result.data!.inventory.gold).toBe(initialGold + 50);
    });

    it("should distribute experience rewards correctly", () => {
      const initialExperience = gameState.playerStats.experience;

      const result = QuestSystem.completeQuest(gameState, mockQuestWithRewards.id);

      expect(result.success).toBe(true);
      expect(result.data!.playerStats.experience).toBe(initialExperience + 100);
    });

    it("should distribute item rewards correctly", () => {
      const initialAppleCount = gameState.inventory.slots.find(slot => slot.item.id === "apple")?.quantity || 0;
      const initialWaterBottleCount =
        gameState.inventory.slots.find(slot => slot.item.id === "water_bottle")?.quantity || 0;

      const result = QuestSystem.completeQuest(gameState, mockQuestWithRewards.id);

      expect(result.success).toBe(true);

      const updatedInventory = result.data!.inventory;
      const appleSlot = updatedInventory.slots.find(slot => slot.item.id === "apple");
      const waterBottleSlot = updatedInventory.slots.find(slot => slot.item.id === "water_bottle");

      expect(appleSlot?.quantity).toBe(initialAppleCount + 3);
      expect(waterBottleSlot?.quantity).toBe(initialWaterBottleCount + 2);
    });

    it("should distribute multiple reward types in single quest completion", () => {
      const initialGold = gameState.inventory.gold;
      const initialExperience = gameState.playerStats.experience;
      const initialAppleCount = gameState.inventory.slots.find(slot => slot.item.id === "apple")?.quantity || 0;

      const result = QuestSystem.completeQuest(gameState, mockQuestWithRewards.id);

      expect(result.success).toBe(true);

      const updatedGameState = result.data!;

      // Check all reward types were distributed correctly
      expect(updatedGameState.inventory.gold).toBe(initialGold + 50);
      expect(updatedGameState.playerStats.experience).toBe(initialExperience + 100);

      const appleSlot = updatedGameState.inventory.slots.find(slot => slot.item.id === "apple");
      expect(appleSlot?.quantity).toBe(initialAppleCount + 3);
    });

    it("should handle item rewards for non-existent items gracefully", () => {
      // Use a fresh gameState to avoid conflicts with other tests
      const freshGameState = createMockGameState();

      const questWithInvalidItem: Quest = {
        id: "invalid_item_quest",
        name: "Invalid Item Test Quest",
        description: "A quest for testing invalid item rewards",
        type: "story",
        status: "not_started",
        objectives: [
          {
            id: "test_objective",
            type: "care_action",
            description: "Test objective",
            careAction: "feed",
            targetAmount: 1,
            currentAmount: 0,
            completed: false,
          },
        ],
        requirements: [],
        rewards: [
          { type: "gold", amount: 25 },
          { type: "item", itemId: "nonexistent_item", amount: 1 },
        ],
        npcId: "test_npc",
        location: "hometown",
        dialogue: {
          start: "Test start",
          progress: "Test progress",
          complete: "Test complete",
        },
        isMainQuest: false,
        chapter: 1,
        order: 1,
      };

      const startResult = QuestSystem.startQuest(questWithInvalidItem, freshGameState);
      expect(startResult.success).toBe(true);

      const updatedGameState = startResult.data!;
      const questProgress = updatedGameState.questLog!.activeQuests.find(q => q.questId === questWithInvalidItem.id);
      expect(questProgress).toBeDefined();
      questProgress!.objectives[0].currentAmount = 1;
      questProgress!.objectives[0].completed = true;

      const initialGold = updatedGameState.inventory.gold;

      const result = QuestSystem.completeQuest(updatedGameState, questWithInvalidItem.id);

      expect(result.success).toBe(true);
      // Gold should still be awarded even if item reward fails
      expect(result.data!.inventory.gold).toBe(initialGold + 25);
    });

    it("should handle location unlock rewards correctly", () => {
      // Use a fresh gameState to avoid conflicts with other tests
      const freshGameState = createMockGameState();

      const questWithLocationReward: Quest = {
        id: "location_unlock_quest",
        name: "Location Unlock Test Quest",
        description: "A quest for testing location unlock rewards",
        type: "story",
        status: "not_started",
        objectives: [
          {
            id: "test_objective",
            type: "care_action",
            description: "Test objective",
            careAction: "feed",
            targetAmount: 1,
            currentAmount: 0,
            completed: false,
          },
        ],
        requirements: [],
        rewards: [
          { type: "unlock_location", locationId: "riverside", amount: 1 },
          { type: "gold", amount: 20 },
        ],
        npcId: "test_npc",
        location: "hometown",
        dialogue: {
          start: "Test start",
          progress: "Test progress",
          complete: "Test complete",
        },
        isMainQuest: false,
        chapter: 1,
        order: 1,
      };

      const startResult = QuestSystem.startQuest(questWithLocationReward, freshGameState);
      expect(startResult.success).toBe(true);

      const updatedGameState = startResult.data!;
      const questProgress = updatedGameState.questLog!.activeQuests.find(q => q.questId === questWithLocationReward.id);
      expect(questProgress).toBeDefined();
      questProgress!.objectives[0].currentAmount = 1;
      questProgress!.objectives[0].completed = true;

      const initialLocations = [...updatedGameState.world.unlockedLocations];

      const result = QuestSystem.completeQuest(updatedGameState, questWithLocationReward.id);

      expect(result.success).toBe(true);
      expect(result.data!.world.unlockedLocations).toContain("riverside");
      expect(result.data!.world.unlockedLocations.length).toBe(initialLocations.length + 1);
    });
  });

  // Mountain Village Quest Chain Tests
  describe("Mountain Village Quest Chain", () => {
    it("should have valid quest chain structure", () => {
      const part1 = getQuestById("the_great_discovery_part1");
      const part2 = getQuestById("the_great_discovery_part2");
      const miningTutorial = getQuestById("mountain_mining_tutorial");
      const safetyLesson = getQuestById("mining_safety_lesson");

      expect(part1).toBeDefined();
      expect(part2).toBeDefined();
      expect(miningTutorial).toBeDefined();
      expect(safetyLesson).toBeDefined();

      // Check quest chain progression
      expect(part2?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "the_great_discovery_part1" })
      );
      expect(safetyLesson?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "mountain_mining_tutorial" })
      );
    });

    it("should have appropriate rewards for quest difficulty", () => {
      const part1 = getQuestById("the_great_discovery_part1");
      const part2 = getQuestById("the_great_discovery_part2");

      // Part 1 should have meaningful rewards
      expect(part1?.rewards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "experience", amount: 50 }),
          expect.objectContaining({ type: "item", itemId: "ancient_relic" }),
          expect.objectContaining({ type: "gold", amount: 100 }),
        ])
      );

      // Part 2 should unlock location and have greater rewards
      expect(part2?.rewards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "unlock_location", locationId: "ancient_ruins" }),
          expect.objectContaining({ type: "experience", amount: 75 }),
        ])
      );
    });

    it("should have valid quest objectives", () => {
      const miningTutorial = getQuestById("mountain_mining_tutorial");

      expect(miningTutorial?.objectives).toHaveLength(3);
      expect(miningTutorial?.objectives[0].type).toBe("collect_item");
      expect(miningTutorial?.objectives[0].itemId).toBe("pickaxe");
      expect(miningTutorial?.objectives[1].itemId).toBe("iron_ore");
    });
  });

  // The Great Discovery Quest Chain Extended Tests
  describe("The Great Discovery Quest Chain - Parts 3 & 4", () => {
    it("should have valid quest chain structure for parts 3 and 4", () => {
      const part3 = getQuestById("the_great_discovery_part3");
      const part4 = getQuestById("the_great_discovery_part4");

      expect(part3).toBeDefined();
      expect(part4).toBeDefined();

      // Check quest chain progression
      expect(part3?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "the_great_discovery_part2" })
      );
      expect(part4?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "the_great_discovery_part3" })
      );

      // Check that part3 unlocks part4
      expect(part3?.rewards).toContainEqual(
        expect.objectContaining({ type: "unlock_quest", questId: "the_great_discovery_part4" })
      );
    });

    it("should have escalating rewards for final quest parts", () => {
      const part3 = getQuestById("the_great_discovery_part3");
      const part4 = getQuestById("the_great_discovery_part4");

      // Part 3 should have significant rewards
      expect(part3?.rewards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "experience", amount: 100 }),
          expect.objectContaining({ type: "item", itemId: "energy_crystal", amount: 3 }),
          expect.objectContaining({ type: "item", itemId: "ancient_key", amount: 1 }),
          expect.objectContaining({ type: "gold", amount: 200 }),
        ])
      );

      // Part 4 should have legendary rewards
      expect(part4?.rewards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ type: "experience", amount: 150 }),
          expect.objectContaining({ type: "item", itemId: "legendary_artifact", amount: 1 }),
          expect.objectContaining({ type: "item", itemId: "ancient_potion", amount: 2 }),
          expect.objectContaining({ type: "item", itemId: "mystic_charm", amount: 1 }),
          expect.objectContaining({ type: "gold", amount: 500 }),
        ])
      );
    });

    it("should have appropriate quest objectives for ancient ruins exploration", () => {
      const part3 = getQuestById("the_great_discovery_part3");
      const part4 = getQuestById("the_great_discovery_part4");

      // Part 3 objectives
      expect(part3?.objectives).toHaveLength(4);
      expect(part3?.objectives[0].type).toBe("visit_location");
      expect(part3?.objectives[0].locationId).toBe("ancient_ruins");
      expect(part3?.objectives[1].type).toBe("collect_item");
      expect(part3?.objectives[1].itemId).toBe("ancient_relic");
      expect(part3?.objectives[1].targetAmount).toBe(5);

      // Part 4 objectives (finale)
      expect(part4?.objectives).toHaveLength(4);
      expect(part4?.objectives[0].type).toBe("collect_item");
      expect(part4?.objectives[0].itemId).toBe("guardian_essence");
      expect(part4?.objectives[0].targetAmount).toBe(5);
      expect(part4?.objectives[3].itemId).toBe("legendary_artifact");
    });

    it("should have correct NPCs and locations for parts 3 and 4", () => {
      const part3 = getQuestById("the_great_discovery_part3");
      const part4 = getQuestById("the_great_discovery_part4");

      expect(part3?.npcId).toBe("archaeologist_vera");
      expect(part3?.location).toBe("ancient_ruins");
      expect(part4?.npcId).toBe("guardian_spirit_aeon");
      expect(part4?.location).toBe("ancient_ruins");

      // Should be main quest with proper chapter progression
      expect(part3?.isMainQuest).toBe(true);
      expect(part3?.chapter).toBe(4);
      expect(part3?.order).toBe(1);
      expect(part4?.isMainQuest).toBe(true);
      expect(part4?.chapter).toBe(4);
      expect(part4?.order).toBe(2);
    });
  });

  // Coastal Harbor Quest Chain Tests
  describe("Coastal Harbor Quest Chain", () => {
    it("should have valid harbor quest structure", () => {
      const harborIntegration = getQuestById("harbor_integration");
      const tradingApprentice = getQuestById("trading_apprentice");
      const masterAngler = getQuestById("master_angler");
      const deepSeaExpedition = getQuestById("deep_sea_expedition");

      expect(harborIntegration).toBeDefined();
      expect(tradingApprentice).toBeDefined();
      expect(masterAngler).toBeDefined();
      expect(deepSeaExpedition).toBeDefined();

      // Check quest chain progression
      expect(tradingApprentice?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "harbor_integration" })
      );
      expect(deepSeaExpedition?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "master_angler" })
      );
      expect(deepSeaExpedition?.requirements).toContainEqual(
        expect.objectContaining({ type: "quest_completed", questId: "trading_apprentice" })
      );
    });

    it("should have appropriate maritime rewards", () => {
      const harborIntegration = getQuestById("harbor_integration");
      const deepSeaExpedition = getQuestById("deep_sea_expedition");

      // Harbor integration should provide navigation tools
      expect(harborIntegration?.rewards).toContainEqual(
        expect.objectContaining({ type: "item", itemId: "navigation_compass" })
      );

      // Deep sea expedition should have legendary rewards
      expect(deepSeaExpedition?.rewards).toContainEqual(
        expect.objectContaining({ type: "item", itemId: "legendary_artifact" })
      );
      expect(deepSeaExpedition?.rewards).toContainEqual(
        expect.objectContaining({ type: "item", itemId: "pearl", amount: 5 })
      );
      expect(deepSeaExpedition?.rewards).toContainEqual(expect.objectContaining({ type: "gold", amount: 500 }));
    });

    it("should have correct maritime quest objectives", () => {
      const masterAngler = getQuestById("master_angler");
      const tradingApprentice = getQuestById("trading_apprentice");

      // Master angler should focus on deep sea fishing
      expect(masterAngler?.objectives[0].itemId).toBe("exotic_fish");
      expect(masterAngler?.objectives[0].targetAmount).toBe(8);
      expect(masterAngler?.objectives[1].itemId).toBe("pearl");

      // Trading apprentice should focus on trade activities
      expect(tradingApprentice?.objectives[0].itemId).toBe("trade_permit");
      expect(tradingApprentice?.objectives[1].itemId).toBe("exotic_spice");
      expect(tradingApprentice?.objectives[2].itemId).toBe("pearl");
    });

    it("should have correct NPCs and locations for harbor quests", () => {
      const harborIntegration = getQuestById("harbor_integration");
      const tradingApprentice = getQuestById("trading_apprentice");
      const masterAngler = getQuestById("master_angler");
      const deepSeaExpedition = getQuestById("deep_sea_expedition");

      expect(harborIntegration?.npcId).toBe("harbor_master_thaddeus");
      expect(harborIntegration?.location).toBe("coastal_harbor");

      expect(tradingApprentice?.npcId).toBe("merchant_captain_elena");
      expect(tradingApprentice?.location).toBe("coastal_harbor");

      expect(masterAngler?.npcId).toBe("fishmonger_barnabus");
      expect(masterAngler?.location).toBe("coastal_harbor");

      expect(deepSeaExpedition?.npcId).toBe("harbor_master_thaddeus");
      expect(deepSeaExpedition?.location).toBe("coastal_harbor");

      // Check chapter progression
      expect(deepSeaExpedition?.isMainQuest).toBe(true);
      expect(deepSeaExpedition?.chapter).toBe(5);
      expect(deepSeaExpedition?.order).toBe(1);
    });
  });

  describe("Negative targetAmount handling", () => {
    let gameState: GameState;
    let miningTutorialQuest: Quest;

    beforeEach(() => {
      gameState = createMockGameState();
      miningTutorialQuest = getQuestById("mountain_mining_tutorial")!;

      // Meet the quest requirements
      gameState.questLog = QuestSystem.initializeQuestLog();
      gameState.questLog.completedQuests.push("fishing_lesson");
      if (gameState.currentPet) {
        gameState.currentPet.growthStage = 10; // High enough for level requirement
      }

      // Start the mining tutorial quest
      const startResult = QuestSystem.startQuest(miningTutorialQuest, gameState);
      if (startResult.success && startResult.data) {
        gameState.questLog = startResult.data.questLog;
      }
    });

    it("should handle positive targetAmount correctly", () => {
      // Test the first objective (buy pickaxe) - positive target
      const buyPickaxeObjective = miningTutorialQuest.objectives[0];
      expect(buyPickaxeObjective.targetAmount).toBe(1);

      // Update progress incrementally
      let result = QuestSystem.updateObjectiveProgress(miningTutorialQuest.id, buyPickaxeObjective.id, 1, gameState);

      expect(result.success).toBe(true);

      // Check progress
      const questProgress = gameState.questLog!.activeQuests.find(q => q.questId === miningTutorialQuest.id);
      const objective = questProgress!.objectives.find(obj => obj.id === buyPickaxeObjective.id);

      expect(objective!.currentAmount).toBe(1);
      expect(objective!.completed).toBe(true);
    });

    it("should handle negative targetAmount correctly (selling items)", () => {
      // Test the sell_ore objective - negative target
      const sellOreObjective = miningTutorialQuest.objectives[2];
      expect(sellOreObjective.targetAmount).toBe(-3);
      expect(sellOreObjective.currentAmount).toBe(0);

      // Simulate selling items incrementally
      // First sale: -1 item
      let result = QuestSystem.updateObjectiveProgress(
        miningTutorialQuest.id,
        sellOreObjective.id,
        -1, // amount is negative when selling
        gameState
      );

      expect(result.success).toBe(true);

      let questProgress = gameState.questLog!.activeQuests.find(q => q.questId === miningTutorialQuest.id);
      let objective = questProgress!.objectives.find(obj => obj.id === sellOreObjective.id);

      expect(objective!.currentAmount).toBe(-1);
      expect(objective!.completed).toBe(false); // Should not be complete yet

      // Second sale: -1 item (total -2)
      result = QuestSystem.updateObjectiveProgress(miningTutorialQuest.id, sellOreObjective.id, -1, gameState);

      expect(result.success).toBe(true);

      questProgress = gameState.questLog!.activeQuests.find(q => q.questId === miningTutorialQuest.id);
      objective = questProgress!.objectives.find(obj => obj.id === sellOreObjective.id);

      expect(objective!.currentAmount).toBe(-2);
      expect(objective!.completed).toBe(false); // Still not complete

      // Third sale: -1 item (total -3, should complete)
      result = QuestSystem.updateObjectiveProgress(miningTutorialQuest.id, sellOreObjective.id, -1, gameState);

      expect(result.success).toBe(true);

      questProgress = gameState.questLog!.activeQuests.find(q => q.questId === miningTutorialQuest.id);
      objective = questProgress!.objectives.find(obj => obj.id === sellOreObjective.id);

      expect(objective!.currentAmount).toBe(-3);
      expect(objective!.completed).toBe(true); // Now should be complete
    });

    it("should not allow progress beyond negative target", () => {
      // Test that selling more than required doesn't go beyond target
      const sellOreObjective = miningTutorialQuest.objectives[2];

      // Try to sell 5 items at once (more than the target of -3)
      const result = QuestSystem.updateObjectiveProgress(
        miningTutorialQuest.id,
        sellOreObjective.id,
        -5, // selling 5 items
        gameState
      );

      expect(result.success).toBe(true);

      const questProgress = gameState.questLog!.activeQuests.find(q => q.questId === miningTutorialQuest.id);
      const objective = questProgress!.objectives.find(obj => obj.id === sellOreObjective.id);

      // Should be clamped to the target (-3), not go to -5
      expect(objective!.currentAmount).toBe(-3);
      expect(objective!.completed).toBe(true);
    });

    it("should not allow progress beyond positive target", () => {
      // Test existing behavior for positive targets
      const ironOreObjective = miningTutorialQuest.objectives[1];
      expect(ironOreObjective.targetAmount).toBe(5);

      // Try to collect 10 items at once (more than the target of 5)
      const result = QuestSystem.updateObjectiveProgress(miningTutorialQuest.id, ironOreObjective.id, 10, gameState);

      expect(result.success).toBe(true);

      const questProgress = gameState.questLog!.activeQuests.find(q => q.questId === miningTutorialQuest.id);
      const objective = questProgress!.objectives.find(obj => obj.id === ironOreObjective.id);

      // Should be clamped to the target (5), not go to 10
      expect(objective!.currentAmount).toBe(5);
      expect(objective!.completed).toBe(true);
    });
  });
});
