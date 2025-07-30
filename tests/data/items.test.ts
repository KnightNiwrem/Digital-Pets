// Tests for item data expansion
import { describe, it, expect } from "bun:test";
import { 
  ITEMS, 
  getItemById, 
  getItemsByType, 
  getItemsByRarity,
  createItemInstance 
} from "@/data/items";
import type { ItemType, ItemRarity, DurabilityItem } from "@/types/Item";

describe("Item Data Expansion", () => {
  describe("Total Item Count", () => {
    it("should have significantly more items than the original 12", () => {
      expect(ITEMS.length).toBeGreaterThan(30);
      expect(ITEMS.length).toBeLessThanOrEqual(50); // reasonable upper bound
    });

    it("should have variety across all item types", () => {
      const types: ItemType[] = ["consumable", "toy", "medicine", "hygiene", "equipment", "special"];
      types.forEach(type => {
        const itemsOfType = getItemsByType(type);
        expect(itemsOfType.length).toBeGreaterThan(0);
      });
    });

    it("should have items across all rarity tiers", () => {
      const rarities: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
      rarities.forEach(rarity => {
        const itemsOfRarity = getItemsByRarity(rarity);
        expect(itemsOfRarity.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Item Categories", () => {
    it("should have expanded food items", () => {
      const foodItems = ITEMS.filter(item => 
        item.type === "consumable" && 
        item.effects.some(effect => effect.type === "satiety")
      );
      expect(foodItems.length).toBeGreaterThanOrEqual(8); // at least 8 food items
    });

    it("should have expanded drink items", () => {
      const drinkItems = ITEMS.filter(item => 
        item.type === "consumable" && 
        item.effects.some(effect => effect.type === "hydration")
      );
      expect(drinkItems.length).toBeGreaterThanOrEqual(4); // at least 4 drink items
    });

    it("should have expanded medicine items", () => {
      const medicineItems = getItemsByType("medicine");
      expect(medicineItems.length).toBeGreaterThanOrEqual(5); // at least 5 medicine items
    });

    it("should have expanded toy items", () => {
      const toyItems = getItemsByType("toy");
      expect(toyItems.length).toBeGreaterThanOrEqual(5); // at least 5 toy items
    });

    it("should have new equipment items", () => {
      const equipmentItems = getItemsByType("equipment");
      expect(equipmentItems.length).toBeGreaterThanOrEqual(3); // at least 3 equipment items
    });

    it("should have special items", () => {
      const specialItems = getItemsByType("special");
      expect(specialItems.length).toBeGreaterThanOrEqual(3); // at least 3 special items
    });
  });

  describe("Item Quality and Balance", () => {
    it("should have unique IDs for all items", () => {
      const ids = ITEMS.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ITEMS.length);
    });

    it("should have valid properties for all items", () => {
      ITEMS.forEach(item => {
        expect(typeof item.id).toBe("string");
        expect(item.id.length).toBeGreaterThan(0);
        expect(typeof item.name).toBe("string");
        expect(item.name.length).toBeGreaterThan(0);
        expect(typeof item.description).toBe("string");
        expect(item.description.length).toBeGreaterThan(0);
        expect(typeof item.value).toBe("number");
        expect(item.value).toBeGreaterThan(0);
      });
    });

    it("should have appropriate value scaling by rarity", () => {
      const commonItems = getItemsByRarity("common");
      const legendaryItems = getItemsByRarity("legendary");

      const avgCommonValue = commonItems.reduce((sum, item) => sum + item.value, 0) / commonItems.length;
      const avgLegendaryValue = legendaryItems.reduce((sum, item) => sum + item.value, 0) / legendaryItems.length;

      expect(avgLegendaryValue).toBeGreaterThan(avgCommonValue);
    });

    it("should have balanced effect values", () => {
      ITEMS.forEach(item => {
        item.effects.forEach(effect => {
          // Effect values should be reasonable (not too high or negative, except for energy costs)
          if (effect.type !== "energy" || effect.value >= 0) {
            expect(effect.value).toBeGreaterThan(0);
          }
          expect(Math.abs(effect.value)).toBeLessThanOrEqual(200); // reasonable upper bound
        });
      });
    });
  });

  describe("Item Functionality", () => {
    it("should find items by valid ID", () => {
      const testIds = ["honey", "protein_shake", "crystal_fragment", "training_collar"];
      testIds.forEach(id => {
        const item = getItemById(id);
        expect(item).toBeDefined();
        expect(item?.id).toBe(id);
      });
    });

    it("should return undefined for invalid ID", () => {
      const item = getItemById("nonexistent_item");
      expect(item).toBeUndefined();
    });

    it("should create proper item instances", () => {
      // Test consumable item instance
      const honeyInstance = createItemInstance("honey");
      expect(honeyInstance).toBeDefined();
      expect(honeyInstance?.id).toBe("honey");

      // Test durability item instance
      const toyInstance = createItemInstance("feather_toy");
      expect(toyInstance).toBeDefined();
      expect(toyInstance?.id).toBe("feather_toy");
      if (toyInstance && !toyInstance.stackable) {
        expect(toyInstance.currentDurability).toBe(toyInstance.maxDurability);
      }
    });

    it("should filter items correctly by type", () => {
      const medicineItems = getItemsByType("medicine");
      medicineItems.forEach(item => {
        expect(item.type).toBe("medicine");
      });

      const toyItems = getItemsByType("toy");
      toyItems.forEach(item => {
        expect(item.type).toBe("toy");
        expect(item.stackable).toBe(false);
      });
    });

    it("should filter items correctly by rarity", () => {
      const rareItems = getItemsByRarity("rare");
      rareItems.forEach(item => {
        expect(item.rarity).toBe("rare");
      });

      const epicItems = getItemsByRarity("epic");
      epicItems.forEach(item => {
        expect(item.rarity).toBe("epic");
      });
    });
  });

  describe("New Item Features", () => {
    it("should have items with multiple effects", () => {
      const multiEffectItems = ITEMS.filter(item => item.effects.length > 1);
      expect(multiEffectItems.length).toBeGreaterThan(5); // at least 5 items with multiple effects
    });

    it("should have items with new effect types", () => {
      const newEffectTypes = ["fishing_bonus", "training_bonus", "luck_bonus", "exploration_bonus", "growth_bonus"];
      
      newEffectTypes.forEach(effectType => {
        const itemsWithEffect = ITEMS.filter(item => 
          item.effects.some(effect => effect.type === effectType)
        );
        expect(itemsWithEffect.length).toBeGreaterThan(0);
      });
    });

    it("should have items with various durability ranges", () => {
      const durabilityItems = ITEMS.filter(item => !item.stackable);
      
      const durabilityValues = durabilityItems.map(item => item.maxDurability);
      const minDurability = Math.min(...durabilityValues);
      const maxDurability = Math.max(...durabilityValues);

      expect(minDurability).toBeGreaterThan(0);
      expect(maxDurability).toBeGreaterThan(minDurability);
      expect(maxDurability).toBeLessThanOrEqual(50); // reasonable upper bound
    });

    it("should have appropriate value progression within categories", () => {
      // Test that rare items within same category are more expensive than common ones
      const foodItems = ITEMS.filter(item => 
        item.type === "consumable" && 
        item.effects.some(effect => effect.type === "satiety")
      );

      const commonFood = foodItems.filter(item => item.rarity === "common");
      const rareFood = foodItems.filter(item => item.rarity === "rare");

      if (commonFood.length > 0 && rareFood.length > 0) {
        const avgCommonFoodValue = commonFood.reduce((sum, item) => sum + item.value, 0) / commonFood.length;
        const avgRareFoodValue = rareFood.reduce((sum, item) => sum + item.value, 0) / rareFood.length;
        
        expect(avgRareFoodValue).toBeGreaterThan(avgCommonFoodValue);
      }
    });
  });

  describe("Item Balance Validation", () => {
    it("should have reasonable stat restoration values", () => {
      // Check that basic stat restoration items aren't overpowered
      const statRestorationItems = ITEMS.filter(item =>
        item.effects.some(effect => 
          ["satiety", "hydration", "happiness"].includes(effect.type) && effect.value > 50
        )
      );

      // Only rare+ items should have very high restoration values
      statRestorationItems.forEach(item => {
        expect(["rare", "epic", "legendary"]).toContain(item.rarity);
      });
    });

    it("should have energy costs for some activities", () => {
      const energyCostItems = ITEMS.filter(item =>
        item.effects.some(effect => effect.type === "energy" && effect.value < 0)
      );
      
      expect(energyCostItems.length).toBeGreaterThan(0); // some items should cost energy
    });

    it("should have proper equipment durability scaling", () => {
      const equipmentItems = getItemsByType("equipment");
      
      equipmentItems.forEach(item => {
        expect(item.stackable).toBe(false);
        if (!item.stackable) {
          const durabilityItem = item as DurabilityItem;
          expect(durabilityItem.maxDurability).toBeGreaterThan(10); // equipment should be durable
        }
        expect(item.value).toBeGreaterThan(30); // equipment should be valuable
      });
    });
  });
});