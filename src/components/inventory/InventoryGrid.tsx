// Inventory grid component displaying items in a grid layout

import { useMemo } from "react";
import { ItemSlot } from "./ItemSlot";
import { InventoryViewModelService } from "@/services/InventoryViewModelService";
import type { Inventory, InventorySlot } from "@/types/Item";

interface InventoryGridProps {
  inventory: Inventory;
  selectedItem: InventorySlot | null;
  activeCategory: string;
  onItemSelect: (slot: InventorySlot | null) => void;
}

export function InventoryGrid({ inventory, selectedItem, activeCategory, onItemSelect }: InventoryGridProps) {
  // Create view model for contiguous display
  const viewModel = useMemo(
    () => InventoryViewModelService.createViewModel(inventory, activeCategory),
    [inventory, activeCategory]
  );

  // Validate selected item is still visible in current filter
  const validatedSelectedItem = useMemo(
    () => InventoryViewModelService.validateSelectedItem(selectedItem, viewModel),
    [selectedItem, viewModel]
  );

  const handleSlotClick = (displayIndex: number) => {
    const displaySlot = viewModel.displaySlots[displayIndex];

    if (displaySlot) {
      // Check if this item is currently selected by comparing original indices
      const isCurrentlySelected = validatedSelectedItem?.slotIndex === displaySlot.slotIndex;
      onItemSelect(isCurrentlySelected ? null : displaySlot);
    }
  };

  // Helper to determine if display slot is selected
  const isSlotSelected = (displayIndex: number): boolean => {
    if (!validatedSelectedItem) return false;
    const displaySlot = viewModel.displaySlots[displayIndex];
    return displaySlot?.slotIndex === validatedSelectedItem.slotIndex;
  };

  return (
    <div className="space-y-2">
      {/* Show filter info */}
      <div className="text-sm text-muted-foreground">
        Showing {viewModel.totalItems} items
        {activeCategory !== "all" && ` in ${activeCategory}`}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 p-2">
        {viewModel.displaySlots.map((slot, displayIndex) => (
          <ItemSlot
            key={`display-${displayIndex}`}
            slot={slot}
            isSelected={isSlotSelected(displayIndex)}
            isEmpty={!slot}
            onClick={() => handleSlotClick(displayIndex)}
          />
        ))}
      </div>
    </div>
  );
}
