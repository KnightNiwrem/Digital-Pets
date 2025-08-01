// Test suite for InventoryViewModelService

import { describe, it, expect, beforeEach } from "bun:test";
import { InventoryViewModelService } from "@/services/InventoryViewModelService";
import type { Inventory, InventorySlot, Item } from "@/types/Item";

// Mock data
const createMockItem = (id: string, type: "consumable" | "toy" = "consumable"): Item => {
  if (type === "consumable") {
    return {
      id,
      name: `Test Item ${id}`,
      description: "Test item",
      type: "consumable",
      rarity: "common",
      icon: "test",
      effects: [{ type: "satiety", value: 10 }],
      value: 10,
      stackable: true,
    };
  } else {
    return {
      id,
      name: `Test Item ${id}`,
      description: "Test item",
      type: "toy",
      rarity: "common",
      icon: "test",
      effects: [{ type: "happiness", value: 5 }],
      value: 10,
      stackable: false,
      maxDurability: 100,
      currentDurability: 100,
      durabilityLossPerUse: 1,
    };
  }
};

const createMockInventory = (): Inventory => {
  const slots: InventorySlot[] = [
    { item: createMockItem("food1", "consumable"), quantity: 3, slotIndex: 0 },
    { item: createMockItem("food2", "consumable"), quantity: 1, slotIndex: 2 },
    { item: createMockItem("toy1", "toy"), quantity: 1, slotIndex: 4 },
    { item: createMockItem("food3", "consumable"), quantity: 2, slotIndex: 7 },
    { item: createMockItem("toy2", "toy"), quantity: 1, slotIndex: 9 },
  ];

  return {
    slots,
    maxSlots: 20,
    gold: 100,
  };
};

describe("InventoryViewModelService", () => {
  let inventory: Inventory;

  beforeEach(() => {
    inventory = createMockInventory();
    InventoryViewModelService.clearCache();
  });

  describe("createViewModel", () => {
    it("should create view model with all items when category is 'all'", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      expect(viewModel.activeCategory).toBe("all");
      expect(viewModel.totalItems).toBe(5);
      expect(viewModel.displaySlots).toHaveLength(16); // Minimum display slots
      expect(viewModel.displaySlots.filter(slot => slot !== null)).toHaveLength(5);
    });

    it("should create contiguous display array without gaps", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      // First 5 slots should contain items, contiguously
      for (let i = 0; i < 5; i++) {
        expect(viewModel.displaySlots[i]).not.toBeNull();
      }

      // Remaining slots should be null
      for (let i = 5; i < viewModel.displaySlots.length; i++) {
        expect(viewModel.displaySlots[i]).toBeNull();
      }
    });

    it("should maintain bidirectional index mapping", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      // Test forward and reverse mapping consistency
      viewModel.displayToOriginalIndex.forEach((originalIndex, displayIndex) => {
        const reverseMapped = viewModel.originalToDisplayIndex.get(originalIndex);
        expect(reverseMapped).toBe(displayIndex);
      });

      // Test that all non-null display slots have valid mappings
      viewModel.displaySlots.forEach((slot, displayIndex) => {
        if (slot) {
          const originalIndex = viewModel.displayToOriginalIndex.get(displayIndex);
          expect(originalIndex).toBe(slot.slotIndex);
        }
      });
    });

    it("should filter items by category correctly", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "food");

      // Should only show food items (consumables with satiety effect)
      expect(viewModel.totalItems).toBe(3); // food1, food2, food3
      expect(viewModel.displaySlots.filter(slot => slot !== null)).toHaveLength(3);

      // All non-null slots should be food items
      viewModel.displaySlots.forEach(slot => {
        if (slot) {
          expect(slot.item.effects.some(effect => effect.type === "satiety")).toBe(true);
        }
      });
    });

    it("should use cache for repeated requests", () => {
      const viewModel1 = InventoryViewModelService.createViewModel(inventory, "all");
      const viewModel2 = InventoryViewModelService.createViewModel(inventory, "all");

      // Should return the same cached instance
      expect(viewModel1).toBe(viewModel2);
    });

    it("should calculate appropriate display grid size", () => {
      const smallInventory: Inventory = {
        slots: [
          { item: createMockItem("item1"), quantity: 1, slotIndex: 0 },
          { item: createMockItem("item2"), quantity: 1, slotIndex: 1 },
        ],
        maxSlots: 10,
        gold: 100,
      };

      const viewModel = InventoryViewModelService.createViewModel(smallInventory, "all");

      // Should show minimum 16 slots (2 rows of 8)
      expect(viewModel.totalDisplaySlots).toBe(16);
      expect(viewModel.displaySlots).toHaveLength(16);
    });
  });

  describe("getOriginalIndex", () => {
    it("should return correct original index for display index", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      // Test that we can get original indices
      const originalIndex = InventoryViewModelService.getOriginalIndex(viewModel, 0);
      expect(originalIndex).not.toBeNull();
      expect(typeof originalIndex).toBe("number");
    });

    it("should return null for invalid display index", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      const originalIndex = InventoryViewModelService.getOriginalIndex(viewModel, 999);
      expect(originalIndex).toBeNull();
    });
  });

  describe("getDisplayIndex", () => {
    it("should return correct display index for original index", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      // Test that we can get display indices for original indices
      const displayIndex = InventoryViewModelService.getDisplayIndex(viewModel, 0);
      expect(displayIndex).not.toBeNull();
      expect(typeof displayIndex).toBe("number");
    });

    it("should return null for non-existent original index", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      const displayIndex = InventoryViewModelService.getDisplayIndex(viewModel, 999);
      expect(displayIndex).toBeNull();
    });
  });

  describe("validateSelectedItem", () => {
    it("should return selected item if visible in current filter", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");
      const selectedItem = inventory.slots[0]; // First item

      const validated = InventoryViewModelService.validateSelectedItem(selectedItem, viewModel);
      expect(validated).toBe(selectedItem);
    });

    it("should return null if selected item not visible in current filter", () => {
      const foodViewModel = InventoryViewModelService.createViewModel(inventory, "food");
      const toyItem = inventory.slots.find(slot => slot.item.type === "toy")!;

      const validated = InventoryViewModelService.validateSelectedItem(toyItem, foodViewModel);
      expect(validated).toBeNull();
    });

    it("should return null for null selected item", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "all");

      const validated = InventoryViewModelService.validateSelectedItem(null, viewModel);
      expect(validated).toBeNull();
    });
  });

  describe("cache management", () => {
    it("should clear cache correctly", () => {
      InventoryViewModelService.createViewModel(inventory, "all");
      expect(InventoryViewModelService.getCacheStats().size).toBe(1);

      InventoryViewModelService.clearCache();
      expect(InventoryViewModelService.getCacheStats().size).toBe(0);
    });

    it("should limit cache size", () => {
      // Create more view models than the cache limit
      for (let i = 0; i < 15; i++) {
        const testInventory = { ...inventory, gold: i }; // Change inventory to force new cache entry
        InventoryViewModelService.createViewModel(testInventory, "all");
      }

      const stats = InventoryViewModelService.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
    });
  });

  describe("edge cases", () => {
    it("should handle empty inventory", () => {
      const emptyInventory: Inventory = {
        slots: [],
        maxSlots: 10,
        gold: 0,
      };

      const viewModel = InventoryViewModelService.createViewModel(emptyInventory, "all");

      expect(viewModel.totalItems).toBe(0);
      expect(viewModel.displaySlots.every(slot => slot === null)).toBe(true);
      expect(viewModel.totalDisplaySlots).toBe(16); // Minimum display slots
    });

    it("should handle category with no items", () => {
      const viewModel = InventoryViewModelService.createViewModel(inventory, "nonexistent");

      expect(viewModel.totalItems).toBe(0);
      expect(viewModel.displaySlots.every(slot => slot === null)).toBe(true);
    });
  });
});
