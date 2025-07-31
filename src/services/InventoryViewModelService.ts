// Inventory View Model Service for contiguous filtering
// This service creates view models that display filtered items contiguously
// while preserving original slot indices for data integrity

import type { Inventory, InventorySlot } from "@/types/Item";
import { ItemSystem } from "@/systems/ItemSystem";

export interface InventoryViewModel {
  // Contiguous array for display (no gaps)
  displaySlots: (InventorySlot | null)[];
  // Mapping from display index to original slot index
  displayToOriginalIndex: Map<number, number>;
  // Mapping from original slot index to display index
  originalToDisplayIndex: Map<number, number>;
  // Current filter metadata
  activeCategory: string;
  totalItems: number;
  totalDisplaySlots: number;
}

export class InventoryViewModelService {
  private static viewModelCache = new Map<string, InventoryViewModel>();
  private static readonly MAX_CACHE_SIZE = 10;
  private static readonly COLS_PER_ROW = 8; // Grid columns
  private static readonly MIN_DISPLAY_SLOTS = 16; // Always show at least 2 rows

  /**
   * Create contiguous view model from filtered inventory
   */
  static createViewModel(inventory: Inventory, activeCategory: string): InventoryViewModel {
    // Create cache key from inventory state and category
    const cacheKey = this.createCacheKey(inventory, activeCategory);

    // Return cached result if inventory hasn't changed
    if (this.viewModelCache.has(cacheKey)) {
      return this.viewModelCache.get(cacheKey)!;
    }

    // Create new view model
    const viewModel = this.createViewModelInternal(inventory, activeCategory);

    // Cache result (limit cache size to prevent memory leaks)
    if (this.viewModelCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.viewModelCache.keys().next().value;
      if (firstKey) {
        this.viewModelCache.delete(firstKey);
      }
    }

    this.viewModelCache.set(cacheKey, viewModel);
    return viewModel;
  }

  /**
   * Internal method to create view model
   */
  private static createViewModelInternal(inventory: Inventory, activeCategory: string): InventoryViewModel {
    // Get filtered slots using existing logic
    const filteredSlots = this.getFilteredSlots(inventory, activeCategory);

    // Create contiguous display array
    const displaySlots: (InventorySlot | null)[] = [];
    const displayToOriginalIndex = new Map<number, number>();
    const originalToDisplayIndex = new Map<number, number>();

    // Pack filtered items contiguously
    filteredSlots.forEach((slot, displayIndex) => {
      displaySlots[displayIndex] = slot;
      displayToOriginalIndex.set(displayIndex, slot.slotIndex);
      originalToDisplayIndex.set(slot.slotIndex, displayIndex);
    });

    // Fill remaining display slots with nulls for empty slots
    const maxDisplaySlots = this.calculateDisplaySlots(filteredSlots.length);
    while (displaySlots.length < maxDisplaySlots) {
      displaySlots.push(null);
    }

    return {
      displaySlots,
      displayToOriginalIndex,
      originalToDisplayIndex,
      activeCategory,
      totalItems: filteredSlots.length,
      totalDisplaySlots: maxDisplaySlots,
    };
  }

  /**
   * Get filtered slots using existing ItemSystem logic
   */
  private static getFilteredSlots(inventory: Inventory, activeCategory: string): InventorySlot[] {
    if (activeCategory === "all") {
      return inventory.slots;
    }

    const categories = ItemSystem.getItemsByCategory(inventory);
    return categories[activeCategory] || [];
  }

  /**
   * Calculate optimal display grid size (rounded up to nearest grid row)
   */
  private static calculateDisplaySlots(itemCount: number): number {
    if (itemCount === 0) return this.MIN_DISPLAY_SLOTS;

    const requiredRows = Math.ceil(itemCount / this.COLS_PER_ROW);
    return Math.max(requiredRows * this.COLS_PER_ROW, this.MIN_DISPLAY_SLOTS);
  }

  /**
   * Convert display index to original slot index for item operations
   */
  static getOriginalIndex(viewModel: InventoryViewModel, displayIndex: number): number | null {
    return viewModel.displayToOriginalIndex.get(displayIndex) ?? null;
  }

  /**
   * Convert original slot index to display index for UI updates
   */
  static getDisplayIndex(viewModel: InventoryViewModel, originalIndex: number): number | null {
    return viewModel.originalToDisplayIndex.get(originalIndex) ?? null;
  }

  /**
   * Validate that selected item is visible in current filter
   */
  static validateSelectedItem(selectedItem: InventorySlot | null, viewModel: InventoryViewModel): InventorySlot | null {
    if (!selectedItem) return null;

    // Check if selected item exists in current filter
    const displayIndex = this.getDisplayIndex(viewModel, selectedItem.slotIndex);
    return displayIndex !== null ? selectedItem : null;
  }

  /**
   * Create deterministic cache key from inventory contents
   */
  private static createCacheKey(inventory: Inventory, activeCategory: string): string {
    // Create signature from inventory contents
    const slotSignature = inventory.slots
      .map(slot => `${slot.item.id}:${slot.quantity}:${slot.slotIndex}`)
      .sort()
      .join("|");

    return `${activeCategory}:${inventory.slots.length}:${slotSignature.slice(0, 100)}`;
  }

  /**
   * Clear view model cache (useful for testing or memory management)
   */
  static clearCache(): void {
    this.viewModelCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.viewModelCache.size,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }
}
