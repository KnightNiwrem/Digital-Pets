// Test script to verify item reward distribution functionality
import { describe, it, expect, beforeEach } from "bun:test";
import { GameLoop } from "@/engine/GameLoop";
import { ItemSystem } from "@/systems/ItemSystem";
import { GameStateFactory } from "@/engine/GameStateFactory";
import type { GameState, ActivityReward, GameAction } from "@/types";
import { getItemById } from "@/data/items";

describe("GameLoop Item Rewards", () => {
  let gameState: GameState;
  let gameLoop: GameLoop;

  beforeEach(() => {
    gameState = GameStateFactory.createTestGame();
    gameLoop = GameLoop.getInstance();
    gameLoop.initialize(gameState);
  });

  it("should add item to inventory when processing item rewards", () => {
    const rewards: ActivityReward[] = [
      { type: "item", id: "apple", amount: 2, probability: 1.0 }
    ];
    
    const actions: GameAction[] = [];
    const stateChanges: string[] = [];
    
    // Get initial inventory state
    const initialAppleCount = ItemSystem.hasItem(gameState.inventory, "apple", 1) 
      ? gameState.inventory.slots.find(slot => slot.item.id === "apple")?.quantity || 0
      : 0;
    
    // Process rewards using the private method (accessing through any to bypass private)
    (gameLoop as any).processActivityRewards(rewards, actions, stateChanges);
    
    // Check that inventory was updated
    const finalAppleCount = gameState.inventory.slots.find(slot => slot.item.id === "apple")?.quantity || 0;
    expect(finalAppleCount).toBe(initialAppleCount + 2);
    
    // Check that appropriate action was logged
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("item_earned");
    expect(actions[0].payload).toEqual({
      itemId: "apple",
      amount: 2,
      source: "activity"
    });
  });

  it("should handle multiple item rewards correctly", () => {
    const rewards: ActivityReward[] = [
      { type: "item", id: "apple", amount: 1, probability: 1.0 },
      { type: "item", id: "water_bottle", amount: 3, probability: 1.0 },
      { type: "gold", amount: 50, probability: 1.0 }
    ];
    
    const actions: GameAction[] = [];
    const stateChanges: string[] = [];
    
    // Get initial states
    const initialGold = gameState.inventory.gold;
    const initialAppleCount = ItemSystem.hasItem(gameState.inventory, "apple", 1) 
      ? gameState.inventory.slots.find(slot => slot.item.id === "apple")?.quantity || 0
      : 0;
    const initialWaterCount = ItemSystem.hasItem(gameState.inventory, "water_bottle", 1)
      ? gameState.inventory.slots.find(slot => slot.item.id === "water_bottle")?.quantity || 0
      : 0;
    
    // Process rewards
    (gameLoop as any).processActivityRewards(rewards, actions, stateChanges);
    
    // Check inventory updates
    expect(gameState.inventory.gold).toBe(initialGold + 50);
    
    const finalAppleCount = gameState.inventory.slots.find(slot => slot.item.id === "apple")?.quantity || 0;
    expect(finalAppleCount).toBe(initialAppleCount + 1);
    
    const finalWaterCount = gameState.inventory.slots.find(slot => slot.item.id === "water_bottle")?.quantity || 0;
    expect(finalWaterCount).toBe(initialWaterCount + 3);
    
    // Check that all actions were logged
    expect(actions).toHaveLength(3);
    const itemActions = actions.filter(action => action.type === "item_earned");
    const goldActions = actions.filter(action => action.type === "gold_earned");
    expect(itemActions).toHaveLength(2);
    expect(goldActions).toHaveLength(1);
  });

  it("should handle rewards for non-existent items gracefully", () => {
    const rewards: ActivityReward[] = [
      { type: "item", id: "non_existent_item", amount: 1, probability: 1.0 }
    ];
    
    const actions: GameAction[] = [];
    const stateChanges: string[] = [];
    
    // This should not throw an error
    expect(() => {
      (gameLoop as any).processActivityRewards(rewards, actions, stateChanges);
    }).not.toThrow();
    
    // Should still log the action even if item doesn't exist
    expect(actions).toHaveLength(1);
    expect(actions[0].type).toBe("item_earned");
    expect(actions[0].payload.itemId).toBe("non_existent_item");
  });

  it("should verify that items are properly defined in data", () => {
    // This test ensures our test items actually exist
    const apple = getItemById("apple");
    const waterBottle = getItemById("water_bottle");
    
    expect(apple).toBeDefined();
    expect(waterBottle).toBeDefined();
    expect(apple?.name).toBe("Fresh Apple");
    expect(waterBottle?.name).toBe("Water Bottle");
  });
});