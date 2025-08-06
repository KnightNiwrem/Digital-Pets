/**
 * Test file for Issue #112: Medicine validation and consumption fixes
 * Testing specific scenarios:
 * 1. "Unknown pet care type: medicine" validation error
 * 2. Healing herbs consumed even when not needed
 */

import { describe, it, expect } from "bun:test";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import { ActionFactory } from "@/types/UnifiedActions";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { ItemSystem } from "@/systems/ItemSystem";
import { getItemById } from "@/data/items";
import type { GameState } from "@/types";

describe("Issue #112 - Medicine validation and consumption fixes", () => {
  function createTestGameState(): GameState {
    const gameState = GameStateFactory.createNewGameWithStarter("TestPet", "cat_common");
    gameState.inventory.slots = [];
    gameState.inventory.gold = 1000;
    return gameState;
  }

  describe("Medicine care type validation", () => {
    it("should accept 'medicine' as a valid pet care type", async () => {
      const gameState = createTestGameState();
      
      // Set pet to be sick so medicine is needed
      gameState.currentPet!.health = "sick";
      gameState.currentPet!.currentHealth = 50;
      
      // Add basic medicine to inventory
      const medicineItem = getItemById("basic_medicine");
      expect(medicineItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, medicineItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Create medicine care action
      const medicineAction = ActionFactory.createPetCareAction("medicine", { itemId: "basic_medicine" });
      const result = await ActionCoordinator.dispatchAction(gameState, medicineAction);
      
      // Should NOT fail with "Unknown pet care type: medicine"
      if (!result.success) {
        console.log("Medicine action failed with error:", result.error);
      }
      expect(result.success).toBe(true);
    });

    it("should validate medicine care action requirements properly", async () => {
      const gameState = createTestGameState();
      
      // Set pet to be healthy (doesn't need medicine)
      gameState.currentPet!.health = "healthy";
      gameState.currentPet!.currentHealth = gameState.currentPet!.maxHealth;
      
      // Add healing herb to inventory
      const herbItem = getItemById("herb");
      expect(herbItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, herbItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Create medicine care action with herb
      const medicineAction = ActionFactory.createPetCareAction("medicine", { itemId: "herb" });
      const result = await ActionCoordinator.dispatchAction(gameState, medicineAction);
      
      // Should succeed in validation (no "Unknown pet care type" error)
      // but may warn/fail due to pet not needing medicine
      if (!result.success) {
        expect(result.error).not.toContain("Unknown pet care type");
        expect(result.error).toContain("medicine"); // Should be specific about medicine not being needed
      }
    });
  });

  describe("Healing item consumption prevention", () => {
    it("should prevent consumption of healing herbs when pet is already healthy", async () => {
      const gameState = createTestGameState();
      
      // Set pet to be completely healthy
      gameState.currentPet!.health = "healthy";
      gameState.currentPet!.currentHealth = gameState.currentPet!.maxHealth;
      
      // Add healing herb to inventory
      const herbItem = getItemById("herb");
      expect(herbItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, herbItem!, 2);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      const initialSlot = gameState.inventory.slots.find(slot => slot.item.id === "herb");
      expect(initialSlot).toBeDefined();
      expect(initialSlot!.quantity).toBe(2);
      
      // Try to use healing herb through direct item usage
      const useAction = ActionFactory.createItemAction("use", "herb", 1);
      const result = await ActionCoordinator.dispatchAction(gameState, useAction);
      
      // Should fail and NOT consume the item
      expect(result.success).toBe(false);
      expect(result.error).toContain("healthy"); // Should indicate pet doesn't need medicine
      
      // Verify item was NOT consumed
      if (result.success) {
        const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "herb");
        expect(updatedSlot?.quantity).toBe(2); // Should remain unchanged
      }
    });

    it("should prevent consumption of healing herbs through medicine care action when pet is healthy", async () => {
      const gameState = createTestGameState();
      
      // Set pet to be completely healthy
      gameState.currentPet!.health = "healthy";
      gameState.currentPet!.currentHealth = gameState.currentPet!.maxHealth;
      
      // Add healing herb to inventory
      const herbItem = getItemById("herb");
      expect(herbItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, herbItem!, 2);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      const initialSlot = gameState.inventory.slots.find(slot => slot.item.id === "herb");
      expect(initialSlot!.quantity).toBe(2);
      
      // Try to use healing herb through medicine care action
      const medicineAction = ActionFactory.createPetCareAction("medicine", { itemId: "herb" });
      const result = await ActionCoordinator.dispatchAction(gameState, medicineAction);
      
      // Should fail and NOT consume the item
      expect(result.success).toBe(false);
      
      // Verify item was NOT consumed (since the action failed)
      const currentSlot = gameState.inventory.slots.find(slot => slot.item.id === "herb");
      expect(currentSlot?.quantity).toBe(2); // Should remain unchanged since action failed
    });

    it("should allow consumption of healing items when pet actually needs healing", async () => {
      const gameState = createTestGameState();
      
      // Set pet to be injured and need healing
      gameState.currentPet!.health = "injured";
      gameState.currentPet!.currentHealth = 50; // Below max health
      const initialHealth = gameState.currentPet!.currentHealth;
      
      // Add healing herb to inventory
      const herbItem = getItemById("herb");
      expect(herbItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, herbItem!, 2);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      const initialSlot = gameState.inventory.slots.find(slot => slot.item.id === "herb");
      expect(initialSlot!.quantity).toBe(2);
      
      // Use healing herb through medicine care action
      const medicineAction = ActionFactory.createPetCareAction("medicine", { itemId: "herb" });
      const result = await ActionCoordinator.dispatchAction(gameState, medicineAction);
      
      // Should succeed and consume the item
      expect(result.success).toBe(true);
      
      if (result.success) {
        const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "herb");
        expect(updatedSlot?.quantity).toBe(1); // Should be reduced by 1
        
        // Pet health should be improved (herb has health effect value 1)
        const updatedPet = result.data!.gameState.currentPet!;
        expect(updatedPet.currentHealth).toBeGreaterThan(initialHealth);
        // Note: herb doesn't have cure effect, so health status may remain "injured"
      }
    });

    it("should allow consumption when pet has reduced health even if not sick/injured", async () => {
      const gameState = createTestGameState();
      
      // Set pet to be healthy status but with reduced current health
      gameState.currentPet!.health = "healthy";
      gameState.currentPet!.currentHealth = gameState.currentPet!.maxHealth - 10; // Slightly damaged
      const initialHealth = gameState.currentPet!.currentHealth;
      
      // Add healing herb to inventory
      const herbItem = getItemById("herb");
      expect(herbItem).toBeDefined();
      
      const addResult = ItemSystem.addItem(gameState.inventory, herbItem!, 1);
      expect(addResult.success).toBe(true);
      gameState.inventory = addResult.data!;
      
      // Use healing herb through direct item usage
      const useAction = ActionFactory.createItemAction("use", "herb", 1);
      const result = await ActionCoordinator.dispatchAction(gameState, useAction);
      
      // Should succeed since pet can benefit from health restoration
      expect(result.success).toBe(true);
      
      if (result.success) {
        const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "herb");
        expect(updatedSlot).toBeUndefined(); // Should be consumed (last one used)
        
        // Pet health should be increased
        const updatedPet = result.data!.gameState.currentPet!;
        expect(updatedPet.currentHealth).toBeGreaterThan(initialHealth);
      }
    });
  });
});