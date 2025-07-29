// Item System - Manages inventory, item usage, and shop interactions
// Follows the established pattern from PetSystem and WorldSystem

import type { Pet, HealthState } from "@/types/Pet";
import type {
  Item,
  Inventory,
  InventorySlot,
  ItemUsage,
  ItemEffect,
  ConsumableItem,
  DurabilityItem,
  ItemType,
} from "@/types/Item";
import { ITEM_CONSTANTS } from "@/types/Item";
import { createItemInstance, getItemById } from "@/data/items";

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ItemSystem {
  // ===============================
  // INVENTORY MANAGEMENT
  // ===============================

  /**
   * Creates a new empty inventory with default settings
   */
  static createInventory(maxSlots: number = ITEM_CONSTANTS.MAX_INVENTORY_SLOTS): Inventory {
    return {
      slots: [],
      maxSlots,
      gold: 100, // starting gold
    };
  }

  /**
   * Adds an item to the inventory
   */
  static addItemToInventory(inventory: Inventory, itemId: string, quantity: number = 1): Result<Inventory> {
    if (quantity <= 0) {
      return { success: false, error: "Quantity must be positive" };
    }

    const itemTemplate = getItemById(itemId);
    if (!itemTemplate) {
      return { success: false, error: `Item with id '${itemId}' not found` };
    }

    // Deep clone the inventory to avoid mutation
    const updatedInventory: Inventory = {
      ...inventory,
      slots: inventory.slots.map(slot => ({
        ...slot,
        item: { ...slot.item },
      })),
    };

    // For stackable items, try to add to existing stacks first
    if (itemTemplate.stackable) {
      let remainingQuantity = quantity;

      // Find existing slots with this item
      for (const slot of updatedInventory.slots) {
        if (slot.item.id === itemId && remainingQuantity > 0) {
          const maxCanAdd = ITEM_CONSTANTS.MAX_STACK_SIZE - slot.quantity;
          const addAmount = Math.min(remainingQuantity, maxCanAdd);
          
          slot.quantity += addAmount;
          remainingQuantity -= addAmount;
        }
      }

      // If we still have items to add, create new slots
      while (remainingQuantity > 0 && updatedInventory.slots.length < updatedInventory.maxSlots) {
        const stackSize = Math.min(remainingQuantity, ITEM_CONSTANTS.MAX_STACK_SIZE);
        const newItem = createItemInstance(itemId);
        
        if (!newItem) {
          return { success: false, error: "Failed to create item instance" };
        }

        updatedInventory.slots.push({
          item: newItem,
          quantity: stackSize,
          slotIndex: updatedInventory.slots.length,
        });

        remainingQuantity -= stackSize;
      }

      if (remainingQuantity > 0) {
        return { success: false, error: "Not enough inventory space" };
      }
    } else {
      // Non-stackable items need individual slots
      if (updatedInventory.slots.length + quantity > updatedInventory.maxSlots) {
        return { success: false, error: "Not enough inventory space for non-stackable items" };
      }

      for (let i = 0; i < quantity; i++) {
        const newItem = createItemInstance(itemId);
        if (!newItem) {
          return { success: false, error: "Failed to create item instance" };
        }

        updatedInventory.slots.push({
          item: newItem,
          quantity: 1,
          slotIndex: updatedInventory.slots.length,
        });
      }
    }

    // Reindex slots
    updatedInventory.slots.forEach((slot, index) => {
      slot.slotIndex = index;
    });

    return {
      success: true,
      data: updatedInventory,
      message: `Added ${quantity} ${itemTemplate.name}(s) to inventory`,
    };
  }

  /**
   * Removes an item from the inventory
   */
  static removeItemFromInventory(inventory: Inventory, itemId: string, quantity: number = 1): Result<Inventory> {
    if (quantity <= 0) {
      return { success: false, error: "Quantity must be positive" };
    }

    // Deep clone the inventory
    const updatedInventory: Inventory = {
      ...inventory,
      slots: inventory.slots.map(slot => ({
        ...slot,
        item: { ...slot.item },
      })),
    };

    let remainingToRemove = quantity;

    // Find slots with this item and remove from them
    for (let i = updatedInventory.slots.length - 1; i >= 0 && remainingToRemove > 0; i--) {
      const slot = updatedInventory.slots[i];
      
      if (slot.item.id === itemId) {
        const removeAmount = Math.min(remainingToRemove, slot.quantity);
        slot.quantity -= removeAmount;
        remainingToRemove -= removeAmount;

        // Remove empty slots
        if (slot.quantity <= 0) {
          updatedInventory.slots.splice(i, 1);
        }
      }
    }

    if (remainingToRemove > 0) {
      return { success: false, error: `Not enough ${itemId} in inventory` };
    }

    // Reindex slots
    updatedInventory.slots.forEach((slot, index) => {
      slot.slotIndex = index;
    });

    return {
      success: true,
      data: updatedInventory,
      message: `Removed ${quantity} ${itemId}(s) from inventory`,
    };
  }

  /**
   * Gets the total quantity of a specific item in inventory
   */
  static getItemQuantity(inventory: Inventory, itemId: string): number {
    return inventory.slots
      .filter(slot => slot.item.id === itemId)
      .reduce((total, slot) => total + slot.quantity, 0);
  }

  /**
   * Checks if inventory has enough of a specific item
   */
  static hasItem(inventory: Inventory, itemId: string, quantity: number = 1): boolean {
    return this.getItemQuantity(inventory, itemId) >= quantity;
  }

  // ===============================
  // ITEM USAGE
  // ===============================

  /**
   * Uses an item on a pet, applying its effects
   */
  static useItem(inventory: Inventory, pet: Pet, itemId: string): Result<{ inventory: Inventory; pet: Pet; usage: ItemUsage }> {
    // Check if item exists in inventory
    if (!this.hasItem(inventory, itemId, 1)) {
      return { success: false, error: `No ${itemId} in inventory` };
    }

    const itemTemplate = getItemById(itemId);
    if (!itemTemplate) {
      return { success: false, error: `Item '${itemId}' not found` };
    }

    // Get the actual item from inventory (important for durability items)
    const slot = inventory.slots.find(s => s.item.id === itemId);
    if (!slot) {
      return { success: false, error: "Item not found in inventory" };
    }

    const item = slot.item;

    // Validate usage conditions
    const validationResult = this.validateItemUsage(pet, item);
    if (!validationResult.success) {
      return validationResult;
    }

    // Apply item effects
    const updatedPet = { ...pet };
    let effectsApplied: ItemEffect[] = [];

    for (const effect of item.effects) {
      const applyResult = this.applyItemEffect(updatedPet, effect);
      if (applyResult.success) {
        effectsApplied.push(effect);
      }
    }

    // Handle item consumption/durability
    let updatedInventory = { ...inventory };
    
    if (item.stackable) {
      // Consumable items are removed after use
      const removeResult = this.removeItemFromInventory(updatedInventory, itemId, 1);
      if (!removeResult.success) {
        return { success: false, error: "Failed to consume item" };
      }
      updatedInventory = removeResult.data!;
    } else {
      // Durability items lose durability - need to update the actual item in the inventory
      const updatedSlot = updatedInventory.slots.find(s => s.item.id === itemId);
      if (updatedSlot) {
        const durabilityItem = updatedSlot.item as DurabilityItem;
        // Create a new item instance with reduced durability
        const newDurability = Math.max(0, durabilityItem.currentDurability - durabilityItem.durabilityLossPerUse);
        updatedSlot.item = {
          ...durabilityItem,
          currentDurability: newDurability,
        };
        
        // Remove broken items
        if (newDurability <= 0) {
          const removeResult = this.removeItemFromInventory(updatedInventory, itemId, 1);
          if (!removeResult.success) {
            return { success: false, error: "Failed to remove broken item" };
          }
          updatedInventory = removeResult.data!;
        }
      }
    }

    const usage: ItemUsage = {
      itemId,
      petId: pet.id,
      timestamp: Date.now(),
      effects: effectsApplied,
      success: true,
      message: `Used ${item.name} on ${pet.name}`,
    };

    return {
      success: true,
      data: { inventory: updatedInventory, pet: updatedPet, usage },
      message: `Successfully used ${item.name}`,
    };
  }

  /**
   * Validates if an item can be used on a pet
   */
  private static validateItemUsage(pet: Pet, item: Item): Result<boolean> {
    // Dead pets can't use items
    if (pet.life <= 0) {
      return { success: false, error: "Cannot use items on deceased pets" };
    }

    // Type-specific validations
    switch (item.type) {
      case "consumable":
        // Food items shouldn't be used when pet is sick (like in PetSystem)
        if (pet.health === "sick" && item.effects.some(e => e.type === "satiety")) {
          return { success: false, error: "Cannot feed sick pets" };
        }
        break;

      case "medicine":
        // Medicine only needed when injured or sick
        if (pet.health === "healthy") {
          return { success: false, error: "Pet doesn't need medicine" };
        }
        break;

      case "hygiene":
        // Hygiene items only needed when there's poop
        if (pet.poopCount <= 0) {
          return { success: false, error: "Pet doesn't need cleaning" };
        }
        break;

      case "toy":
        // Toys require energy
        if (pet.currentEnergy < 10) {
          return { success: false, error: "Pet needs more energy to play" };
        }
        break;

      case "energy_booster":
        // Energy boosters not needed when at max energy
        if (pet.currentEnergy >= pet.maxEnergy) {
          return { success: false, error: "Pet energy is already full" };
        }
        break;
    }

    return { success: true };
  }

  /**
   * Applies a single item effect to a pet
   */
  private static applyItemEffect(pet: Pet, effect: ItemEffect): Result<boolean> {
    switch (effect.type) {
      case "satiety":
        const newSatietyTicks = Math.min(100, pet.satietyTicksLeft + effect.value * 2); // Convert display value to ticks
        pet.satietyTicksLeft = newSatietyTicks;
        pet.lastCareTime = Date.now();
        break;

      case "hydration":
        const newHydrationTicks = Math.min(100, pet.hydrationTicksLeft + effect.value * 2);
        pet.hydrationTicksLeft = newHydrationTicks;
        pet.lastCareTime = Date.now();
        break;

      case "happiness":
        const newHappinessTicks = Math.min(100, pet.happinessTicksLeft + effect.value * 2);
        pet.happinessTicksLeft = newHappinessTicks;
        pet.lastCareTime = Date.now();
        break;

      case "energy":
        pet.currentEnergy = Math.min(pet.maxEnergy, pet.currentEnergy + effect.value);
        break;

      case "health":
        // Heal injuries
        if (pet.health === "injured") {
          pet.health = "healthy";
        }
        break;

      case "cure":
        // Cure sickness
        if (pet.health === "sick") {
          pet.health = "healthy";
        }
        break;

      case "clean":
        // Clean poop
        pet.poopCount = Math.max(0, pet.poopCount - effect.value);
        if (pet.poopCount === 0) {
          pet.sickByPoopTicksLeft = 17280; // Reset to clean state
        }
        break;

      default:
        return { success: false, error: `Unknown effect type: ${effect.type}` };
    }

    return { success: true };
  }

  // ===============================
  // SHOP INTERACTIONS
  // ===============================

  /**
   * Buys an item from a shop
   */
  static buyItem(inventory: Inventory, itemId: string, quantity: number = 1): Result<Inventory> {
    const item = getItemById(itemId);
    if (!item) {
      return { success: false, error: `Item '${itemId}' not found` };
    }

    const totalCost = item.value * quantity;
    if (inventory.gold < totalCost) {
      return { success: false, error: `Not enough gold. Need ${totalCost}, have ${inventory.gold}` };
    }

    // Add item to inventory
    const addResult = this.addItemToInventory(inventory, itemId, quantity);
    if (!addResult.success) {
      return addResult;
    }

    // Deduct gold
    const updatedInventory = addResult.data!;
    updatedInventory.gold -= totalCost;

    return {
      success: true,
      data: updatedInventory,
      message: `Bought ${quantity} ${item.name}(s) for ${totalCost} gold`,
    };
  }

  /**
   * Sells an item to a shop
   */
  static sellItem(inventory: Inventory, itemId: string, quantity: number = 1): Result<Inventory> {
    if (!this.hasItem(inventory, itemId, quantity)) {
      return { success: false, error: `Not enough ${itemId} to sell` };
    }

    const item = getItemById(itemId);
    if (!item) {
      return { success: false, error: `Item '${itemId}' not found` };
    }

    // Remove item from inventory
    const removeResult = this.removeItemFromInventory(inventory, itemId, quantity);
    if (!removeResult.success) {
      return removeResult;
    }

    // Add gold (sell for half price)
    const sellValue = Math.floor(item.value * 0.5);
    const totalValue = sellValue * quantity;
    const updatedInventory = removeResult.data!;
    updatedInventory.gold += totalValue;

    return {
      success: true,
      data: updatedInventory,
      message: `Sold ${quantity} ${item.name}(s) for ${totalValue} gold`,
    };
  }

  // ===============================
  // UTILITY FUNCTIONS
  // ===============================

  /**
   * Gets inventory space information
   */
  static getInventoryInfo(inventory: Inventory): {
    usedSlots: number;
    maxSlots: number;
    emptySlots: number;
    isFull: boolean;
  } {
    const usedSlots = inventory.slots.length;
    const maxSlots = inventory.maxSlots;
    const emptySlots = maxSlots - usedSlots;
    const isFull = usedSlots >= maxSlots;

    return { usedSlots, maxSlots, emptySlots, isFull };
  }

  /**
   * Gets items by type from inventory
   */
  static getItemsByType(inventory: Inventory, type: ItemType): InventorySlot[] {
    return inventory.slots.filter(slot => slot.item.type === type);
  }

  /**
   * Gets items needing repair (low durability)
   */
  static getItemsNeedingRepair(inventory: Inventory): InventorySlot[] {
    return inventory.slots.filter(slot => {
      if (slot.item.stackable) return false;
      const durabilityItem = slot.item as DurabilityItem;
      return durabilityItem.currentDurability <= ITEM_CONSTANTS.DURABILITY_WARNING_THRESHOLD;
    });
  }

  /**
   * Repairs a durability item (future feature)
   */
  static repairItem(inventory: Inventory, itemId: string, repairAmount: number = 10): Result<Inventory> {
    const slot = inventory.slots.find(s => s.item.id === itemId);
    if (!slot) {
      return { success: false, error: "Item not found in inventory" };
    }

    if (slot.item.stackable) {
      return { success: false, error: "Cannot repair consumable items" };
    }

    const durabilityItem = slot.item as DurabilityItem;
    const oldDurability = durabilityItem.currentDurability;
    durabilityItem.currentDurability = Math.min(durabilityItem.maxDurability, oldDurability + repairAmount);

    const repairCost = repairAmount * 2; // 2 gold per durability point
    if (inventory.gold < repairCost) {
      return { success: false, error: `Not enough gold for repair. Need ${repairCost}, have ${inventory.gold}` };
    }

    const updatedInventory = { ...inventory, gold: inventory.gold - repairCost };

    return {
      success: true,
      data: updatedInventory,
      message: `Repaired ${slot.item.name} for ${repairCost} gold`,
    };
  }
}