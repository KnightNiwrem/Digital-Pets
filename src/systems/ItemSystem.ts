// Item system for managing inventory and item usage

import type { Item, Inventory, InventorySlot, ItemUsage, DurabilityItem } from "@/types/Item";
import type { Pet } from "@/types/Pet";
import type { Result } from "@/types";
import { PetValidator, GameMath, StatUpdateUtils } from "@/lib/utils";
import { ITEM_CONSTANTS } from "@/types/Item";
import { PET_CONSTANTS } from "@/types/Pet";
import { getItemById } from "@/data/items";

export class ItemSystem {
  // ============= INVENTORY MANAGEMENT =============

  /**
   * Create a new empty inventory
   */
  static createInventory(maxSlots: number = ITEM_CONSTANTS.MAX_INVENTORY_SLOTS, startingGold: number = 100): Inventory {
    return {
      slots: [],
      maxSlots,
      gold: startingGold,
    };
  }

  /**
   * Add an item to the inventory
   */
  static addItem(inventory: Inventory, item: Item, quantity: number = 1): Result<Inventory> {
    if (quantity <= 0) {
      return { success: false, error: "Quantity must be positive" };
    }

    if (!item.stackable && quantity > 1) {
      return { success: false, error: "Cannot add multiple non-stackable items at once" };
    }

    // For stackable items, try to find an existing slot
    if (item.stackable) {
      const existingSlot = inventory.slots.find(slot => slot.item.id === item.id);
      if (existingSlot) {
        const newQuantity = existingSlot.quantity + quantity;
        if (newQuantity > ITEM_CONSTANTS.MAX_STACK_SIZE) {
          return { success: false, error: `Stack size limit exceeded (max ${ITEM_CONSTANTS.MAX_STACK_SIZE})` };
        }

        const updatedInventory = {
          ...inventory,
          slots: inventory.slots.map(slot =>
            slot.slotIndex === existingSlot.slotIndex ? { ...slot, quantity: newQuantity } : slot
          ),
        };

        return {
          success: true,
          data: updatedInventory,
          message: `Added ${quantity}x ${item.name} to existing stack`,
        };
      }
    }

    // Find next available slot
    const occupiedSlots = new Set(inventory.slots.map(slot => slot.slotIndex));
    let nextSlotIndex = 0;
    while (occupiedSlots.has(nextSlotIndex) && nextSlotIndex < inventory.maxSlots) {
      nextSlotIndex++;
    }

    if (nextSlotIndex >= inventory.maxSlots) {
      return { success: false, error: "Inventory is full" };
    }

    const newSlot: InventorySlot = {
      item: { ...item },
      quantity: quantity,
      slotIndex: nextSlotIndex,
    };

    const updatedInventory = {
      ...inventory,
      slots: [...inventory.slots, newSlot],
    };

    return {
      success: true,
      data: updatedInventory,
      message: `Added ${quantity}x ${item.name} to inventory`,
    };
  }

  /**
   * Remove an item from the inventory
   */
  static removeItem(inventory: Inventory, itemId: string, quantity: number = 1): Result<Inventory> {
    if (quantity <= 0) {
      return { success: false, error: "Quantity must be positive" };
    }

    const slotIndex = inventory.slots.findIndex(slot => slot.item.id === itemId);
    if (slotIndex === -1) {
      return { success: false, error: "Item not found in inventory" };
    }

    const slot = inventory.slots[slotIndex];
    if (slot.quantity < quantity) {
      return { success: false, error: "Not enough items in inventory" };
    }

    let updatedSlots: InventorySlot[];
    if (slot.quantity === quantity) {
      // Remove the entire slot
      updatedSlots = inventory.slots.filter((_, index) => index !== slotIndex);
    } else {
      // Reduce the quantity
      updatedSlots = inventory.slots.map((slot, index) =>
        index === slotIndex ? { ...slot, quantity: slot.quantity - quantity } : slot
      );
    }

    const updatedInventory = {
      ...inventory,
      slots: updatedSlots,
    };

    return {
      success: true,
      data: updatedInventory,
      message: `Removed ${quantity}x ${slot.item.name} from inventory`,
    };
  }

  /**
   * Get an item from inventory by ID
   */
  static getInventoryItem(inventory: Inventory, itemId: string): InventorySlot | null {
    return inventory.slots.find(slot => slot.item.id === itemId) || null;
  }

  /**
   * Check if inventory has enough of an item
   */
  static hasItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
    const slot = this.getInventoryItem(inventory, itemId);
    return slot ? slot.quantity >= quantity : false;
  }

  /**
   * Get available inventory space
   */
  static getAvailableSlots(inventory: Inventory): number {
    return inventory.maxSlots - inventory.slots.length;
  }

  /**
   * Get total inventory value (sum of all items)
   */
  static getInventoryValue(inventory: Inventory): number {
    return inventory.slots.reduce((total, slot) => {
      return total + slot.item.value * slot.quantity;
    }, 0);
  }

  // ============= ITEM USAGE =============

  /**
   * Use an item from inventory on a pet
   */
  static useItem(
    inventory: Inventory,
    pet: Pet,
    itemId: string
  ): Result<{ inventory: Inventory; pet: Pet; usage: ItemUsage }> {
    // Check if item exists in inventory
    const slot = this.getInventoryItem(inventory, itemId);
    if (!slot) {
      return { success: false, error: "Item not found in inventory" };
    }

    const item = slot.item;

    // Validate item usage conditions
    const validationResult = this.validateItemUsage(pet, item);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error,
      };
    }

    // Process item effects
    const effectResult = this.applyItemEffects(pet, item);
    if (!effectResult.success) {
      return {
        success: false,
        error: effectResult.error,
      };
    }

    const updatedPet = effectResult.data!;

    // Handle item consumption/durability
    let updatedInventory = inventory;
    if (item.stackable) {
      // Consumable item - remove one from inventory
      const removeResult = this.removeItem(inventory, itemId, 1);
      if (!removeResult.success) {
        return {
          success: false,
          error: removeResult.error,
        };
      }
      updatedInventory = removeResult.data!;
    } else {
      // Durability item - reduce durability
      const durabilityItem = item as DurabilityItem;
      const newDurability = durabilityItem.currentDurability - durabilityItem.durabilityLossPerUse;

      if (newDurability <= 0) {
        // Item is broken, remove from inventory
        const removeResult = this.removeItem(inventory, itemId, 1);
        if (!removeResult.success) {
          return {
            success: false,
            error: removeResult.error,
          };
        }
        updatedInventory = removeResult.data!;
      } else {
        // Update durability
        updatedInventory = {
          ...inventory,
          slots: inventory.slots.map(slot =>
            slot.item.id === itemId
              ? {
                  ...slot,
                  item: { ...slot.item, currentDurability: newDurability } as DurabilityItem,
                }
              : slot
          ),
        };
      }
    }

    const usage: ItemUsage = {
      itemId,
      petId: pet.id,
      timestamp: Date.now(),
      effects: item.effects,
      success: true,
      message: effectResult.message,
    };

    return {
      success: true,
      data: {
        inventory: updatedInventory,
        pet: updatedPet,
        usage,
      },
      message: effectResult.message,
    };
  }

  /**
   * Validate if an item can be used on a pet
   */
  static validateItemUsage(pet: Pet, item: Item): Result<void> {
    // Dead pets can't use items
    if (PetValidator.isDead(pet)) {
      return { success: false, error: "Cannot use items on a deceased pet" };
    }

    // Check item type specific conditions
    switch (item.type) {
      case "medicine":
        if (PetValidator.isHealthy(pet)) {
          return { success: false, error: "Pet doesn't need medicine - already healthy" };
        }
        break;

      case "hygiene":
        if (pet.poopCount === 0) {
          return { success: false, error: "Pet doesn't need cleaning - no poop to clean" };
        }
        // Add state validation for cleaning - consistent with UI logic
        if (PetValidator.isSleeping(pet)) {
          return { success: false, error: "Cannot clean pet while sleeping" };
        }
        if (PetValidator.isExploring(pet)) {
          return { success: false, error: "Cannot clean pet while exploring" };
        }
        if (PetValidator.isTravelling(pet)) {
          return { success: false, error: "Cannot clean pet while travelling" };
        }
        break;

      case "toy":
        if (pet.happiness >= 100) {
          return { success: false, error: "Pet is already very happy" };
        }
        // Add state validation for toys - consistent with play validation
        if (PetValidator.isSleeping(pet)) {
          return { success: false, error: "Pet cannot play while sleeping" };
        }
        if (PetValidator.isExploring(pet)) {
          return { success: false, error: "Pet cannot play while exploring" };
        }
        if (!PetValidator.hasEnoughEnergy(pet, 10)) {
          return { success: false, error: "Pet has insufficient energy to play" };
        }
        break;

      case "energy_booster":
        if (PetValidator.hasFullEnergy(pet)) {
          return { success: false, error: "Pet already has full energy" };
        }
        break;

      case "consumable": {
        // Food items
        const hasFood = item.effects.some(effect => effect.type === "satiety");
        const hasDrink = item.effects.some(effect => effect.type === "hydration");

        if (hasFood && pet.satiety >= 100) {
          return { success: false, error: "Pet is not hungry" };
        }
        if (hasDrink && pet.hydration >= 100) {
          return { success: false, error: "Pet is not thirsty" };
        }
        break;
      }
    }

    // Durability check for non-stackable items
    if (!item.stackable) {
      const durabilityItem = item as DurabilityItem;
      if (durabilityItem.currentDurability <= 0) {
        return { success: false, error: "Item is broken and cannot be used" };
      }
    }

    return { success: true };
  }

  /**
   * Apply item effects to a pet
   */
  static applyItemEffects(pet: Pet, item: Item): Result<Pet> {
    let updatedPet = { ...pet };
    const messages: string[] = [];

    for (const effect of item.effects) {
      switch (effect.type) {
        case "satiety": {
          const updateResult = StatUpdateUtils.updateStat(
            updatedPet,
            "satiety",
            effect.value,
            PET_CONSTANTS.STAT_MULTIPLIER.SATIETY,
            15000
          );
          if (updateResult.actualIncrease > 0) {
            updatedPet = updateResult.updatedPet;
            messages.push(`Restored ${updateResult.actualIncrease} satiety`);
          }
          break;
        }

        case "hydration": {
          const updateResult = StatUpdateUtils.updateStat(
            updatedPet,
            "hydration",
            effect.value,
            PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION,
            12000
          );
          if (updateResult.actualIncrease > 0) {
            updatedPet = updateResult.updatedPet;
            messages.push(`Restored ${updateResult.actualIncrease} hydration`);
          }
          break;
        }

        case "happiness": {
          const updateResult = StatUpdateUtils.updateStat(
            updatedPet,
            "happiness",
            effect.value,
            PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS,
            18000
          );
          if (updateResult.actualIncrease > 0) {
            updatedPet = updateResult.updatedPet;
            // Using toy costs energy
            if (item.type === "toy") {
              updatedPet.currentEnergy = GameMath.subtractEnergy(updatedPet.currentEnergy, 10);
            }
            messages.push(`Increased happiness by ${updateResult.actualIncrease}`);
          }
          break;
        }

        case "energy":
          updatedPet.currentEnergy = GameMath.addToStat(updatedPet.currentEnergy, effect.value, updatedPet.maxEnergy);
          messages.push(`Restored ${effect.value} energy`);
          break;

        case "health":
          if (PetValidator.isInjured(updatedPet)) {
            updatedPet.health = "healthy";
            messages.push("Healed injuries");
          }
          break;

        case "cure":
          if (PetValidator.isSick(updatedPet)) {
            updatedPet.health = "healthy";
            messages.push("Cured illness");
          }
          break;

        case "clean":
          updatedPet.poopCount = 0; // Clear all uncleaned poop
          updatedPet.poopTicksLeft = Math.floor(Math.random() * 240) + 240; // Reset poop timer (1-2 hours)
          updatedPet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS; // Reset poop sickness timer
          messages.push("Cleaned pet");
          break;
      }
    }

    // Update last care time for consumable items
    if (item.stackable) {
      updatedPet.lastCareTime = Date.now();
    }

    return {
      success: true,
      data: updatedPet,
      message: messages.join(", "),
    };
  }

  // ============= SHOP AND TRADE SYSTEM =============

  /**
   * Buy an item from a shop
   */
  static buyItem(
    inventory: Inventory,
    itemId: string,
    quantity: number = 1,
    priceMultiplier: number = 1
  ): Result<Inventory> {
    const itemTemplate = getItemById(itemId);
    if (!itemTemplate) {
      return { success: false, error: "Item not found" };
    }

    const totalCost = Math.floor(itemTemplate.value * priceMultiplier * quantity);
    if (inventory.gold < totalCost) {
      return { success: false, error: "Not enough gold" };
    }

    // Create item instance (important for durability items)
    let item: Item;
    if (itemTemplate.stackable) {
      item = { ...itemTemplate };
    } else {
      item = {
        ...itemTemplate,
        currentDurability: (itemTemplate as DurabilityItem).maxDurability,
      } as DurabilityItem;
    }

    const addResult = this.addItem(inventory, item, quantity);
    if (!addResult.success) {
      return addResult;
    }

    const updatedInventory = {
      ...addResult.data!,
      gold: inventory.gold - totalCost,
    };

    return {
      success: true,
      data: updatedInventory,
      message: `Bought ${quantity}x ${item.name} for ${totalCost} gold`,
    };
  }

  /**
   * Sell an item to a shop
   */
  static sellItem(
    inventory: Inventory,
    itemId: string,
    quantity: number = 1,
    priceMultiplier: number = 0.5
  ): Result<Inventory> {
    const slot = this.getInventoryItem(inventory, itemId);
    if (!slot) {
      return { success: false, error: "Item not found in inventory" };
    }

    if (slot.quantity < quantity) {
      return { success: false, error: "Not enough items to sell" };
    }

    // Calculate sell price (reduced for damaged durability items)
    let sellPrice = slot.item.value * priceMultiplier;
    if (!slot.item.stackable) {
      const durabilityItem = slot.item as DurabilityItem;
      const durabilityRatio = durabilityItem.currentDurability / durabilityItem.maxDurability;
      sellPrice *= durabilityRatio;
    }

    const totalValue = Math.floor(sellPrice * quantity);

    const removeResult = this.removeItem(inventory, itemId, quantity);
    if (!removeResult.success) {
      return removeResult;
    }

    const updatedInventory = {
      ...removeResult.data!,
      gold: inventory.gold + totalValue,
    };

    return {
      success: true,
      data: updatedInventory,
      message: `Sold ${quantity}x ${slot.item.name} for ${totalValue} gold`,
    };
  }

  // ============= UTILITY FUNCTIONS =============

  /**
   * Get items that are low on durability
   */
  static getLowDurabilityItems(inventory: Inventory): DurabilityItem[] {
    return inventory.slots
      .map(slot => slot.item)
      .filter((item): item is DurabilityItem => !item.stackable)
      .filter(item => item.currentDurability <= ITEM_CONSTANTS.DURABILITY_WARNING_THRESHOLD);
  }

  /**
   * Get items by category for UI organization
   */
  static getItemsByCategory(inventory: Inventory): Record<string, InventorySlot[]> {
    const categories: Record<string, InventorySlot[]> = {
      food: [],
      drinks: [],
      medicine: [],
      toys: [],
      equipment: [],
      other: [],
    };

    for (const slot of inventory.slots) {
      const item = slot.item;
      if (item.effects.some(effect => effect.type === "satiety")) {
        categories.food.push(slot);
      } else if (item.effects.some(effect => effect.type === "hydration")) {
        categories.drinks.push(slot);
      } else if (item.type === "medicine" || item.type === "hygiene") {
        categories.medicine.push(slot);
      } else if (item.type === "toy") {
        categories.toys.push(slot);
      } else if (item.type === "equipment") {
        categories.equipment.push(slot);
      } else {
        categories.other.push(slot);
      }
    }

    return categories;
  }

  /**
   * Sort inventory slots by various criteria
   */
  static sortInventory(inventory: Inventory, sortBy: "name" | "value" | "rarity" | "type" | "quantity"): Inventory {
    const sortedSlots = [...inventory.slots].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.item.name.localeCompare(b.item.name);
        case "value":
          return b.item.value - a.item.value;
        case "rarity": {
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
          return rarityOrder[b.item.rarity] - rarityOrder[a.item.rarity];
        }
        case "type":
          return a.item.type.localeCompare(b.item.type);
        case "quantity":
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return {
      ...inventory,
      slots: sortedSlots,
    };
  }
}
