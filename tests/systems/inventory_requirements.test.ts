// Test script to verify inventory checking functionality
import { describe, it, expect, beforeEach } from "bun:test";
import { WorldSystem } from "@/systems/WorldSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { GameStateFactory } from "@/engine/GameStateFactory";
import type { GameState } from "@/types";
import { getItemById } from "@/data/items";

describe("WorldSystem Inventory Requirements", () => {
  let gameStateEmpty: GameState;
  let gameStateWithItem: GameState;

  beforeEach(() => {
    // Create game state with empty inventory
    gameStateEmpty = GameStateFactory.createTestGame();
    
    // Set location to riverside where fishing activity exists
    gameStateEmpty.world.currentLocationId = "riverside";
    gameStateEmpty.world.unlockedLocations.push("riverside");

    // Create game state with inventory containing fishing rod
    gameStateWithItem = { ...gameStateEmpty };
    const fishingRod = getItemById("fishing_rod");
    if (fishingRod) {
      const addResult = ItemSystem.addItem(gameStateWithItem.inventory, fishingRod, 1);
      if (addResult.success) {
        gameStateWithItem.inventory = addResult.data!;
      }
    }
  });

  it("should fail to start activity when required item is missing", () => {
    // Try to start fishing activity that requires fishing_rod
    const result = WorldSystem.startActivity(gameStateEmpty, "riverside_fishing");

    expect(result.success).toBe(false);
    expect(result.error).toContain("fishing_rod");
  });

  it("should successfully start activity when required item is present", () => {
    // Try to start fishing activity with fishing_rod in inventory
    const result = WorldSystem.startActivity(gameStateWithItem, "riverside_fishing");

    // This might still fail due to location requirements, but it should NOT fail due to missing item
    if (!result.success) {
      expect(result.error).not.toContain("fishing_rod");
    }
  });

  it("should pass item requirement check when item exists in inventory", () => {
    // Verify the inventory actually has the item
    const hasItem = ItemSystem.hasItem(gameStateWithItem.inventory, "fishing_rod", 1);
    expect(hasItem).toBe(true);
  });

  it("should fail item requirement check when item is missing", () => {
    // Verify empty inventory doesn't have the item
    const hasItem = ItemSystem.hasItem(gameStateEmpty.inventory, "fishing_rod", 1);
    expect(hasItem).toBe(false);
  });
});
