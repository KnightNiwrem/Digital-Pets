// Test cases for inventory behavior issues
// This file will validate the bugs described in the issue

import { describe, it, expect, beforeEach } from "bun:test";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import { ActionFactory } from "@/types/UnifiedActions";
import { ItemSystem } from "@/systems/ItemSystem";
import type { GameState, Pet, PetSpecies } from "@/types";
import type { Inventory, ConsumableItem, DurabilityItem } from "@/types/Item";
import { getItemById } from "@/data/items";

describe("Inventory Behavior Fixes", () => {
  let testGameState: GameState;
  let testInventory: Inventory;
  let testPet: Pet;
  let apple: ConsumableItem;
  let ball: DurabilityItem;

  beforeEach(() => {
    // Create test pet
    const testSpecies: PetSpecies = {
      id: "test_species",
      name: "Test Pet",
      rarity: "common",
      description: "A pet for testing",
      baseStats: { attack: 10, defense: 8, speed: 12, health: 50 },
      growthRates: { attack: 1.1, defense: 1.1, speed: 1.1, health: 1.2, energy: 1.1 },
      sprite: "test.png",
      icon: "test_icon.png",
    };

    testPet = {
      id: "test-pet",
      name: "Test Pet",
      species: testSpecies,
      rarity: "common",
      growthStage: 1,
      satiety: 30, // Math.ceil(3000 / 100) = 30, low enough to allow feeding
      hydration: 50, // Need drink
      happiness: 40, // Math.ceil(4800 / 120) = 40, low enough to allow play
      satietyTicksLeft: 3000, // Low enough to allow feeding 
      hydrationTicksLeft: 4000, 
      happinessTicksLeft: 4800, // Low enough to allow play
      poopTicksLeft: 100,
      poopCount: 0,
      sickByPoopTicksLeft: 1000,
      life: 500000,
      maxEnergy: 100,
      currentEnergy: 60, // Enough to play
      health: "healthy",
      state: "idle",
      lastCareTime: Date.now() - 300000,
      totalLifetime: 1000,
      attack: 10,
      defense: 10,
      speed: 10,
      maxHealth: 50,
      currentHealth: 50,
      moves: [],
      birthTime: Date.now() - 1000000,
    };

    // Create inventory with test items
    testInventory = ItemSystem.createInventory(10, 100);
    apple = getItemById("apple") as ConsumableItem;
    ball = getItemById("ball") as DurabilityItem;
    
    // Add items to inventory
    testInventory = ItemSystem.addItem(testInventory, apple, 3).data!;
    testInventory = ItemSystem.addItem(testInventory, ball, 1).data!;

    // Create game state
    testGameState = {
      currentPet: testPet,
      inventory: testInventory,
      world: {
        currentLocationId: "hometown",
        unlockedLocations: ["hometown"],
        visitedLocations: ["hometown"],
        travelState: undefined,
        activeActivities: [],
      },
      questLog: {
        activeQuests: [
          {
            questId: "pet_care_basics",
            status: "active",
            progress: {},
            startTime: Date.now() - 1000,
            objectives: [
              {
                id: "feed_pet",
                type: "care_action",
                description: "Feed your pet 3 times",
                careAction: "feed",
                targetAmount: 3,
                currentAmount: 0,
                completed: false,
              },
              {
                id: "give_water",
                type: "care_action", 
                description: "Give your pet water 3 times",
                careAction: "drink",
                targetAmount: 3,
                currentAmount: 0,
                completed: false,
              },
              {
                id: "play_with_pet",
                type: "care_action",
                description: "Play with your pet 2 times",
                careAction: "play",
                targetAmount: 2,
                currentAmount: 0,
                completed: false,
              },
            ]
          }
        ],
        completedQuests: [],
        failedQuests: [],
        availableQuests: [],
        questChains: [],
      },
    } as unknown as GameState;
  });

  describe("Issue 1: Durability Item Usage Bug", () => {
    it("should reduce durability, not quantity, when using durability items via ActionCoordinator", async () => {
      // Use ball (durability item) via ActionCoordinator
      const useAction = ActionFactory.createItemAction("use", "ball", 1);
      const result = await ActionCoordinator.dispatchAction(testGameState, useAction);

      expect(result.success).toBe(true);
      
      const newGameState = result.data!.gameState;
      const ballSlot = newGameState.inventory.slots.find(s => s.item.id === "ball");
      
      // Ball should still be in inventory
      expect(ballSlot).toBeDefined();
      expect(ballSlot!.quantity).toBe(1); // Quantity should not change
      
      // Durability should be reduced
      const ballItem = ballSlot!.item as DurabilityItem;
      expect(ballItem.currentDurability).toBe(19); // Should be 20 - 1 = 19
    });

    it("should remove durability item when durability reaches 0", async () => {
      // Create a ball with 1 durability
      const fragileBall = { ...ball, currentDurability: 1 };
      const fragileInventory = ItemSystem.createInventory(10, 100);
      const inventoryWithFragileBall = ItemSystem.addItem(fragileInventory, fragileBall, 1).data!;
      
      const fragileGameState = {
        ...testGameState,
        inventory: inventoryWithFragileBall,
      };

      const useAction = ActionFactory.createItemAction("use", "ball", 1);
      const result = await ActionCoordinator.dispatchAction(fragileGameState, useAction);

      expect(result.success).toBe(true);
      
      const newGameState = result.data!.gameState;
      const ballSlot = newGameState.inventory.slots.find(s => s.item.id === "ball");
      
      // Ball should be removed from inventory
      expect(ballSlot).toBeUndefined();
    });
  });

  describe("Issue 2: Consumable Item Effect Application", () => {
    it("should apply pet care effects when using consumable items via ActionCoordinator", async () => {
      const initialSatietyTicks = testPet.satietyTicksLeft;

      // Use apple (consumable item) via ActionCoordinator
      const useAction = ActionFactory.createItemAction("use", "apple", 1);
      const result = await ActionCoordinator.dispatchAction(testGameState, useAction);

      expect(result.success).toBe(true);

      const newGameState = result.data!.gameState;
      const newPet = newGameState.currentPet!;

      // Pet satiety should increase (apple has satiety effect of 25)
      expect(newPet.satietyTicksLeft).toBeGreaterThan(initialSatietyTicks);

      // Apple should be consumed from inventory
      const appleSlot = newGameState.inventory.slots.find(s => s.item.id === "apple");
      expect(appleSlot!.quantity).toBe(2); // Should be reduced from 3 to 2
    });

    it("should apply happiness and energy effects when using toys via ActionCoordinator", async () => {
      const initialHappinessTicks = testPet.happinessTicksLeft;
      const initialEnergy = testPet.currentEnergy;

      // Use ball (toy with happiness effect) via ActionCoordinator
      const useAction = ActionFactory.createItemAction("use", "ball", 1);
      const result = await ActionCoordinator.dispatchAction(testGameState, useAction);

      expect(result.success).toBe(true);

      const newGameState = result.data!.gameState;
      const newPet = newGameState.currentPet!;

      // Pet happiness should increase (ball has happiness effect)
      expect(newPet.happinessTicksLeft).toBeGreaterThan(initialHappinessTicks);

      // Pet energy should decrease (toys consume energy)
      expect(newPet.currentEnergy).toBeLessThan(initialEnergy);
    });
  });

  describe("Issue 3: Tutorial Quest Progression", () => {
    it("should progress tutorial quest when using care items via ActionCoordinator", async () => {
      // Check initial quest progress
      const initialActiveQuests = testGameState.questLog.activeQuests;
      const tutorialQuest = initialActiveQuests.find(q => q.questId === "pet_care_basics");
      expect(tutorialQuest).toBeDefined();

      // Get the initial 'feed_pet' objective and verify it starts at 0
      const initialFeedObjective = tutorialQuest!.objectives.find(obj => obj.id === "feed_pet");
      expect(initialFeedObjective).toBeDefined();
      expect(initialFeedObjective!.currentAmount).toBe(0);

      // Use apple (care item) via ActionCoordinator
      const useAction = ActionFactory.createItemAction("use", "apple", 1);
      const result = await ActionCoordinator.dispatchAction(testGameState, useAction);

      expect(result.success).toBe(true);

      const newGameState = result.data!.gameState;

      // Quest progress should be updated
      const updatedQuest = newGameState.questLog.activeQuests.find(q => q.questId === "pet_care_basics");
      expect(updatedQuest).toBeDefined();

      // Specifically assert that the 'feed_pet' objective's currentAmount increases from 0 to 1
      const updatedFeedObjective = updatedQuest!.objectives.find(obj => obj.id === "feed_pet");
      expect(updatedFeedObjective).toBeDefined();
      expect(updatedFeedObjective!.currentAmount).toBe(1);
    });
  });

  describe("Baseline: Legacy ItemSystem.useItem should still work", () => {
    it("should maintain backward compatibility with legacy useItem for durability items", () => {
      // Create a fresh pet with low happiness for testing
      const lowHappinessPet = { ...testPet, happiness: 5, happinessTicksLeft: 600 };
      const originalHappiness = lowHappinessPet.happiness;
      
      // This ensures we don't break existing functionality
      const result = ItemSystem.useItem(testInventory, lowHappinessPet, "ball");
      
      expect(result.success).toBe(true);
      expect(result.data!.pet.happiness).toBeGreaterThan(originalHappiness);
      
      const ballSlot = ItemSystem.getInventoryItem(result.data!.inventory, "ball")!;
      const ballItem = ballSlot.item as DurabilityItem;
      expect(ballItem.currentDurability).toBe(19); // 20 - 1 = 19
    });

    it("should maintain backward compatibility with legacy useItem for consumable items", () => {
      // Create a fresh pet with low satiety for testing
      const lowSatietyPet = { ...testPet, satiety: 5, satietyTicksLeft: 500 };
      const originalSatiety = lowSatietyPet.satiety;
      
      const result = ItemSystem.useItem(testInventory, lowSatietyPet, "apple");
      
      expect(result.success).toBe(true);
      expect(result.data!.pet.satiety).toBeGreaterThan(originalSatiety);
      expect(result.data!.inventory.slots.find(s => s.item.id === "apple")!.quantity).toBe(2);
    });
  });
});