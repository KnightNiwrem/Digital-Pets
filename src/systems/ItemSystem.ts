// Item system for managing inventory operations

import type { Item, Inventory, InventorySlot, DurabilityItem } from "@/types/Item";
import { ITEM_CONSTANTS } from "@/types/Item";
import type { Result } from "@/types";
import type { SystemProposal, ValidationResult, StateChange } from "@/types/SystemProposal";
import { ProposalFactory } from "@/types/SystemProposal";
import { ResultUtils } from "@/lib/utils";
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
}
