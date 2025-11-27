/**
 * Grid display for inventory items.
 */

import { getItemById } from "@/game/data/items";
import type { InventoryItem } from "@/game/types/gameState";
import { ItemSlot } from "./ItemSlot";

interface ItemGridProps {
  items: InventoryItem[];
  selectedIndex: number | null;
  onSelectItem: (index: number) => void;
}

/**
 * Display inventory items in a responsive grid.
 */
export function ItemGrid({
  items,
  selectedIndex,
  onSelectItem,
}: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No items in inventory
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
      {items.map((invItem, index) => {
        const itemDef = getItemById(invItem.itemId);
        if (!itemDef) return null;

        return (
          <ItemSlot
            key={`${invItem.itemId}-${index}`}
            inventoryItem={invItem}
            itemDef={itemDef}
            isSelected={selectedIndex === index}
            onClick={() => onSelectItem(index)}
          />
        );
      })}
    </div>
  );
}
