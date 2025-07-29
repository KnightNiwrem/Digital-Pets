// ItemSystem unit tests

import { describe, it, expect } from "bun:test";
import { ItemSystem } from "@/systems/ItemSystem";
import type { Pet } from "@/types/Pet";
import type { Inventory, ConsumableItem, DurabilityItem } from "@/types/Item";
import { ITEM_CONSTANTS } from "@/types/Item";

// Test helpers
function createTestPet(): Pet {
  return {
    id: "test-pet",
    name: "Test Pet",
    species: "cat",
    rarity: "common",
    growthStage: 10,
    satiety: 50,
    hydration: 50,
    happiness: 50,
    satietyTicksLeft: 100,
    hydrationTicksLeft: 100,
    happinessTicksLeft: 100,
    poopTicksLeft: 500,
    poopCount: 0,
    sickByPoopTicksLeft: 17280,
    life: 1000000,
    maxEnergy: 150,
    currentEnergy: 100,
    health: "healthy",
    state: "idle",
    lastCareTime: Date.now(),
    lifetime: 5000,
    attack: 50,
    defense: 50,
    speed: 50,
    maxHealth: 100,
    currentHealth: 100,
    moves: [],
    experience: 0,
    level: 1,
  };
}

function createTestInventory(): Inventory {
  return ItemSystem.createInventory(10);
}

describe("ItemSystem", () => {
  describe("Inventory Management", () => {
    describe("createInventory", () => {
      it("should create inventory with default settings", () => {
        const inventory = ItemSystem.createInventory();
        
        expect(inventory.slots).toEqual([]);
        expect(inventory.maxSlots).toBe(ITEM_CONSTANTS.MAX_INVENTORY_SLOTS);
        expect(inventory.gold).toBe(100);
      });

      it("should create inventory with custom max slots", () => {
        const inventory = ItemSystem.createInventory(20);
        
        expect(inventory.maxSlots).toBe(20);
      });
    });

    describe("addItemToInventory", () => {
      it("should add stackable items to inventory", () => {
        const inventory = createTestInventory();
        const result = ItemSystem.addItemToInventory(inventory, "apple", 5);
        
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(1);
        expect(result.data!.slots[0].item.id).toBe("apple");
        expect(result.data!.slots[0].quantity).toBe(5);
      });

      it("should stack items in existing slots", () => {
        const inventory = createTestInventory();
        
        // Add first batch
        const result1 = ItemSystem.addItemToInventory(inventory, "apple", 10);
        expect(result1.success).toBe(true);
        
        // Add second batch to same stack
        const result2 = ItemSystem.addItemToInventory(result1.data!, "apple", 5);
        expect(result2.success).toBe(true);
        expect(result2.data!.slots).toHaveLength(1);
        expect(result2.data!.slots[0].quantity).toBe(15);
      });

      it("should create new stack when max stack size exceeded", () => {
        const inventory = createTestInventory();
        
        // Add items that exceed max stack size
        const result = ItemSystem.addItemToInventory(inventory, "apple", 150);
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(2); // 99 + 51
        expect(result.data!.slots[0].quantity).toBe(99);
        expect(result.data!.slots[1].quantity).toBe(51);
      });

      it("should add non-stackable items to separate slots", () => {
        const inventory = createTestInventory();
        const result = ItemSystem.addItemToInventory(inventory, "ball", 3);
        
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(3);
        expect(result.data!.slots[0].quantity).toBe(1);
        expect(result.data!.slots[1].quantity).toBe(1);
        expect(result.data!.slots[2].quantity).toBe(1);
      });

      it("should fail with invalid item id", () => {
        const inventory = createTestInventory();
        const result = ItemSystem.addItemToInventory(inventory, "invalid_item", 1);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item with id 'invalid_item' not found");
      });

      it("should fail with invalid quantity", () => {
        const inventory = createTestInventory();
        const result = ItemSystem.addItemToInventory(inventory, "apple", 0);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe("Quantity must be positive");
      });

      it("should fail when inventory is full", () => {
        const inventory = createTestInventory();
        
        // Fill inventory with non-stackable items
        for (let i = 0; i < 10; i++) {
          ItemSystem.addItemToInventory(inventory, "ball", 1);
        }
        
        // Try to add one more
        const result = ItemSystem.addItemToInventory(inventory, "ball", 1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough inventory space for non-stackable items");
      });
    });

    describe("removeItemFromInventory", () => {
      it("should remove items from inventory", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 10);
        
        const result = ItemSystem.removeItemFromInventory(inventory, "apple", 3);
        expect(result.success).toBe(true);
        expect(ItemSystem.getItemQuantity(result.data!, "apple")).toBe(7);
      });

      it("should remove entire stack when quantity matches", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        
        const result = ItemSystem.removeItemFromInventory(inventory, "apple", 5);
        expect(result.success).toBe(true);
        expect(result.data!.slots).toHaveLength(0);
      });

      it("should fail when not enough items in inventory", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        
        const result = ItemSystem.removeItemFromInventory(inventory, "apple", 10);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough apple in inventory");
      });

      it("should fail with invalid quantity", () => {
        const inventory = createTestInventory();
        const result = ItemSystem.removeItemFromInventory(inventory, "apple", -1);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe("Quantity must be positive");
      });
    });

    describe("getItemQuantity", () => {
      it("should return correct quantity for existing item", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 15);
        
        const quantity = ItemSystem.getItemQuantity(inventory, "apple");
        expect(quantity).toBe(15);
      });

      it("should return 0 for non-existing item", () => {
        const inventory = createTestInventory();
        
        const quantity = ItemSystem.getItemQuantity(inventory, "apple");
        expect(quantity).toBe(0);
      });

      it("should sum quantities across multiple stacks", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 99);
        ItemSystem.addItemToInventory(inventory, "apple", 50);
        
        const quantity = ItemSystem.getItemQuantity(inventory, "apple");
        expect(quantity).toBe(149);
      });
    });

    describe("hasItem", () => {
      it("should return true when item exists in sufficient quantity", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 10);
        
        expect(ItemSystem.hasItem(inventory, "apple", 5)).toBe(true);
        expect(ItemSystem.hasItem(inventory, "apple", 10)).toBe(true);
      });

      it("should return false when insufficient quantity", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        
        expect(ItemSystem.hasItem(inventory, "apple", 10)).toBe(false);
      });

      it("should return false for non-existing item", () => {
        const inventory = createTestInventory();
        
        expect(ItemSystem.hasItem(inventory, "apple", 1)).toBe(false);
      });
    });
  });

  describe("Item Usage", () => {
    describe("useItem", () => {
      it("should successfully use food item on hungry pet", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 1);
        
        const pet = createTestPet();
        pet.satietyTicksLeft = 20; // hungry
        
        const result = ItemSystem.useItem(inventory, pet, "apple");
        expect(result.success).toBe(true);
        expect(result.data!.pet.satietyTicksLeft).toBeGreaterThan(20);
        expect(ItemSystem.getItemQuantity(result.data!.inventory, "apple")).toBe(0);
      });

      it("should fail to use food on sick pet", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 1);
        
        const pet = createTestPet();
        pet.health = "sick";
        
        const result = ItemSystem.useItem(inventory, pet, "apple");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Cannot feed sick pets");
      });

      it("should successfully use medicine on sick pet", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "basic_medicine", 1);
        
        const pet = createTestPet();
        pet.health = "sick";
        
        const result = ItemSystem.useItem(inventory, pet, "basic_medicine");
        expect(result.success).toBe(true);
        expect(result.data!.pet.health).toBe("healthy");
        expect(ItemSystem.getItemQuantity(result.data!.inventory, "basic_medicine")).toBe(0);
      });

      it("should fail to use medicine on healthy pet", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "basic_medicine", 1);
        
        const pet = createTestPet();
        pet.health = "healthy";
        
        const result = ItemSystem.useItem(inventory, pet, "basic_medicine");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Pet doesn't need medicine");
      });

      it("should successfully use hygiene item when pet has poop", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "soap", 1);
        
        const pet = createTestPet();
        pet.poopCount = 2;
        
        const result = ItemSystem.useItem(inventory, pet, "soap");
        expect(result.success).toBe(true);
        expect(result.data!.pet.poopCount).toBe(1);
        expect(ItemSystem.getItemQuantity(result.data!.inventory, "soap")).toBe(0);
      });

      it("should fail to use hygiene item when pet is clean", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "soap", 1);
        
        const pet = createTestPet();
        pet.poopCount = 0;
        
        const result = ItemSystem.useItem(inventory, pet, "soap");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Pet doesn't need cleaning");
      });

      it("should use toy and reduce durability", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "ball", 1);
        
        const pet = createTestPet();
        pet.happinessTicksLeft = 20; // needs happiness
        
        const result = ItemSystem.useItem(inventory, pet, "ball");
        expect(result.success).toBe(true);
        expect(result.data!.pet.happinessTicksLeft).toBeGreaterThan(20);
        
        // Ball should still exist but with reduced durability
        expect(ItemSystem.getItemQuantity(result.data!.inventory, "ball")).toBe(1);
        const ballSlot = result.data!.inventory.slots.find(s => s.item.id === "ball");
        expect((ballSlot!.item as DurabilityItem).currentDurability).toBe(19);
      });

      it("should remove broken durability items", () => {
        const inventory = createTestInventory();
        const addResult = ItemSystem.addItemToInventory(inventory, "ball", 1);
        
        // Manually set durability to 1
        const ballSlot = addResult.data!.slots.find(s => s.item.id === "ball");
        (ballSlot!.item as DurabilityItem).currentDurability = 1;
        
        const pet = createTestPet();
        const result = ItemSystem.useItem(addResult.data!, pet, "ball");
        
        expect(result.success).toBe(true);
        expect(ItemSystem.getItemQuantity(result.data!.inventory, "ball")).toBe(0);
      });

      it("should fail to use toy when pet has insufficient energy", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "ball", 1);
        
        const pet = createTestPet();
        pet.currentEnergy = 5; // too low for toys
        
        const result = ItemSystem.useItem(inventory, pet, "ball");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Pet needs more energy to play");
      });

      it("should successfully use energy booster", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "energy_drink", 1);
        
        const pet = createTestPet();
        pet.currentEnergy = 50;
        
        const result = ItemSystem.useItem(inventory, pet, "energy_drink");
        expect(result.success).toBe(true);
        expect(result.data!.pet.currentEnergy).toBe(100); // 50 + 50
        expect(ItemSystem.getItemQuantity(result.data!.inventory, "energy_drink")).toBe(0);
      });

      it("should fail to use energy booster when energy is full", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "energy_drink", 1);
        
        const pet = createTestPet();
        pet.currentEnergy = pet.maxEnergy;
        
        const result = ItemSystem.useItem(inventory, pet, "energy_drink");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Pet energy is already full");
      });

      it("should fail to use item on dead pet", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 1);
        
        const pet = createTestPet();
        pet.life = 0;
        
        const result = ItemSystem.useItem(inventory, pet, "apple");
        expect(result.success).toBe(false);
        expect(result.error).toBe("Cannot use items on deceased pets");
      });

      it("should fail when item not in inventory", () => {
        const inventory = createTestInventory();
        const pet = createTestPet();
        
        const result = ItemSystem.useItem(inventory, pet, "apple");
        expect(result.success).toBe(false);
        expect(result.error).toBe("No apple in inventory");
      });
    });
  });

  describe("Shop Interactions", () => {
    describe("buyItem", () => {
      it("should successfully buy item when player has enough gold", () => {
        const inventory = createTestInventory();
        inventory.gold = 50;
        
        const result = ItemSystem.buyItem(inventory, "apple", 2);
        expect(result.success).toBe(true);
        expect(result.data!.gold).toBe(30); // 50 - (10 * 2)
        expect(ItemSystem.getItemQuantity(result.data!, "apple")).toBe(2);
      });

      it("should fail when player doesn't have enough gold", () => {
        const inventory = createTestInventory();
        inventory.gold = 5;
        
        const result = ItemSystem.buyItem(inventory, "apple", 2);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough gold. Need 20, have 5");
      });

      it("should fail with invalid item id", () => {
        const inventory = createTestInventory();
        
        const result = ItemSystem.buyItem(inventory, "invalid_item", 1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item 'invalid_item' not found");
      });

      it("should fail when inventory is full", () => {
        const inventory = createTestInventory();
        inventory.gold = 1000;
        
        // Fill inventory
        for (let i = 0; i < 10; i++) {
          ItemSystem.addItemToInventory(inventory, "ball", 1);
        }
        
        const result = ItemSystem.buyItem(inventory, "ball", 1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough inventory space for non-stackable items");
      });
    });

    describe("sellItem", () => {
      it("should successfully sell item for half price", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        inventory.gold = 50;
        
        const result = ItemSystem.sellItem(inventory, "apple", 2);
        expect(result.success).toBe(true);
        expect(result.data!.gold).toBe(60); // 50 + (5 * 2) = 50 + 10
        expect(ItemSystem.getItemQuantity(result.data!, "apple")).toBe(3);
      });

      it("should fail when not enough items to sell", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 2);
        
        const result = ItemSystem.sellItem(inventory, "apple", 5);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough apple to sell");
      });

      it("should fail with invalid item id", () => {
        const inventory = createTestInventory();
        
        const result = ItemSystem.sellItem(inventory, "invalid_item", 1);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Item 'invalid_item' not found");
      });
    });
  });

  describe("Utility Functions", () => {
    describe("getInventoryInfo", () => {
      it("should return correct inventory information", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        ItemSystem.addItemToInventory(inventory, "ball", 2);
        
        const info = ItemSystem.getInventoryInfo(inventory);
        expect(info.usedSlots).toBe(3); // 1 apple stack + 2 ball slots
        expect(info.maxSlots).toBe(10);
        expect(info.emptySlots).toBe(7);
        expect(info.isFull).toBe(false);
      });

      it("should detect full inventory", () => {
        const inventory = createTestInventory();
        
        // Fill with non-stackable items
        for (let i = 0; i < 10; i++) {
          ItemSystem.addItemToInventory(inventory, "ball", 1);
        }
        
        const info = ItemSystem.getInventoryInfo(inventory);
        expect(info.isFull).toBe(true);
        expect(info.emptySlots).toBe(0);
      });
    });

    describe("getItemsByType", () => {
      it("should return items of specified type", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        ItemSystem.addItemToInventory(inventory, "basic_medicine", 2);
        ItemSystem.addItemToInventory(inventory, "water_bottle", 3);
        
        const consumables = ItemSystem.getItemsByType(inventory, "consumable");
        expect(consumables).toHaveLength(2); // apple and water_bottle
        
        const medicine = ItemSystem.getItemsByType(inventory, "medicine");
        expect(medicine).toHaveLength(1); // basic_medicine
      });
    });

    describe("getItemsNeedingRepair", () => {
      it("should return items with low durability", () => {
        const inventory = createTestInventory();
        const addResult = ItemSystem.addItemToInventory(inventory, "ball", 2);
        
        // Set one ball to low durability
        const ballSlot = addResult.data!.slots[0];
        (ballSlot.item as DurabilityItem).currentDurability = 5; // Below threshold
        
        const needsRepair = ItemSystem.getItemsNeedingRepair(addResult.data!);
        expect(needsRepair).toHaveLength(1);
        expect(needsRepair[0].item.id).toBe("ball");
      });

      it("should not return consumable items", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 5);
        
        const needsRepair = ItemSystem.getItemsNeedingRepair(inventory);
        expect(needsRepair).toHaveLength(0);
      });
    });

    describe("repairItem", () => {
      it("should successfully repair durability item", () => {
        const inventory = createTestInventory();
        inventory.gold = 100;
        const addResult = ItemSystem.addItemToInventory(inventory, "ball", 1);
        
        // Damage the ball
        const ballSlot = addResult.data!.slots[0];
        (ballSlot.item as DurabilityItem).currentDurability = 10;
        
        const result = ItemSystem.repairItem(addResult.data!, "ball", 5);
        expect(result.success).toBe(true);
        expect(result.data!.gold).toBe(90); // 100 - (5 * 2)
        
        const repairedBall = result.data!.slots[0];
        expect((repairedBall.item as DurabilityItem).currentDurability).toBe(15);
      });

      it("should fail to repair when not enough gold", () => {
        const inventory = createTestInventory();
        inventory.gold = 5;
        ItemSystem.addItemToInventory(inventory, "ball", 1);
        
        const result = ItemSystem.repairItem(inventory, "ball", 10);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Not enough gold for repair. Need 20, have 5");
      });

      it("should fail to repair consumable items", () => {
        const inventory = createTestInventory();
        ItemSystem.addItemToInventory(inventory, "apple", 1);
        
        const result = ItemSystem.repairItem(inventory, "apple", 5);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Cannot repair consumable items");
      });

      it("should not exceed max durability when repairing", () => {
        const inventory = createTestInventory();
        inventory.gold = 100;
        const addResult = ItemSystem.addItemToInventory(inventory, "ball", 1);
        
        const ballSlot = addResult.data!.slots[0];
        (ballSlot.item as DurabilityItem).currentDurability = 18;
        
        const result = ItemSystem.repairItem(addResult.data!, "ball", 10);
        expect(result.success).toBe(true);
        
        const repairedBall = result.data!.slots[0];
        expect((repairedBall.item as DurabilityItem).currentDurability).toBe(20); // capped at max
      });
    });
  });
});