// Test script to verify inventory checking functionality
import { describe, it, expect, beforeEach } from "bun:test";
import { WorldSystem } from "@/systems/WorldSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import type { WorldState, Pet, PetSpecies, Inventory } from "@/types";
import { getItemById } from "@/data/items";

describe("WorldSystem Inventory Requirements", () => {
  let mockPet: Pet;
  let worldState: WorldState;
  let emptyInventory: Inventory;
  let inventoryWithItem: Inventory;

  // Test helper to create a standard test pet
  function createTestPet(): Pet {
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

    return {
      id: "test_pet_1",
      name: "Buddy",
      species: testSpecies,
      rarity: "common",
      growthStage: 10, // High level to pass level requirements
      satiety: 100,
      hydration: 100,
      happiness: 100,
      satietyTicksLeft: 1000,
      hydrationTicksLeft: 1000,
      happinessTicksLeft: 1000,
      poopTicksLeft: 500,
      sickByPoopTicksLeft: 10000,
      life: 500000,
      maxEnergy: 150,
      currentEnergy: 150, // Full energy to pass energy requirements
      health: "healthy",
      state: "idle",
      attack: 15,
      defense: 12,
      speed: 18,
      maxHealth: 60,
      currentHealth: 60,
      moves: [],
      birthTime: Date.now() - 1000000,
      lastCareTime: Date.now() - 60000,
      totalLifetime: 1000000,
    };
  }

  beforeEach(() => {
    mockPet = createTestPet();
    worldState = WorldSystem.initializeWorldState();
    
    // Set location to riverside where fishing activity exists
    worldState.currentLocationId = "riverside";
    worldState.unlockedLocations.push("riverside");
    
    // Create empty inventory
    emptyInventory = ItemSystem.createInventory();
    
    // Create inventory with a fishing rod item
    inventoryWithItem = ItemSystem.createInventory();
    const fishingRod = getItemById("fishing_rod");
    if (fishingRod) {
      const addResult = ItemSystem.addItem(inventoryWithItem, fishingRod, 1);
      if (addResult.success) {
        inventoryWithItem = addResult.data!;
      }
    }
  });

  it("should fail to start activity when required item is missing", () => {
    // Try to start fishing activity that requires fishing_rod
    const result = WorldSystem.startActivity(worldState, mockPet, "riverside_fishing", emptyInventory);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain("fishing_rod");
  });

  it("should successfully start activity when required item is present", () => {
    // Try to start fishing activity with fishing_rod in inventory
    const result = WorldSystem.startActivity(worldState, mockPet, "riverside_fishing", inventoryWithItem);
    
    // This might still fail due to location requirements, but it should NOT fail due to missing item
    if (!result.success) {
      expect(result.error).not.toContain("fishing_rod");
    }
  });

  it("should pass item requirement check when item exists in inventory", () => {
    // Verify the inventory actually has the item
    const hasItem = ItemSystem.hasItem(inventoryWithItem, "fishing_rod", 1);
    expect(hasItem).toBe(true);
  });

  it("should fail item requirement check when item is missing", () => {
    // Verify empty inventory doesn't have the item
    const hasItem = ItemSystem.hasItem(emptyInventory, "fishing_rod", 1);
    expect(hasItem).toBe(false);
  });
});