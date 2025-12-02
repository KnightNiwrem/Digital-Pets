/**
 * Single item slot displaying an item with count or durability.
 */

import { ItemCategory, Rarity } from "@/game/types/constants";
import type { InventoryItem } from "@/game/types/gameState";
import type { Item } from "@/game/types/item";
import { cn } from "@/lib/utils";

interface ItemSlotProps {
  inventoryItem: InventoryItem;
  itemDef: Item;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Get the CSS class for rarity styling.
 */
function getRarityClass(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.Common:
      // Common items use the default border intentionally
      return "border-border";
    case Rarity.Uncommon:
      return "border-green-500";
    case Rarity.Rare:
      return "border-blue-500";
    case Rarity.Epic:
      return "border-purple-500";
    case Rarity.Legendary:
      return "border-yellow-500";
  }
}

/**
 * Display a single item slot with icon, quantity/durability, and selection state.
 */
export function ItemSlot({
  inventoryItem,
  itemDef,
  isSelected = false,
  onClick,
}: ItemSlotProps) {
  const durability = inventoryItem.currentDurability;
  const maxDurability =
    itemDef.category === ItemCategory.Toy ? itemDef.maxDurability : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Select ${itemDef.name}`}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all hover:bg-accent",
        getRarityClass(itemDef.rarity),
        isSelected && "ring-2 ring-primary bg-primary/10",
      )}
    >
      <span className="text-2xl">{itemDef.icon}</span>
      <span className="text-xs font-medium truncate max-w-full">
        {itemDef.name}
      </span>

      {/* Quantity or Durability indicator */}
      {durability !== null && maxDurability !== undefined ? (
        <span className="absolute top-1 right-1 text-xs bg-background/80 px-1 rounded">
          {durability}/{maxDurability}
        </span>
      ) : inventoryItem.quantity > 1 ? (
        <span className="absolute top-1 right-1 text-xs bg-background/80 px-1 rounded">
          ×{inventoryItem.quantity}
        </span>
      ) : null}
    </button>
  );
}
