/**
 * Item selector modal for choosing items from inventory.
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getInventoryItemsByCategory } from "@/game/core/inventory";
import { getItemById } from "@/game/data/items";
import type { Inventory, InventoryItem } from "@/game/types/gameState";
import type { Item } from "@/game/types/item";

interface ItemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory;
  category: "food" | "drink" | "cleaning" | "toy";
  title: string;
  description: string;
  onSelect: (itemId: string) => void;
}

interface ItemButtonProps {
  inventoryItem: InventoryItem;
  itemDef: Item;
  onSelect: (itemId: string) => void;
}

function ItemButton({ inventoryItem, itemDef, onSelect }: ItemButtonProps) {
  const durability = inventoryItem.currentDurability;
  // TypeScript narrows itemDef to ToyItem when category === "toy"
  const maxDurability =
    itemDef.category === "toy" ? itemDef.maxDurability : undefined;

  return (
    <Button
      variant="outline"
      className="h-auto p-3 flex flex-col items-center gap-1"
      onClick={() => onSelect(inventoryItem.itemId)}
      aria-label={`Use ${itemDef.name}`}
    >
      <span className="text-2xl">{itemDef.icon}</span>
      <span className="text-sm font-medium">{itemDef.name}</span>
      {durability !== null && maxDurability !== undefined ? (
        <span className="text-xs text-muted-foreground">
          {durability}/{maxDurability}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">
          ×{inventoryItem.quantity}
        </span>
      )}
    </Button>
  );
}

/**
 * Modal for selecting an item from inventory.
 */
export function ItemSelector({
  open,
  onOpenChange,
  inventory,
  category,
  title,
  description,
  onSelect,
}: ItemSelectorProps) {
  const items = getInventoryItemsByCategory(inventory, category);

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No {category} items in inventory!
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2 py-2">
            {items.map((invItem, index) => {
              const itemDef = getItemById(invItem.itemId);
              if (!itemDef) return null;

              return (
                <ItemButton
                  key={`${invItem.itemId}-${index}`}
                  inventoryItem={invItem}
                  itemDef={itemDef}
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
