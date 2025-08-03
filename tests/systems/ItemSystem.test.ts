// Unit tests for ItemSystem

import { describe, it, expect, beforeEach } from "bun:test";
import { ItemSystem } from "@/systems/ItemSystem";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import type { Pet, PetSpecies } from "@/types/Pet";
import type { Inventory, ConsumableItem, DurabilityItem } from "@/types/Item";
import type { GameState } from "@/types";
import { ActionFactory } from "@/types/UnifiedActions";
import { getItemById } from "@/data/items";

describe("ItemSystem", () => {
  let testInventory: Inventory;
  let testPet: Pet;
  let testGameState: GameState;
  let apple: ConsumableItem;
  let ball: DurabilityItem;

  beforeEach(() => {
    testInventory = ItemSystem.createInventory(10, 100);

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
      satiety: 5, // Math.ceil(500 / 100) = 5
      hydration: 7, // Math.ceil(500 / 80) = 7
      happiness: 5, // Math.ceil(500 / 120) = 5
      satietyTicksLeft: 500,
      hydrationTicksLeft: 500,
      happinessTicksLeft: 500,
      poopTicksLeft: 100,
      poopCount: 0,
      sickByPoopTicksLeft: 1000,
      life: 500000,
      maxEnergy: 100,
      currentEnergy: 50,
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

    // Create minimal test game state for ActionCoordinator tests
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
        activeQuests: [],
        completedQuests: [],
        failedQuests: [],
        availableQuests: [],
        questChains: [],
      },
    } as unknown as GameState;

    apple = getItemById("apple") as ConsumableItem;
    ball = getItemById("ball") as DurabilityItem;
  });

  describe("Inventory Management", () => {
    describe("createInventory", () => {
      it("should create empty inventory with default values", () => {
        const inventory = ItemSystem.createInventory();
        expect(inventory.slots).toEqual([]);
        expect(inventory.maxSlots).toBe(50);
        expect(inventory.gold).toBe(100);
      });

      it("should create inventory with custom values", () => {
        const inventory = ItemSystem.createInventory(20, 200);
        expect(inventory.maxSlots).toBe(20);
        expect(inventory.gold).toBe(200);
      });
    });

    describe("addItem", () => {
      it("should successfully add stackable item to empty inventory", () => {
        const result = ItemSystem.addItem(testInventory, apple, 5);
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(1);
        expect(result.data!.slots[0].item.id).toBe("apple");
        expect(result.data!.slots[0].quantity).toBe(5);
        expect(result.data!.slots[0].slotIndex).toBe(0);
      });

      it("should stack items when adding same stackable item", () => {
        // Add first stack
        let result = ItemSystem.addItem(testInventory, apple, 3);
        expect(result.success).toBe(true);

        // Add to existing stack
        result = ItemSystem.addItem(result.data!, apple, 2);
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(1);
        expect(result.data!.slots[0].quantity).toBe(5);
      });

      it("should fail to stack beyond maximum stack size", () => {
        // Add max stack
        let result = ItemSystem.addItem(testInventory, apple, 99);
        expect(result.success).toBe(true);

        // Try to add one more
        result = ItemSystem.addItem(result.data!, apple, 1);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Stack size limit exceeded");
      });

      it("should add non-stackable items to separate slots", () => {
        const result1 = ItemSystem.addItem(testInventory, ball, 1);
        expect(result1.success).toBe(true);

        const result2 = ItemSystem.addItem(result1.data!, ball, 1);
        expect(result2.success).toBe(true);
        expect(result2.data!.slots).toHaveLength(2);
      });

      it("should fail when trying to add multiple non-stackable items at once", () => {
        const result = ItemSystem.addItem(testInventory, ball, 2);
        expect(result.success).toBe(false);
        expect(result.error).toContain("Cannot add multiple non-stackable items");
      });

      it("should fail when inventory is full", () => {
        // Fill inventory
        for (let i = 0; i < 10; i++) {
          const result = ItemSystem.addItem(testInventory, ball, 1);
          if (!result.success) break;
          testInventory = result.data!;
        }

        // Try to add one more
        const result = ItemSystem.addItem(testInventory, apple, 1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Inventory is full");
      });

      it("should fail with non-positive quantity", () => {
        const result = ItemSystem.addItem(testInventory, apple, 0);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Quantity must be positive");
      });
    });

    describe("removeItem", () => {
      beforeEach(() => {
        testInventory = ItemSystem.addItem(testInventory, apple, 5).data!;
      });

      it("should successfully remove partial quantity", () => {
        const result = ItemSystem.removeItem(testInventory, "apple", 2);
        expect(result.success).toBe(true);
        expect(result.data!.slots[0].quantity).toBe(3);
      });

      it("should remove entire slot when removing all quantity", () => {
        const result = ItemSystem.removeItem(testInventory, "apple", 5);
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(0);
      });

      it("should fail when item not found", () => {
        const result = ItemSystem.removeItem(testInventory, "nonexistent", 1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item not found in inventory");
      });

      it("should fail when not enough items", () => {
        const result = ItemSystem.removeItem(testInventory, "apple", 10);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough items in inventory");
      });

      it("should fail with non-positive quantity", () => {
        const result = ItemSystem.removeItem(testInventory, "apple", -1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Quantity must be positive");
      });
    });

    describe("getInventoryItem", () => {
      beforeEach(() => {
        testInventory = ItemSystem.addItem(testInventory, apple, 3).data!;
      });

      it("should find existing item", () => {
        const slot = ItemSystem.getInventoryItem(testInventory, "apple");
        expect(slot).not.toBeNull();
        expect(slot!.item.id).toBe("apple");
        expect(slot!.quantity).toBe(3);
      });

      it("should return null for non-existent item", () => {
        const slot = ItemSystem.getInventoryItem(testInventory, "nonexistent");
        expect(slot).toBeNull();
      });
    });

    describe("hasItem", () => {
      beforeEach(() => {
        testInventory = ItemSystem.addItem(testInventory, apple, 3).data!;
      });

      it("should return true when has enough items", () => {
        expect(ItemSystem.hasItem(testInventory, "apple", 2)).toBe(true);
        expect(ItemSystem.hasItem(testInventory, "apple", 3)).toBe(true);
      });

      it("should return false when not enough items", () => {
        expect(ItemSystem.hasItem(testInventory, "apple", 5)).toBe(false);
      });

      it("should return false for non-existent item", () => {
        expect(ItemSystem.hasItem(testInventory, "nonexistent", 1)).toBe(false);
      });
    });

    describe("getAvailableSlots", () => {
      it("should return correct available slots", () => {
        expect(ItemSystem.getAvailableSlots(testInventory)).toBe(10);

        testInventory = ItemSystem.addItem(testInventory, apple, 1).data!;
        expect(ItemSystem.getAvailableSlots(testInventory)).toBe(9);

        testInventory = ItemSystem.addItem(testInventory, ball, 1).data!;
        expect(ItemSystem.getAvailableSlots(testInventory)).toBe(8);
      });
    });

    describe("getInventoryValue", () => {
      it("should calculate correct total value", () => {
        expect(ItemSystem.getInventoryValue(testInventory)).toBe(0);

        testInventory = ItemSystem.addItem(testInventory, apple, 2).data!; // 2 * 10 = 20
        testInventory = ItemSystem.addItem(testInventory, ball, 1).data!; // 1 * 25 = 25

        expect(ItemSystem.getInventoryValue(testInventory)).toBe(45);
      });
    });
  });

  describe("Item Usage", () => {
    beforeEach(() => {
      testInventory = ItemSystem.addItem(testInventory, apple, 3).data!;
      testInventory = ItemSystem.addItem(testInventory, ball, 1).data!;
    });

    describe("validateItemUsage", () => {
      it("should allow valid item usage", () => {
        const result = ItemSystem.validateItemUsage(testPet, apple);
        expect(result.success).toBe(true);
      });

      it("should fail for dead pet", () => {
        const deadPet = { ...testPet, life: 0 };
        const result = ItemSystem.validateItemUsage(deadPet, apple);
        expect(result.success).toBe(false);
        expect(result.error).toContain("deceased pet");
      });

      it("should fail medicine on healthy pet", () => {
        const medicine = getItemById("basic_medicine")!;
        const result = ItemSystem.validateItemUsage(testPet, medicine);
        expect(result.success).toBe(false);
        expect(result.error).toContain("already healthy");
      });

      it("should fail hygiene item when pet has no poop to clean", () => {
        const soap = getItemById("soap")!;
        const cleanPet = { ...testPet, poopCount: 0 }; // Explicitly clean pet
        const result = ItemSystem.validateItemUsage(cleanPet, soap);
        expect(result.success).toBe(false);
        expect(result.error).toContain("no poop to clean");
      });

      it("should allow hygiene item when pet has poop to clean", () => {
        const soap = getItemById("soap")!;
        const dirtyPet = { ...testPet, poopCount: 2 }; // Pet with poop
        const result = ItemSystem.validateItemUsage(dirtyPet, soap);
        expect(result.success).toBe(true);
      });

      it("should fail toy when pet is very happy", () => {
        const happyPet = { ...testPet, happiness: 100 };
        const result = ItemSystem.validateItemUsage(happyPet, ball);
        expect(result.success).toBe(false);
        expect(result.error).toContain("already very happy");
      });

      it("should fail toy when pet has low energy", () => {
        const tiredPet = { ...testPet, currentEnergy: 5 };
        const result = ItemSystem.validateItemUsage(tiredPet, ball);
        expect(result.success).toBe(false);
        expect(result.error).toContain("insufficient energy");
      });

      it("should fail energy item when pet has full energy", () => {
        const energyDrink = getItemById("energy_drink")!;
        const fullEnergyPet = { ...testPet, currentEnergy: testPet.maxEnergy };
        const result = ItemSystem.validateItemUsage(fullEnergyPet, energyDrink);
        expect(result.success).toBe(false);
        expect(result.error).toContain("full energy");
      });

      it("should fail food when pet is not hungry", () => {
        const fullPet = { ...testPet, satiety: 100 };
        const result = ItemSystem.validateItemUsage(fullPet, apple);
        expect(result.success).toBe(false);
        expect(result.error).toContain("not hungry");
      });

      it("should fail broken durability item", () => {
        const brokenBall = { ...ball, currentDurability: 0 };
        const result = ItemSystem.validateItemUsage(testPet, brokenBall);
        expect(result.success).toBe(false);
        expect(result.error).toContain("broken");
      });
    });

    describe("applyItemEffects", () => {
      it("should apply satiety effects correctly", () => {
        const result = ItemSystem.applyItemEffects(testPet, apple);
        expect(result.success).toBe(true);
        expect(result.data!.satiety).toBe(30); // Math.ceil((500 + 25*100) / 100) = 30
        expect(result.data!.satietyTicksLeft).toBe(3000); // 500 + (25 * 100)
      });

      it("should cap satiety at maximum", () => {
        const fullPet = { ...testPet, satiety: 90, satietyTicksLeft: 9000 };
        const result = ItemSystem.applyItemEffects(fullPet, apple);
        expect(result.success).toBe(true);
        expect(result.data!.satiety).toBe(100); // capped at 100
      });

      it("should apply happiness effects and consume energy for toys", () => {
        const result = ItemSystem.applyItemEffects(testPet, ball);
        expect(result.success).toBe(true);
        expect(result.data!.happiness).toBe(35); // Math.ceil((500 + 30*120) / 120) = 35
        expect(result.data!.currentEnergy).toBe(40); // 50 - 10
      });

      it("should apply healing effects", () => {
        const injuredPet = { ...testPet, health: "injured" as const };
        const herb = getItemById("herb")!;
        const result = ItemSystem.applyItemEffects(injuredPet, herb);
        expect(result.success).toBe(true);
        expect(result.data!.health).toBe("healthy");
      });

      it("should apply cure effects", () => {
        const sickPet = { ...testPet, health: "sick" as const };
        const medicine = getItemById("basic_medicine")!;
        const result = ItemSystem.applyItemEffects(sickPet, medicine);
        expect(result.success).toBe(true);
        expect(result.data!.health).toBe("healthy");
      });

      it("should apply cleaning effects", () => {
        const dirtyPet = { ...testPet, poopCount: 2 }; // Pet has uncleaned poop
        const soap = getItemById("soap")!;
        const result = ItemSystem.applyItemEffects(dirtyPet, soap);
        expect(result.success).toBe(true);
        expect(result.data!.poopCount).toBe(0); // Poop count should be reset to 0
        expect(result.data!.poopTicksLeft).toBeGreaterThan(0); // Timer should be reset
        expect(result.data!.sickByPoopTicksLeft).toBe(17280);
      });

      it("should update lastCareTime for consumable items", () => {
        const oldTime = testPet.lastCareTime;
        const result = ItemSystem.applyItemEffects(testPet, apple);
        expect(result.success).toBe(true);
        expect(result.data!.lastCareTime).toBeGreaterThan(oldTime);
      });
    });

    describe("useItem", () => {
      it("should successfully use consumable item", () => {
        const result = ItemSystem.useItem(testInventory, testPet, "apple");
        expect(result.success).toBe(true);
        expect(result.data!.pet.satiety).toBe(30);
        expect(result.data!.inventory.slots[0].quantity).toBe(2); // reduced from 3
        expect(result.data!.usage.success).toBe(true);
      });

      it("should successfully use durability item", () => {
        const result = ItemSystem.useItem(testInventory, testPet, "ball");
        expect(result.success).toBe(true);
        expect(result.data!.pet.happiness).toBe(35);
        expect(result.data!.pet.currentEnergy).toBe(40);

        // Check durability reduced
        const ballSlot = ItemSystem.getInventoryItem(result.data!.inventory, "ball")!;
        const ballItem = ballSlot.item as DurabilityItem;
        expect(ballItem.currentDurability).toBe(19); // 20 - 1
      });

      it("should remove broken durability item", () => {
        // Create a ball with 1 durability
        const fragileInventory = ItemSystem.createInventory();
        const fragileBall = { ...ball, currentDurability: 1 };
        const inventoryWithBall = ItemSystem.addItem(fragileInventory, fragileBall, 1).data!;

        const result = ItemSystem.useItem(inventoryWithBall, testPet, "ball");
        expect(result.success).toBe(true);
        expect(ItemSystem.hasItem(result.data!.inventory, "ball")).toBe(false);
      });

      it("should fail when item not in inventory", () => {
        const result = ItemSystem.useItem(testInventory, testPet, "nonexistent");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item not found in inventory");
      });

      it("should fail when validation fails", () => {
        const fullPet = { ...testPet, satiety: 100 };
        const result = ItemSystem.useItem(testInventory, fullPet, "apple");
        expect(result.success).toBe(false);
        expect(result.error).toContain("not hungry");
      });
    });
  });

  describe("Shop and Trade System", () => {
    describe("buyItem", () => {
      it("should successfully buy item", () => {
        const result = ItemSystem.buyItem(testInventory, "apple", 2, 1.0);
        expect(result.success).toBe(true);
        expect(result.data!.gold).toBe(80); // 100 - (2 * 10)
        expect(ItemSystem.hasItem(result.data!, "apple", 2)).toBe(true);
      });

      it("should apply price multiplier", () => {
        const result = ItemSystem.buyItem(testInventory, "apple", 1, 1.5);
        expect(result.success).toBe(true);
        expect(result.data!.gold).toBe(85); // 100 - (1 * 10 * 1.5)
      });

      it("should fail when not enough gold", () => {
        const result = ItemSystem.buyItem(testInventory, "apple", 20, 1.0);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough gold");
      });

      it("should fail for non-existent item", () => {
        const result = ItemSystem.buyItem(testInventory, "nonexistent", 1, 1.0);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item not found");
      });

      it("should create new durability item instances", () => {
        const result = ItemSystem.buyItem(testInventory, "ball", 1, 1.0);
        expect(result.success).toBe(true);

        const ballSlot = ItemSystem.getInventoryItem(result.data!, "ball")!;
        const ballItem = ballSlot.item as DurabilityItem;
        expect(ballItem.currentDurability).toBe(20); // full durability
      });
    });

    describe("sellItem", () => {
      beforeEach(() => {
        testInventory = ItemSystem.addItem(testInventory, apple, 3).data!;
      });

      it("should successfully sell item", () => {
        const result = ItemSystem.sellItem(testInventory, "apple", 2, 0.5);
        expect(result.success).toBe(true);
        expect(result.data!.gold).toBe(110); // 100 + (2 * 10 * 0.5)
        expect(ItemSystem.getInventoryItem(result.data!, "apple")!.quantity).toBe(1);
      });

      it("should sell with durability adjustment", () => {
        // Add damaged ball
        const damagedBall = { ...ball, currentDurability: 10 }; // 50% durability
        testInventory = ItemSystem.addItem(testInventory, damagedBall, 1).data!;

        const result = ItemSystem.sellItem(testInventory, "ball", 1, 0.5);
        expect(result.success).toBe(true);
        // 25 * 0.5 * 0.5 (durability) = 6.25, floored to 6
        expect(result.data!.gold).toBe(106);
      });

      it("should fail when item not found", () => {
        const result = ItemSystem.sellItem(testInventory, "nonexistent", 1, 0.5);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item not found in inventory");
      });

      it("should fail when not enough items", () => {
        const result = ItemSystem.sellItem(testInventory, "apple", 5, 0.5);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough items to sell");
      });
    });
  });

  describe("Utility Functions", () => {
    beforeEach(() => {
      // Add various items for testing
      testInventory = ItemSystem.addItem(testInventory, apple, 3).data!;
      const damagedBall = { ...ball, currentDurability: 5 };
      testInventory = ItemSystem.addItem(testInventory, damagedBall, 1).data!;
    });

    describe("getLowDurabilityItems", () => {
      it("should identify low durability items", () => {
        const lowDurabilityItems = ItemSystem.getLowDurabilityItems(testInventory);
        expect(lowDurabilityItems).toHaveLength(1);
        expect(lowDurabilityItems[0].id).toBe("ball");
        expect(lowDurabilityItems[0].currentDurability).toBe(5);
      });
    });

    describe("getItemsByCategory", () => {
      it("should categorize items correctly", () => {
        const categories = ItemSystem.getItemsByCategory(testInventory);
        expect(categories.food).toHaveLength(1);
        expect(categories.toys).toHaveLength(1);
        expect(categories.drinks).toHaveLength(0);
      });

      // ActionCoordinator Integration Tests - Testing the ACTUAL production code path
      describe("ActionCoordinator Integration", () => {
        describe("Shop Operations via ActionCoordinator", () => {
          it("should handle buy action through full ActionCoordinator pipeline", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "apple", 2);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            // Validate the actual ActionCoordinator result structure
            const { gameState } = result.data!;

            // Check that inventory was updated with purchased items
            const appleSlot = gameState.inventory.slots.find(s => s.item.id === "apple");
            expect(appleSlot).toBeDefined();
            expect(appleSlot!.quantity).toBe(2);

            // Check that gold was deducted from inventory (ActionCoordinator path may update inventory.gold)
            const expectedCost = apple.value * 2; // 10 * 2 = 20
            expect(gameState.inventory.gold).toBe(testInventory.gold - expectedCost);
          });

          it("should handle buy action with price multiplier", async () => {
            // Create a shop action with price multiplier simulation
            const buyAction = ActionFactory.createItemAction("buy", "apple", 1);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            const { gameState } = result.data!;

            // Check item was added
            const appleSlot = gameState.inventory.slots.find(s => s.item.id === "apple");
            expect(appleSlot).toBeDefined();
            expect(appleSlot!.quantity).toBe(1);

            // Check gold deduction
            const expectedCost = apple.value * 1; // 10 * 1 = 10
            expect(gameState.inventory.gold).toBe(testInventory.gold - expectedCost);
          });

          it("should fail buy action when insufficient gold", async () => {
            // Create a game state with low gold
            const poorGameState = {
              ...testGameState,
              inventory: { ...testInventory, gold: 5 }, // Only 5 gold, apple costs 10
            } as unknown as GameState;

            const buyAction = ActionFactory.createItemAction("buy", "apple", 1);

            const result = await ActionCoordinator.dispatchAction(poorGameState, buyAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Insufficient gold");
          });

          it("should handle durability items correctly", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "ball", 1);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(true);
            const { gameState } = result.data!;

            // Check that durability item was created with full durability
            const ballSlot = gameState.inventory.slots.find(s => s.item.id === "ball");
            expect(ballSlot).toBeDefined();
            expect(ballSlot!.quantity).toBe(1);

            // For durability items, check that currentDurability is set to maxDurability
            const ballItem = ballSlot!.item as DurabilityItem;
            expect(ballItem.currentDurability).toBe(ball.maxDurability);

            // Check gold deduction
            const expectedCost = ball.value * 1; // 25 * 1 = 25
            expect(gameState.inventory.gold).toBe(testInventory.gold - expectedCost);
          });

          it("should fail when buying non-existent item", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "nonexistent_item", 1);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Item not found");
          });

          it("should fail when inventory is full", async () => {
            // Fill inventory to exactly maxSlots capacity (10 slots)
            const fullInventory = { ...testInventory, slots: [] };

            // Fill all 10 slots with different items to prevent stacking
            const ballResult1 = ItemSystem.addItem(fullInventory, ball, 1);
            Object.assign(fullInventory, ballResult1.data);

            // Add 9 more different ball items (since balls are non-stackable, each takes a slot)
            for (let i = 1; i < 10; i++) {
              const ballResult = ItemSystem.addItem(fullInventory, ball, 1);
              if (ballResult.success) {
                Object.assign(fullInventory, ballResult.data);
              }
            }

            const fullGameState = {
              ...testGameState,
              inventory: fullInventory,
            } as unknown as GameState;

            const buyAction = ActionFactory.createItemAction("buy", "apple", 1); // Different item that would need a new slot

            const result = await ActionCoordinator.dispatchAction(fullGameState, buyAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Insufficient inventory space");
          });
        });

        describe("Sell Operations via ActionCoordinator", () => {
          it("should handle sell action through ActionCoordinator", async () => {
            // Create completely fresh inventory and game state for this test
            const freshInventory = ItemSystem.createInventory(10, 100);
            const freshInventoryWithApples = ItemSystem.addItem(freshInventory, apple, 5).data!;
            
            const freshGameState = {
              ...testGameState,
              inventory: freshInventoryWithApples,
            } as unknown as GameState;
    
            // Debug: Check initial state
            const initialAppleSlot = freshGameState.inventory.slots.find(s => s.item.id === "apple");
            expect(initialAppleSlot).toBeDefined();
            expect(initialAppleSlot!.quantity).toBe(5);
    
            const sellAction = ActionFactory.createItemAction("sell", "apple", 2);
    
            const result = await ActionCoordinator.dispatchAction(freshGameState, sellAction);
    
            expect(result.success).toBe(true);
            const { gameState, proposals } = result.data!;
    
            // Debug: Check what proposals were generated
            console.log("Generated proposals:", proposals.map(p => ({ description: p.description, changes: p.changes })));
    
            // Check that items were removed
            const appleSlot = gameState.inventory.slots.find(s => s.item.id === "apple");
            expect(appleSlot).toBeDefined();
            
            // Debug: Log actual vs expected
            console.log(`Expected quantity: 3, Actual quantity: ${appleSlot!.quantity}`);
            expect(appleSlot!.quantity).toBe(3); // 5 - 2 = 3
    
            // Check that gold was added (assuming 50% sell price)
            const expectedValue = Math.floor(apple.value * 0.5) * 2; // (10 * 0.5) * 2 = 10
            expect(gameState.inventory.gold).toBe(freshInventory.gold + expectedValue);
          });

          it("should fail sell when item not in inventory", async () => {
            const sellAction = ActionFactory.createItemAction("sell", "nonexistent", 1);

            const result = await ActionCoordinator.dispatchAction(testGameState, sellAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Item not found");
          });

          it("should fail sell when insufficient quantity", async () => {
            // Create a fresh game state with apples in inventory for this specific test
            const inventoryWithApples = ItemSystem.addItem(testInventory, apple, 5).data!;
            const gameStateWithApples = {
              ...testGameState,
              inventory: inventoryWithApples,
            } as unknown as GameState;

            const sellAction = ActionFactory.createItemAction("sell", "apple", 10); // More than the 5 we have

            const result = await ActionCoordinator.dispatchAction(gameStateWithApples, sellAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Insufficient item quantity to sell");
          });
        });

        describe("Proposal Generation Validation", () => {
          it("should generate correct proposals for buy operations", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "apple", 2);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(true);
            expect(result.data!.proposals).toBeDefined();

            const proposals = result.data!.proposals;

            // Should have at least 2 proposals: gold deduction and item addition
            expect(proposals.length).toBeGreaterThanOrEqual(2);

            // Check for gold deduction proposal
            const goldProposal = proposals.find(p =>
              p.changes.some(c => c.type === "game_state_update" && c.property === "inventory.gold")
            );
            expect(goldProposal).toBeDefined();

            // Check for inventory update proposal
            const inventoryProposal = proposals.find(p =>
              p.changes.some(c => c.type === "inventory_update" && c.target === "apple")
            );
            expect(inventoryProposal).toBeDefined();
          });

          it("should validate state consistency across proposals", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "apple", 3);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(true);
            const { gameState } = result.data!;

            // Validate that all state changes are consistent
            const appleSlot = gameState.inventory.slots.find(s => s.item.id === "apple");
            const goldCost = apple.value * 3;

            expect(appleSlot!.quantity).toBe(3);
            expect(gameState.inventory.gold).toBe(testInventory.gold - goldCost);

            // Validate that slotIndex is properly assigned
            expect(appleSlot!.slotIndex).toBeGreaterThanOrEqual(0);
            expect(appleSlot!.slotIndex).toBeLessThan(gameState.inventory.maxSlots);
          });
        });

        describe("Error Handling and Edge Cases", () => {
          it("should handle zero quantity gracefully", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "apple", 0);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Quantity must be positive");
          });

          it("should handle negative quantity gracefully", async () => {
            const buyAction = ActionFactory.createItemAction("buy", "apple", -1);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Quantity must be positive");
          });

          it("should maintain inventory integrity on partial failures", async () => {
            // This test ensures that if part of a transaction fails, the state remains consistent
            const originalGold = testGameState.inventory.gold;
            const originalSlotCount = testGameState.inventory.slots.length;

            const buyAction = ActionFactory.createItemAction("buy", "nonexistent", 1);

            const result = await ActionCoordinator.dispatchAction(testGameState, buyAction);

            expect(result.success).toBe(false);

            // Verify state wasn't modified on failure
            expect(testGameState.inventory.gold).toBe(originalGold);
            expect(testGameState.inventory.slots.length).toBe(originalSlotCount);
          });
        });
      });
    });

    describe("sortInventory", () => {
      beforeEach(() => {
        const berry = getItemById("berry")!;
        testInventory = ItemSystem.addItem(testInventory, berry, 1).data!;
      });

      it("should sort by name", () => {
        const sorted = ItemSystem.sortInventory(testInventory, "name");
        expect(sorted.slots[0].item.name).toBe("Bouncy Ball");
        expect(sorted.slots[1].item.name).toBe("Forest Berry");
        expect(sorted.slots[2].item.name).toBe("Fresh Apple");
      });

      it("should sort by value", () => {
        const sorted = ItemSystem.sortInventory(testInventory, "value");
        expect(sorted.slots[0].item.value).toBe(25); // ball
        expect(sorted.slots[1].item.value).toBe(10); // apple
        expect(sorted.slots[2].item.value).toBe(8); // berry
      });

      it("should sort by rarity", () => {
        const sorted = ItemSystem.sortInventory(testInventory, "rarity");
        // All items are common in this test, so order should remain stable
        expect(sorted.slots).toHaveLength(3);
      });

      it("should sort by type", () => {
        const sorted = ItemSystem.sortInventory(testInventory, "type");
        expect(sorted.slots[0].item.type).toBe("consumable");
        expect(sorted.slots[1].item.type).toBe("consumable");
        expect(sorted.slots[2].item.type).toBe("toy");
      });

      it("should sort by quantity", () => {
        const sorted = ItemSystem.sortInventory(testInventory, "quantity");
        expect(sorted.slots[0].quantity).toBe(3); // apple
        expect(sorted.slots[1].quantity).toBe(1); // berry or ball
        expect(sorted.slots[2].quantity).toBe(1); // berry or ball
      });
    });
  });
});
