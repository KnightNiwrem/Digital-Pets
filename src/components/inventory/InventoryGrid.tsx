// Inventory grid component displaying items in a grid layout

import { ItemSlot } from "./ItemSlot";
import { ItemSystem } from "@/systems/ItemSystem";
import type { Inventory, InventorySlot } from "@/types/Item";

interface InventoryGridProps {
  inventory: Inventory;
  selectedItem: InventorySlot | null;
  activeCategory: string;
  onItemSelect: (slot: InventorySlot | null) => void;
}

export function InventoryGrid({ inventory, selectedItem, activeCategory, onItemSelect }: InventoryGridProps) {
  // Filter items by category
  const getFilteredSlots = () => {
    if (activeCategory === "all") {
      return inventory.slots;
    }

    const categories = ItemSystem.getItemsByCategory(inventory);
    return categories[activeCategory] || [];
  };

  const filteredSlots = getFilteredSlots();

  // Create grid layout with empty slots
  const gridSlots = Array.from({ length: inventory.maxSlots }, (_, index) => {
    const slot = filteredSlots.find(s => s.slotIndex === index);
    return slot || null;
  });

  const handleSlotClick = (slot: InventorySlot | null) => {
    if (slot) {
      onItemSelect(selectedItem?.slotIndex === slot.slotIndex ? null : slot);
    }
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 p-2">
      {gridSlots.map((slot, index) => (
        <ItemSlot
          key={index}
          slot={slot}
          isSelected={selectedItem?.slotIndex === slot?.slotIndex}
          isEmpty={!slot}
          onClick={() => handleSlotClick(slot)}
        />
      ))}
    </div>
  );
}
