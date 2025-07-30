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
            stackable: true 
          }, 
          quantity: 3, 
          slotIndex: 0 
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
            stackable: true 
          }, 
          quantity: 2, 
          slotIndex: 1 
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
      autoSave: true,
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
        status: "active",
        objectives: petCareQuest.objectives.map(obj => ({ ...obj, currentAmount: 0, completed: false })),
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
          status: "active",
          objectives: [],
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
      expect(result.data?.type).toBe("start_quest");
      expect(result.data?.questId).toBe(petCareQuest.id);
      
      // Check quest was added to active quests
      expect(gameState.questLog!.activeQuests).toHaveLength(1);
      expect(gameState.questLog!.activeQuests[0].questId).toBe(petCareQuest.id);
      expect(gameState.questLog!.activeQuests[0].status).toBe("active");
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
      
      const result = QuestSystem.updateObjectiveProgress(
        petCareQuest.id,
        objective.id,
        1,
        gameState
      );
      
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("update_objective");
      
      const questProgress = gameState.questLog!.activeQuests[0];
      const updatedObjective = questProgress.objectives.find(obj => obj.id === objective.id);
      expect(updatedObjective?.currentAmount).toBe(1);
      expect(updatedObjective?.completed).toBe(false);
    });

    it("should complete objective when target is reached", () => {
      const objective = petCareQuest.objectives[0]; // feed_pet objective (target: 3)
      
      const result = QuestSystem.updateObjectiveProgress(
        petCareQuest.id,
        objective.id,
        3,
        gameState
      );
      
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
      const result = QuestSystem.updateObjectiveProgress(
        "fake_quest",
        "fake_objective",
        1,
        gameState
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Quest is not active.");
    });

    it("should fail for non-existent objective", () => {
      const result = QuestSystem.updateObjectiveProgress(
        petCareQuest.id,
        "fake_objective",
        1,
        gameState
      );
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Objective not found.");
    });

    it("should fail for already completed objective", () => {
      const objective = petCareQuest.objectives[0];
      
      // Complete the objective first
      QuestSystem.updateObjectiveProgress(petCareQuest.id, objective.id, 3, gameState);
      
      // Try to update again
      const result = QuestSystem.updateObjectiveProgress(
        petCareQuest.id,
        objective.id,
        1,
        gameState
      );
      
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
        QuestSystem.updateObjectiveProgress(
          petCareQuest.id,
          objective.id,
          objective.targetAmount,
          gameState
        );
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
      QuestSystem.startQuest(petCareQuest, gameState);
      
      // Complete all objectives
      for (const objective of petCareQuest.objectives) {
        QuestSystem.updateObjectiveProgress(
          petCareQuest.id,
          objective.id,
          objective.targetAmount,
          gameState
        );
      }
    });

    it("should successfully complete quest", () => {
      const initialGold = gameState.inventory.gold;
      
      const result = QuestSystem.completeQuest(petCareQuest, gameState);
      
      expect(result.success).toBe(true);
      expect(result.data?.type).toBe("complete_quest");
      expect(result.data?.questId).toBe(petCareQuest.id);
      
      // Check quest moved from active to completed
      expect(gameState.questLog!.activeQuests).toHaveLength(0);
      expect(gameState.questLog!.completedQuests).toContain(petCareQuest.id);
      
      // Check that gold didn't change (pet care quest doesn't give gold)
      expect(gameState.inventory.gold).toBe(initialGold);
    });

    it("should fail for quest with incomplete objectives", () => {
      // Complete the prerequisite quest to start shop tutorial
      gameState.questLog!.completedQuests.push("pet_care_basics");
      
      // Start a new quest and don't complete objectives
      QuestSystem.startQuest(shopTutorialQuest, gameState);
      
      const result = QuestSystem.completeQuest(shopTutorialQuest, gameState);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Not all objectives are complete.");
    });

    it("should fail for non-active quest", () => {
      const result = QuestSystem.completeQuest(shopTutorialQuest, gameState);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("Quest is not active.");
    });
  });

  describe("processGameAction", () => {
    beforeEach(() => {
      QuestSystem.startQuest(petCareQuest, gameState);
    });

    it("should update quest progress for relevant actions", () => {
      const events = QuestSystem.processGameAction(
        "pet_care",
        { action: "feed" },
        QUESTS,
        gameState
      );
      
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
      const events = QuestSystem.processGameAction(
        "irrelevant_action",
        { data: "test" },
        QUESTS,
        gameState
      );
      
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
});