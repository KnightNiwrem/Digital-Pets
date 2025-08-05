// Test for Issue #108: Care items from care page should reduce quantity/durability
import { expect, it, describe } from "bun:test";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import { ActionFactory } from "@/types/UnifiedActions";
import { ItemSystem } from "@/systems/ItemSystem";
import { getItemById } from "@/data/items";
import type { GameState, DurabilityItem } from "@/types";

describe("Care Item Consumption Fix (Issue #108)", () => {
  function createTestGameState(): GameState {
    const gameState = GameStateFactory.createNewGameWithStarter("TestPet", "cat_common");
    gameState.inventory.slots = [];
    gameState.inventory.gold = 1000;
    return gameState;
  }

  it("should reduce quantity when using consumable food item for feeding", async () => {
    const gameState = createTestGameState();
    
    const fishItem = getItemById("fish");
    expect(fishItem).toBeDefined();
    expect(fishItem!.stackable).toBe(true);
    
    const addResult = ItemSystem.addItem(gameState.inventory, fishItem!, 3);
    gameState.inventory = addResult.data!;
    expect(addResult.success).toBe(true);
    gameState.inventory = addResult.data!;
    
    const initialSlot = gameState.inventory.slots.find(slot => slot.item.id === "fish");
    expect(initialSlot).toBeDefined();
    expect(initialSlot!.quantity).toBe(3);
    
    const feedAction = ActionFactory.createPetCareAction("feed", { itemId: "fish" });
    const result = await ActionCoordinator.dispatchAction(gameState, feedAction);
    
    expect(result.success).toBe(true);
    
    const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "fish");
    expect(updatedSlot).toBeDefined();
    expect(updatedSlot!.quantity).toBe(2);
  });

  it("should reduce quantity when using consumable drink item for hydration", async () => {
    const gameState = createTestGameState();
    
    const waterItem = getItemById("water_bottle");
    expect(waterItem).toBeDefined();
    expect(waterItem!.stackable).toBe(true);
    
    const addResult = ItemSystem.addItem(gameState.inventory, waterItem!, 2);
    gameState.inventory = addResult.data!;
    expect(addResult.success).toBe(true);
    
    const drinkAction = ActionFactory.createPetCareAction("drink", { itemId: "water_bottle" });
    const result = await ActionCoordinator.dispatchAction(gameState, drinkAction);
    
    expect(result.success).toBe(true);
    
    const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "water_bottle");
    expect(updatedSlot!.quantity).toBe(1);
  });

  it("should remove item when last consumable is used", async () => {
    const gameState = createTestGameState();
    
    const appleItem = getItemById("apple");
    expect(appleItem).toBeDefined();
    expect(appleItem!.stackable).toBe(true);
    
    const addResult = ItemSystem.addItem(gameState.inventory, appleItem!, 1);
    gameState.inventory = addResult.data!;
    expect(addResult.success).toBe(true);
    
    const feedAction = ActionFactory.createPetCareAction("feed", { itemId: "apple" });
    const result = await ActionCoordinator.dispatchAction(gameState, feedAction);
    
    expect(result.success).toBe(true);
    
    const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "apple");
    expect(updatedSlot).toBeUndefined();
  });

  it("should reduce durability when using durability item for playing", async () => {
    const gameState = createTestGameState();
    
    const ballItem = getItemById("ball");
    expect(ballItem).toBeDefined();
    expect(ballItem!.stackable).toBe(false);
    
    const addResult = ItemSystem.addItem(gameState.inventory, ballItem!, 1);
    gameState.inventory = addResult.data!;
    expect(addResult.success).toBe(true);
    
    const initialSlot = gameState.inventory.slots.find(slot => slot.item.id === "ball");
    expect(initialSlot).toBeDefined();
    const initialDurabilityItem = initialSlot!.item as DurabilityItem;
    const initialDurability = initialDurabilityItem.currentDurability;
    expect(initialDurability).toBeGreaterThan(0);
    
    const playAction = ActionFactory.createPetCareAction("play", { itemId: "ball" });
    const result = await ActionCoordinator.dispatchAction(gameState, playAction);
    
    expect(result.success).toBe(true);
    
    const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "ball");
    expect(updatedSlot).toBeDefined();
    const updatedDurabilityItem = updatedSlot!.item as DurabilityItem;
    const expectedDurability = initialDurability - initialDurabilityItem.durabilityLossPerUse;
    expect(updatedDurabilityItem.currentDurability).toBe(expectedDurability);
  });

  it("should validate that pet stats are updated along with item consumption", async () => {
    const gameState = createTestGameState();
    
    const fishItem = getItemById("fish");
    expect(fishItem).toBeDefined();
    
    const addResult = ItemSystem.addItem(gameState.inventory, fishItem!, 1);
    gameState.inventory = addResult.data!;
    expect(addResult.success).toBe(true);
    
    const initialSatietyTicks = gameState.currentPet!.satietyTicksLeft;
    
    const feedAction = ActionFactory.createPetCareAction("feed", { itemId: "fish" });
    const result = await ActionCoordinator.dispatchAction(gameState, feedAction);
    
    expect(result.success).toBe(true);
    
    const updatedPet = result.data!.gameState.currentPet!;
    const updatedSlot = result.data!.gameState.inventory.slots.find(slot => slot.item.id === "fish");
    
    expect(updatedPet.satietyTicksLeft).toBeGreaterThan(initialSatietyTicks);
    expect(updatedSlot).toBeUndefined();
  });
});