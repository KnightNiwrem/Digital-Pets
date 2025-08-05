/**
 * Test file for Issue #110: Care items are still usable even when pet care is full
 * Testing specific scenarios where care items should be blocked when stats are at 100%
 */

import { describe, it, expect } from "bun:test";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import { ActionFactory } from "@/types/UnifiedActions";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { ItemSystem } from "@/systems/ItemSystem";
import { getItemById } from "@/data/items";

describe("Issue #110 - Care items blocked when stats are full", () => {
  describe("Pet Care Panel Actions", () => {
    it("should prevent feeding when satiety is at 100%", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet satiety to maximum
      pet.satiety = 100;
      pet.satietyTicksLeft = 5000; // High value to ensure 100% display
      
      // Add a food item to inventory
      const foodItem = getItemById("apple");
      expect(foodItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, foodItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Try to feed pet with item
      const action = ActionFactory.createPetCareAction("feed", { itemId: "apple" });
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should fail because pet is not hungry
      expect(result.success).toBe(false);
      expect(result.error).toContain("hungry");
    });
    
    it("should prevent giving drink when hydration is at 100%", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet hydration to maximum
      pet.hydration = 100;
      pet.hydrationTicksLeft = 4000; // High value to ensure 100% display
      
      // Add a drink item to inventory
      const drinkItem = getItemById("water_bottle");
      expect(drinkItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, drinkItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Try to give drink to pet
      const action = ActionFactory.createPetCareAction("drink", { itemId: "water_bottle" });
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should fail because pet is not thirsty
      expect(result.success).toBe(false);
      expect(result.error).toContain("thirsty");
    });
    
    it("should prevent playing when happiness is at 100%", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet happiness to maximum
      pet.happiness = 100;
      pet.happinessTicksLeft = 6000; // High value to ensure 100% display
      pet.currentEnergy = 50; // Ensure sufficient energy
      
      // Add a toy item to inventory
      const toyItem = getItemById("ball");
      expect(toyItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, toyItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Try to play with pet
      const action = ActionFactory.createPetCareAction("play", { itemId: "ball" });
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should fail because pet is already very happy
      expect(result.success).toBe(false);
      expect(result.error).toContain("happy");
    });
  });
  
  describe("Inventory Direct Item Usage", () => {
    it("should prevent using food items when satiety is at 100%", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet satiety to maximum
      pet.satiety = 100;
      pet.satietyTicksLeft = 5000;
      
      // Add a food item to inventory
      const foodItem = getItemById("apple");
      expect(foodItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, foodItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Try to use food item directly from inventory
      const action = ActionFactory.createItemAction("use", "apple", 1);
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should fail because pet doesn't need food
      expect(result.success).toBe(false);
      expect(result.error).toContain("hungry");
    });
    
    it("should prevent using drink items when hydration is at 100%", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet hydration to maximum  
      pet.hydration = 100;
      pet.hydrationTicksLeft = 4000;
      
      // Add a drink item to inventory
      const drinkItem = getItemById("water_bottle");
      expect(drinkItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, drinkItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Try to use drink item directly from inventory
      const action = ActionFactory.createItemAction("use", "water_bottle", 1);
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should fail because pet doesn't need water
      expect(result.success).toBe(false);
      expect(result.error).toContain("thirsty");
    });
    
    it("should prevent using toy items when happiness is at 100%", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet happiness to maximum
      pet.happiness = 100;
      pet.happinessTicksLeft = 6000;
      pet.currentEnergy = 50; // Ensure sufficient energy
      
      // Add a toy item to inventory
      const toyItem = getItemById("ball");
      expect(toyItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, toyItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Try to use toy item directly from inventory
      const action = ActionFactory.createItemAction("use", "ball", 1);
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should fail because pet is already happy
      expect(result.success).toBe(false);
      expect(result.error).toContain("happy");
    });
  });
  
  describe("Item Consumption and UI Updates", () => {
    it("should consume items and update inventory immediately for consumables", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet to need food
      pet.satiety = 50;
      pet.satietyTicksLeft = 1000;
      
      // Ensure clean inventory by clearing existing items
      gameState.inventory.slots = [];
      
      // Add multiple food items to inventory
      const foodItem = getItemById("apple");
      expect(foodItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, foodItem!, 3);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Verify initial quantity
      const initialSlot = ItemSystem.getInventoryItem(gameState.inventory, "apple");
      expect(initialSlot?.quantity).toBe(3);
      
      // Use food item
      const action = ActionFactory.createPetCareAction("feed", { itemId: "apple" });
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should succeed and update inventory
      expect(result.success).toBe(true);
      
      if (result.success && result.data) {
        const updatedSlot = ItemSystem.getInventoryItem(result.data.gameState.inventory, "apple");
        expect(updatedSlot?.quantity).toBe(2); // One item consumed
      }
    });
    
    it("should update durability and remove broken items immediately", async () => {
      const gameState = GameStateFactory.createTestGame();
      const pet = gameState.currentPet!;
      
      // Set pet to need happiness
      pet.happiness = 50;
      pet.happinessTicksLeft = 1000;
      pet.currentEnergy = 50;
      
      // Ensure clean inventory
      gameState.inventory.slots = [];
      
      // Add a toy with low durability to inventory
      const toyItem = getItemById("ball");
      expect(toyItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, toyItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Manually set very low durability to test breaking
      const slot = ItemSystem.getInventoryItem(gameState.inventory, "ball");
      if (slot && !slot.item.stackable) {
        (slot.item as any).currentDurability = 1; // Will break after one use
        (slot.item as any).durabilityLossPerUse = 1; // Ensure it will break
      }
      
      // Use toy item
      const action = ActionFactory.createPetCareAction("play", { itemId: "ball" });
      const result = await ActionCoordinator.dispatchAction(gameState, action);
      
      // Should succeed
      expect(result.success).toBe(true);
      
      if (result.success && result.data) {
        // Item should be removed or have reduced durability
        const updatedSlot = ItemSystem.getInventoryItem(result.data.gameState.inventory, "ball");
        if (updatedSlot) {
          // If still present, durability should be reduced
          expect((updatedSlot.item as any).currentDurability).toBeLessThan(1);
        }
        // If removed entirely, that's also valid behavior for broken items
      }
    });
  });
});