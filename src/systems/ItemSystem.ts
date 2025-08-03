// Item system for managing inventory operations

import type { Item, Inventory, InventorySlot, DurabilityItem } from "@/types/Item";
import { ITEM_CONSTANTS } from "@/types/Item";
import type { Result } from "@/types";
import { PET_CONSTANTS } from "@/types";
import type {
  SystemProposal,
  ValidationResult,
  ProposalContext,
  ProposalGenerator,
  StateChange,
} from "@/types/SystemProposal";
import { ProposalFactory } from "@/types/SystemProposal";
import { ResultUtils, GameMath } from "@/lib/utils";
import { getItemById } from "@/data/items";

// Backward compatibility type for tests
interface TestPet {
  satiety?: number;
  hydration?: number;
  happiness?: number;
  satietyTicksLeft?: number;
  hydrationTicksLeft?: number;
  happinessTicksLeft?: number;
  currentEnergy?: number;
  maxEnergy?: number;
  currentHealth?: number;
  maxHealth?: number;
  health?: string;
  poopCount?: number;
  poopTicksLeft?: number;
  sickByPoopTicksLeft?: number;
  lastCareTime?: number;
  life?: number;
  state?: string;
  [key: string]: unknown;
}

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
      return ResultUtils.error("Quantity must be positive");
    }

    if (!item.stackable && quantity > 1) {
      return ResultUtils.error("Cannot add multiple non-stackable items at once");
    }

    // For stackable items, try to find an existing slot
    if (item.stackable) {
      const existingSlot = inventory.slots.find(slot => slot.item.id === item.id);
      if (existingSlot) {
        const newQuantity = existingSlot.quantity + quantity;
        if (newQuantity > ITEM_CONSTANTS.MAX_STACK_SIZE) {
          return ResultUtils.error(`Stack size limit exceeded (max ${ITEM_CONSTANTS.MAX_STACK_SIZE})`);
        }

        const updatedInventory = {
          ...inventory,
          slots: inventory.slots.map(slot =>
            slot.slotIndex === existingSlot.slotIndex ? { ...slot, quantity: newQuantity } : slot
          ),
        };

        return ResultUtils.success(updatedInventory, `Added ${quantity}x ${item.name} to existing stack`);
      }
    }

    // Find next available slot
    const occupiedSlots = new Set(inventory.slots.map(slot => slot.slotIndex));
    let nextSlotIndex = 0;
    while (occupiedSlots.has(nextSlotIndex) && nextSlotIndex < inventory.maxSlots) {
      nextSlotIndex++;
    }

    if (nextSlotIndex >= inventory.maxSlots) {
      return ResultUtils.error("Inventory is full");
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

    return ResultUtils.success(updatedInventory, `Added ${quantity}x ${item.name} to inventory`);
  }

  /**
   * Remove an item from the inventory
   */
  static removeItem(inventory: Inventory, itemId: string, quantity: number = 1): Result<Inventory> {
    if (quantity <= 0) {
      return ResultUtils.error("Quantity must be positive");
    }

    const slotIndex = inventory.slots.findIndex(slot => slot.item.id === itemId);
    if (slotIndex === -1) {
      return ResultUtils.error("Item not found in inventory");
    }

    const slot = inventory.slots[slotIndex];
    if (slot.quantity < quantity) {
      return ResultUtils.error("Not enough items in inventory");
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

    return ResultUtils.success(updatedInventory, `Removed ${quantity}x ${slot.item.name} from inventory`);
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

  // ============= PROPOSAL-BASED METHODS =============

  /**
   * Generate proposals for inventory operations
   */
  static generateInventoryProposals(
    inventory: Inventory,
    operation: "add" | "remove" | "use",
    itemId: string,
    quantity: number = 1
  ): SystemProposal[] {
    const proposals: SystemProposal[] = [];

    switch (operation) {
      case "add": {
        const itemTemplate = getItemById(itemId);
        if (!itemTemplate) break;

        // Create item instance
        let item: Item;
        if (itemTemplate.stackable) {
          item = { ...itemTemplate };
        } else {
          item = {
            ...itemTemplate,
            currentDurability: (itemTemplate as DurabilityItem).maxDurability,
          } as DurabilityItem;
        }

        proposals.push({
          id: ProposalFactory.generateId("item_system"),
          systemId: "item_system",
          description: `Add ${quantity}x ${item.name} to inventory`,
          priority: 90,
          changes: [
            {
              type: "inventory_update" as const,
              target: itemId,
              property: "quantity",
              newValue: quantity,
              operation: "add" as const,
              metadata: { item, operation: "add" },
            },
          ],
          dependencies: [],
        });
        break;
      }

      case "remove": {
        const slot = this.getInventoryItem(inventory, itemId);
        if (!slot) break;

        proposals.push({
          id: ProposalFactory.generateId("item_system"),
          systemId: "item_system",
          description: `Remove ${quantity}x ${slot.item.name} from inventory`,
          priority: 90,
          changes: [
            {
              type: "inventory_update" as const,
              target: itemId,
              property: "quantity",
              newValue: -quantity,
              operation: "subtract" as const,
              metadata: { operation: "remove" },
            },
          ],
          dependencies: [],
        });
        break;
      }

      case "use": {
        const slot = this.getInventoryItem(inventory, itemId);
        if (!slot) break;

        const item = slot.item;

        // Handle item consumption/durability
        if (item.stackable) {
          // Consumable item - remove one from inventory
          proposals.push({
            id: ProposalFactory.generateId("item_system"),
            systemId: "item_system",
            description: `Use ${item.name} (consumable)`,
            priority: 95,
            changes: [
              {
                type: "inventory_update" as const,
                target: itemId,
                property: "quantity",
                newValue: -1,
                operation: "subtract" as const,
                metadata: { operation: "use_consumable" },
              },
            ],
            dependencies: [],
          });
        } else {
          // Durability item - reduce durability
          const durabilityItem = item as DurabilityItem;
          const newDurability = durabilityItem.currentDurability - durabilityItem.durabilityLossPerUse;

          if (newDurability <= 0) {
            // Item is broken, remove from inventory
            proposals.push({
              id: ProposalFactory.generateId("item_system"),
              systemId: "item_system",
              description: `Use ${item.name} (broken, removing)`,
              priority: 95,
              changes: [
                {
                  type: "inventory_update" as const,
                  target: itemId,
                  property: "quantity",
                  newValue: -1,
                  operation: "subtract" as const,
                  metadata: { operation: "use_broken" },
                },
              ],
              dependencies: [],
            });
          } else {
            // Update durability
            proposals.push({
              id: ProposalFactory.generateId("item_system"),
              systemId: "item_system",
              description: `Use ${item.name} (durability: ${newDurability}/${durabilityItem.maxDurability})`,
              priority: 95,
              changes: [
                {
                  type: "inventory_update" as const,
                  target: itemId,
                  property: "currentDurability",
                  newValue: newDurability,
                  operation: "set" as const,
                  metadata: { operation: "update_durability" },
                },
              ],
              dependencies: [],
            });
          }
        }
        break;
      }
    }

    return proposals;
  }

  /**
   * Generate proposals for shop operations
   */
  static generateShopProposals(
    inventory: Inventory,
    operation: "buy" | "sell",
    itemId: string,
    quantity: number = 1,
    priceMultiplier: number = 1
  ): SystemProposal[] {
    const proposals: SystemProposal[] = [];

    switch (operation) {
      case "buy": {
        const itemTemplate = getItemById(itemId);
        if (!itemTemplate) break;

        const totalCost = Math.floor(itemTemplate.value * priceMultiplier * quantity);

        // Create item instance
        let item: Item;
        if (itemTemplate.stackable) {
          item = { ...itemTemplate };
        } else {
          item = {
            ...itemTemplate,
            currentDurability: (itemTemplate as DurabilityItem).maxDurability,
          } as DurabilityItem;
        }

        proposals.push({
          id: ProposalFactory.generateId("item_system"),
          systemId: "item_system",
          description: `Buy ${quantity}x ${item.name} for ${totalCost} gold`,
          priority: 80,
          changes: [
            {
              type: "inventory_update" as const,
              target: itemId,
              property: "quantity",
              newValue: quantity,
              operation: "add" as const,
              metadata: { operation: "buy", item, cost: totalCost },
            },
            {
              type: "game_state_update" as const,
              property: "gold",
              newValue: -totalCost,
              operation: "subtract" as const,
            },
          ],
          dependencies: [],
        });
        break;
      }

      case "sell": {
        const slot = this.getInventoryItem(inventory, itemId);
        if (!slot) break;

        // Calculate sell price (reduced for damaged durability items)
        let sellPrice = slot.item.value * priceMultiplier;
        if (!slot.item.stackable) {
          const durabilityItem = slot.item as DurabilityItem;
          const durabilityRatio = durabilityItem.currentDurability / durabilityItem.maxDurability;
          sellPrice *= durabilityRatio;
        }

        const totalValue = Math.floor(sellPrice * quantity);

        proposals.push({
          id: ProposalFactory.generateId("item_system"),
          systemId: "item_system",
          description: `Sell ${quantity}x ${slot.item.name} for ${totalValue} gold`,
          priority: 80,
          changes: [
            {
              type: "inventory_update" as const,
              target: itemId,
              property: "quantity",
              newValue: -quantity,
              operation: "subtract" as const,
              metadata: { operation: "sell" },
            },
            {
              type: "game_state_update" as const,
              property: "gold",
              newValue: totalValue,
              operation: "add" as const,
            },
          ],
          dependencies: [],
        });
        break;
      }
    }

    return proposals;
  }

  /**
   * Validate inventory operations
   */
  static validateInventoryProposal(proposal: SystemProposal, inventory: Inventory): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const change of proposal.changes) {
      if (change.type === "inventory_update") {
        const operation = change.metadata?.operation;
        const itemId = change.target;
        const quantity = Math.abs(change.newValue as number);

        switch (operation) {
          case "add":
          case "buy": {
            // Check inventory space
            const availableSlots = this.getAvailableSlots(inventory);
            const existingSlot = itemId ? this.getInventoryItem(inventory, itemId) : null;

            if (!existingSlot && availableSlots === 0) {
              errors.push("Inventory is full");
            }

            if (existingSlot && existingSlot.item.stackable) {
              const newQuantity = existingSlot.quantity + quantity;
              if (newQuantity > ITEM_CONSTANTS.MAX_STACK_SIZE) {
                errors.push(`Stack size limit exceeded (max ${ITEM_CONSTANTS.MAX_STACK_SIZE})`);
              }
            }
            break;
          }

          case "remove":
          case "use_consumable":
          case "use_broken":
          case "sell": {
            const slot = itemId ? this.getInventoryItem(inventory, itemId) : null;

            if (!slot) {
              errors.push("Item not found in inventory");
            } else if (slot.quantity < quantity) {
              errors.push("Not enough items in inventory");
            }
            break;
          }
        }
      } else if (change.type === "game_state_update" && change.property === "gold") {
        // Check gold constraints
        const goldChange = change.newValue as number;
        if (goldChange < 0 && inventory.gold + goldChange < 0) {
          errors.push("Not enough gold");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      conflicts: [],
    };
  }

  /**
   * Apply inventory changes from validated proposals
   */
  static applyInventoryChanges(inventory: Inventory, change: StateChange): Inventory {
    if (change.type !== "inventory_update") return inventory;

    const operation = change.metadata?.operation;
    const itemId = change.target;
    const quantity = Math.abs(change.newValue as number);

    switch (operation) {
      case "add": {
        const item = change.metadata?.item as Item;
        if (item) {
          const addResult = this.addItem(inventory, item, quantity);
          return addResult.success ? addResult.data! : inventory;
        }
        return inventory;
      }

      case "remove":
      case "use_consumable":
      case "use_broken":
      case "sell": {
        if (itemId) {
          const removeResult = this.removeItem(inventory, itemId, quantity);
          return removeResult.success ? removeResult.data! : inventory;
        }
        return inventory;
      }

      case "update_durability": {
        const newDurability = change.newValue as number;
        if (itemId) {
          return {
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
        return inventory;
      }

      case "buy": {
        const item = change.metadata?.item as Item;
        const cost = change.metadata?.cost as number;
        if (item && cost !== undefined) {
          const addResult = this.addItem(inventory, item, quantity);
          if (addResult.success) {
            return {
              ...addResult.data!,
              gold: inventory.gold - cost,
            };
          }
        }
        return inventory;
      }

      default:
        return inventory;
    }
  }

  /**
   * Apply gold changes from game state updates
   */
  static applyGoldChange(inventory: Inventory, change: StateChange): Inventory {
    if (change.type !== "game_state_update" || change.property !== "gold") return inventory;

    const goldChange = change.newValue as number;
    return {
      ...inventory,
      gold: inventory.gold + goldChange,
    };
  }

  /**
   * Get item effects for ActionCoordinator to pass to PetSystem
   */
  static getItemEffects(itemId: string): Item["effects"] {
    const item = getItemById(itemId);
    return item ? item.effects : [];
  }

  /**
   * Check if item usage is valid from inventory perspective only
   */
  static canUseItem(inventory: Inventory, itemId: string): boolean {
    const slot = this.getInventoryItem(inventory, itemId);
    if (!slot) return false;

    // Check durability for non-stackable items
    if (!slot.item.stackable) {
      const durabilityItem = slot.item as DurabilityItem;
      return durabilityItem.currentDurability > 0;
    }

    return true;
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
  // ============= BACKWARD COMPATIBILITY METHODS =============
  // These methods are kept for test compatibility and will delegate to ActionCoordinator

  /**
   * @deprecated Use ActionCoordinator with ItemAction instead
   * Validate item usage from inventory perspective
   */
  static validateItemUsage(inventoryOrPet: Inventory | unknown, itemIdOrItem?: string | unknown): Result<boolean> {
    // Handle legacy signature: validateItemUsage(pet, item)
    if (arguments.length === 2 && typeof itemIdOrItem === "object" && itemIdOrItem !== null) {
      // Legacy call with (pet, item) - implement full pet validation logic
      const pet = inventoryOrPet as TestPet;
      const item = itemIdOrItem as Item;

      // Check if pet is dead
      if (pet.life !== undefined && pet.life <= 0) {
        return { success: false, error: "Cannot use items on deceased pet" };
      }

      // Check pet state - cannot use items while sleeping, traveling, etc.
      if (pet.state !== undefined && pet.state !== "idle") {
        switch (pet.state) {
          case "sleeping":
            return { success: false, error: "Cannot use items while pet is sleeping" };
          case "travelling":
            return { success: false, error: "Cannot use items while pet is travelling" };
          case "exploring":
            return { success: false, error: "Cannot use items while pet is exploring" };
          case "battling":
            return { success: false, error: "Cannot use items while pet is battling" };
          default:
            return { success: false, error: "Cannot use items in current pet state" };
        }
      }

      // Check durability for non-stackable items
      if (item.stackable === false && "currentDurability" in item) {
        const durabilityItem = item as DurabilityItem;
        if (durabilityItem.currentDurability <= 0) {
          return { success: false, error: "Item is broken and cannot be used" };
        }
      }

      // Check item-specific validation based on effects and item type
      for (const effect of item.effects) {
        switch (effect.type) {
          case "satiety":
            if (pet.satiety !== undefined && pet.satiety >= 100) {
              return { success: false, error: "Pet is not hungry" };
            }
            break;
          case "hydration":
            if (pet.hydration !== undefined && pet.hydration >= 100) {
              return { success: false, error: "Pet is not thirsty" };
            }
            break;
          case "happiness":
            if (item.type === "toy") {
              if (pet.happiness !== undefined && pet.happiness >= 100) {
                return { success: false, error: "Pet is already very happy" };
              }
              if (pet.currentEnergy !== undefined && pet.currentEnergy < 10) {
                return { success: false, error: "Pet has insufficient energy to play" };
              }
            }
            break;
          case "energy":
            if (pet.currentEnergy !== undefined && pet.maxEnergy !== undefined && pet.currentEnergy >= pet.maxEnergy) {
              return { success: false, error: "Pet already has full energy" };
            }
            break;
          case "health":
          case "cure":
            if (pet.health !== undefined && pet.health === "healthy") {
              return { success: false, error: "Pet is already healthy" };
            }
            break;
          case "clean":
            if (pet.poopCount !== undefined && pet.poopCount === 0) {
              return { success: false, error: "Pet has no poop to clean" };
            }
            break;
        }
      }

      return { success: true, data: true };
    }

    // New signature: validateItemUsage(inventory, itemId)
    const inventory = inventoryOrPet as Inventory;
    const itemId = itemIdOrItem as string;

    const slot = this.getInventoryItem(inventory, itemId);
    if (!slot) {
      return { success: false, error: "Item not found in inventory" };
    }

    if (!this.canUseItem(inventory, itemId)) {
      return { success: false, error: "Item cannot be used (broken or invalid)" };
    }

    return { success: true, data: true };
  }

  /**
   * Apply item effects to a pet (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with ItemAction instead
   */
  static applyItemEffects(pet: TestPet, item: Item): Result<TestPet> {
    // Validate item usage with pet
    const validation = this.validateItemUsage(pet, item);
    if (!validation.success) {
      return { success: false, error: validation.error || "Item validation failed" };
    }

    // Create a copy of the pet to modify
    const modifiedPet = { ...pet };
    let effectsApplied = false;

    for (const effect of item.effects) {
      switch (effect.type) {
        case "satiety":
          if (modifiedPet.satiety !== undefined && modifiedPet.satiety < 100) {
            const ticksToAdd = effect.value * PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
            modifiedPet.satietyTicksLeft = (modifiedPet.satietyTicksLeft || 0) + ticksToAdd;
            modifiedPet.satiety = GameMath.calculateSatietyDisplay(modifiedPet.satietyTicksLeft);
            effectsApplied = true;
          }
          break;

        case "hydration":
          if (modifiedPet.hydration !== undefined && modifiedPet.hydration < 100) {
            const ticksToAdd = effect.value * PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION;
            modifiedPet.hydrationTicksLeft = (modifiedPet.hydrationTicksLeft || 0) + ticksToAdd;
            modifiedPet.hydration = GameMath.calculateHydrationDisplay(modifiedPet.hydrationTicksLeft);
            effectsApplied = true;
          }
          break;

        case "happiness":
          if (modifiedPet.happiness !== undefined && modifiedPet.happiness < 100) {
            const ticksToAdd = effect.value * PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS;
            modifiedPet.happinessTicksLeft = (modifiedPet.happinessTicksLeft || 0) + ticksToAdd;
            modifiedPet.happiness = GameMath.calculateHappinessDisplay(modifiedPet.happinessTicksLeft);
            if (item.type === "toy" && modifiedPet.currentEnergy !== undefined) {
              modifiedPet.currentEnergy = Math.max(0, modifiedPet.currentEnergy - 10);
            }
            effectsApplied = true;
          }
          break;

        case "energy":
          if (
            modifiedPet.currentEnergy !== undefined &&
            modifiedPet.maxEnergy !== undefined &&
            modifiedPet.currentEnergy < modifiedPet.maxEnergy
          ) {
            modifiedPet.currentEnergy = Math.min(modifiedPet.maxEnergy, modifiedPet.currentEnergy + effect.value);
            effectsApplied = true;
          }
          break;

        case "health": {
          // Health effects can heal currentHealth and cure status ailments
          let healthEffectApplied = false;

          // Heal currentHealth if below max
          if (
            modifiedPet.currentHealth !== undefined &&
            modifiedPet.maxHealth !== undefined &&
            typeof modifiedPet.currentHealth === "number" &&
            typeof modifiedPet.maxHealth === "number" &&
            modifiedPet.currentHealth < modifiedPet.maxHealth
          ) {
            const healAmount = Math.min(effect.value, modifiedPet.maxHealth - modifiedPet.currentHealth);
            modifiedPet.currentHealth += healAmount;
            healthEffectApplied = true;
          }

          // Cure health status if not healthy
          if (modifiedPet.health !== undefined && modifiedPet.health !== "healthy") {
            modifiedPet.health = "healthy";
            healthEffectApplied = true;
          }

          if (healthEffectApplied) {
            effectsApplied = true;
          }
          break;
        }

        case "cure":
          if (modifiedPet.health !== undefined && modifiedPet.health !== "healthy") {
            modifiedPet.health = "healthy";
            effectsApplied = true;
          }
          break;

        case "clean":
          if (modifiedPet.poopCount !== undefined && modifiedPet.poopCount > 0) {
            modifiedPet.poopCount = 0;
            modifiedPet.poopTicksLeft = Math.floor(Math.random() * 240) + 240;
            modifiedPet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS;
            effectsApplied = true;
          }
          break;
      }
    }

    if (!effectsApplied) {
      return { success: false, error: "Item had no effect on pet" };
    }

    // Update pet care time for consumable items
    if (item.stackable && modifiedPet.lastCareTime !== undefined) {
      modifiedPet.lastCareTime = Date.now();
    }

    // Copy original pet properties back
    Object.assign(pet, modifiedPet);

    return { success: true, data: modifiedPet };
  }

  /**
   * Use an item on a pet (for testing only)
   * @deprecated Use ActionCoordinator.dispatchAction with ItemAction instead
   */
  static useItem(
    inventory: Inventory,
    pet: TestPet,
    itemId: string
  ): Result<{ pet: TestPet; inventory: Inventory; usage: { success: boolean; [key: string]: unknown } }> {
    // Check if item exists in inventory
    const slot = this.getInventoryItem(inventory, itemId);
    if (!slot) {
      return { success: false, error: "Item not found in inventory" };
    }

    const item = slot.item;

    // Validate item usage with pet
    const petValidation = this.validateItemUsage(pet, item);
    if (!petValidation.success) {
      return { success: false, error: petValidation.error || "Item validation failed" };
    }

    // Apply item effects to pet
    let effectsApplied = false;
    const messages: string[] = [];

    for (const effect of item.effects) {
      switch (effect.type) {
        case "satiety":
          if (pet.satiety !== undefined && pet.satiety < 100) {
            // NOTE: This duplicates PetSystem logic but is necessary for backward compatibility
            // with deprecated test methods that use the TestPet interface
            const ticksToAdd = effect.value * PET_CONSTANTS.STAT_MULTIPLIER.SATIETY;
            pet.satietyTicksLeft = (pet.satietyTicksLeft || 0) + ticksToAdd;
            pet.satiety = GameMath.calculateSatietyDisplay(pet.satietyTicksLeft);
            messages.push(`+${effect.value} satiety`);
            effectsApplied = true;
          }
          break;

        case "hydration":
          if (pet.hydration !== undefined && pet.hydration < 100) {
            // NOTE: This duplicates PetSystem logic but is necessary for backward compatibility
            // with deprecated test methods that use the TestPet interface
            const ticksToAdd = effect.value * PET_CONSTANTS.STAT_MULTIPLIER.HYDRATION;
            pet.hydrationTicksLeft = (pet.hydrationTicksLeft || 0) + ticksToAdd;
            pet.hydration = GameMath.calculateHydrationDisplay(pet.hydrationTicksLeft);
            messages.push(`+${effect.value} hydration`);
            effectsApplied = true;
          }
          break;

        case "happiness":
          if (pet.happiness !== undefined && pet.happiness < 100) {
            // NOTE: This duplicates PetSystem logic but is necessary for backward compatibility
            // with deprecated test methods that use the TestPet interface
            const ticksToAdd = effect.value * PET_CONSTANTS.STAT_MULTIPLIER.HAPPINESS;
            pet.happinessTicksLeft = (pet.happinessTicksLeft || 0) + ticksToAdd;
            pet.happiness = GameMath.calculateHappinessDisplay(pet.happinessTicksLeft);
            if (item.type === "toy" && pet.currentEnergy !== undefined) {
              pet.currentEnergy = Math.max(0, pet.currentEnergy - 10);
              messages.push(`+${effect.value} happiness, -10 energy`);
            } else {
              messages.push(`+${effect.value} happiness`);
            }
            effectsApplied = true;
          }
          break;

        case "energy":
          if (pet.currentEnergy !== undefined && pet.maxEnergy !== undefined && pet.currentEnergy < pet.maxEnergy) {
            pet.currentEnergy = Math.min(pet.maxEnergy, pet.currentEnergy + effect.value);
            messages.push(`+${effect.value} energy`);
            effectsApplied = true;
          }
          break;

        case "health": {
          // Health effects can heal currentHealth and cure status ailments
          let healthMessages = [];

          // Heal currentHealth if below max
          if (
            pet.currentHealth !== undefined &&
            pet.maxHealth !== undefined &&
            typeof pet.currentHealth === "number" &&
            typeof pet.maxHealth === "number" &&
            pet.currentHealth < pet.maxHealth
          ) {
            const healAmount = Math.min(effect.value, pet.maxHealth - pet.currentHealth);
            pet.currentHealth += healAmount;
            healthMessages.push(`+${healAmount} health`);
            effectsApplied = true;
          }

          // Cure health status if not healthy
          if (pet.health !== undefined && pet.health !== "healthy") {
            pet.health = "healthy";
            healthMessages.push("cured injury");
            effectsApplied = true;
          }

          if (healthMessages.length > 0) {
            messages.push(healthMessages.join(", "));
          }
          break;
        }

        case "cure":
          if (pet.health !== undefined && pet.health !== "healthy") {
            pet.health = "healthy";
            messages.push("cured illness");
            effectsApplied = true;
          }
          break;

        case "clean":
          if (pet.poopCount !== undefined && pet.poopCount > 0) {
            pet.poopCount = 0;
            pet.poopTicksLeft = Math.floor(Math.random() * 240) + 240;
            pet.sickByPoopTicksLeft = PET_CONSTANTS.SICK_BY_POOP_TICKS;
            messages.push("cleaned pet");
            effectsApplied = true;
          }
          break;
      }
    }

    if (!effectsApplied) {
      return { success: false, error: "Item had no effect on pet" };
    }

    // Update pet care time
    if (pet.lastCareTime !== undefined) {
      pet.lastCareTime = Date.now();
    }

    // Handle item consumption/durability - modify inventory for tests
    let updatedInventory = inventory;
    if (item.stackable) {
      // Consumable item - remove one from inventory
      const removeResult = this.removeItem(inventory, itemId, 1);
      if (removeResult.success) {
        updatedInventory = removeResult.data!;
      }
    } else {
      // Durability item - reduce durability
      const durabilityItem = item as DurabilityItem;
      const newDurability = Math.max(0, durabilityItem.currentDurability - durabilityItem.durabilityLossPerUse);

      if (newDurability <= 0) {
        // Item is broken, remove from inventory
        const removeResult = this.removeItem(inventory, itemId, 1);
        if (removeResult.success) {
          updatedInventory = removeResult.data!;
        }
      } else {
        // Update durability in inventory
        updatedInventory = {
          ...inventory,
          slots: inventory.slots.map(slot =>
            slot.item.id === itemId
              ? { ...slot, item: { ...slot.item, currentDurability: newDurability } as DurabilityItem }
              : slot
          ),
        };
      }
    }

    const message = `Used ${item.name}${messages.length > 0 ? ` (${messages.join(", ")})` : ""}`;
    return {
      success: true,
      data: {
        pet,
        inventory: updatedInventory,
        usage: {
          success: true,
          message,
          effects: messages,
        },
      },
    };
  }

  // NOTE: applyItemEffects method removed - pet effects are now handled by ActionCoordinator + PetSystem

  // NOTE: Direct useItem with full pet care logic is now handled by ActionCoordinator
}

/**
 * Item System Proposal Generator for ActionCoordinator integration
 */
export class ItemSystemProposalGenerator implements ProposalGenerator {
  generateProposals(_action: unknown, _context: ProposalContext): SystemProposal[] {
    // This method is implemented in ActionCoordinator
    // We keep this class for type compatibility
    return [];
  }

  validateProposal(proposal: SystemProposal, context: ProposalContext): ValidationResult {
    // Extract inventory from game state
    const inventory = context.currentState.inventory;
    if (!inventory) {
      return {
        isValid: false,
        errors: ["No inventory found in game state"],
        warnings: [],
        conflicts: [],
      };
    }

    return ItemSystem.validateInventoryProposal(proposal, inventory);
  }

  checkConflicts(
    _proposal: SystemProposal,
    _otherProposals: SystemProposal[],
    _context: ProposalContext
  ): import("@/types/SystemProposal").ProposalConflict[] {
    // Inventory operations rarely conflict with each other
    // Most conflicts would be handled by validation (e.g., insufficient quantity)
    return [];
  }
}
