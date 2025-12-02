/**
 * Shop inventory component displaying items available for purchase.
 */

import { Rarity } from "@/game/types/constants";
import type { Item } from "@/game/types/item";
import type { ShopItem } from "@/game/types/shop";
import { cn } from "@/lib/utils";

interface ShopInventoryProps {
  items: Array<{
    shopItem: ShopItem;
    itemDef: Item;
  }>;
  selectedItemId: string | null;
  playerCoins: number;
  onSelectItem: (itemId: string) => void;
}

/**
 * Get the CSS class for rarity styling.
 */
function getRarityClass(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.Common:
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
 * Displays a grid of items available for purchase in a shop.
 */
export function ShopInventory({
  items,
  selectedItemId,
  playerCoins,
  onSelectItem,
}: ShopInventoryProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No items available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map(({ shopItem, itemDef }) => {
        const isSelected = selectedItemId === shopItem.itemId;
        const canAfford = playerCoins >= shopItem.buyPrice;

        return (
          <button
            key={shopItem.itemId}
            type="button"
            onClick={() => onSelectItem(shopItem.itemId)}
            aria-label={`Select ${itemDef.name}`}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all hover:bg-accent",
              getRarityClass(itemDef.rarity),
              isSelected && "ring-2 ring-primary bg-primary/10",
              !canAfford && "opacity-50",
            )}
          >
            <span className="text-2xl">{itemDef.icon}</span>
            <span className="text-xs font-medium truncate max-w-full">
              {itemDef.name}
            </span>
            <span
              className={cn(
                "text-xs",
                canAfford
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-500",
              )}
            >
              🪙 {shopItem.buyPrice}
            </span>
          </button>
        );
      })}
    </div>
  );
}
