/**
 * Shop inventory component displaying items available for purchase.
 */

import { toDisplay, toDisplayCare } from "@/game/types/common";
import type { Rarity } from "@/game/types/constants";
import type { Item } from "@/game/types/item";
import {
  isBattleItem,
  isCleaningItem,
  isDrinkItem,
  isEquipmentItem,
  isFoodItem,
  isMaterialItem,
  isMedicineItem,
  isToyItem,
} from "@/game/types/item";
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
    case "common":
      return "border-border";
    case "uncommon":
      return "border-green-500";
    case "rare":
      return "border-blue-500";
    case "epic":
      return "border-purple-500";
    case "legendary":
      return "border-yellow-500";
  }
}

/**
 * Format a care stat value as a range if floor and ceil differ.
 * Shows `+(min)~(max)` if there's a difference, otherwise just `+(value)`.
 */
function formatCareStatRange(microValue: number): string {
  const min = toDisplay(microValue);
  const max = toDisplayCare(microValue);
  if (min === max) {
    return `+${min}`;
  }
  return `+${min}~${max}`;
}

/**
 * Get the effect text for an item based on its category.
 */
function getItemEffect(item: Item): string | null {
  if (isFoodItem(item)) {
    return `${formatCareStatRange(item.satietyRestore)} Satiety`;
  }
  if (isDrinkItem(item)) {
    const parts = [`${formatCareStatRange(item.hydrationRestore)} Hydration`];
    if (item.energyRestore) {
      parts.push(`+${toDisplay(item.energyRestore)} Energy`);
    }
    return parts.join(", ");
  }
  if (isToyItem(item)) {
    return `${formatCareStatRange(item.happinessRestore)} Happiness`;
  }
  if (isCleaningItem(item)) {
    return `Removes ${item.poopRemoved} poop`;
  }
  if (isMedicineItem(item)) {
    const parts: string[] = [];
    if (item.isFullRestore) {
      parts.push("Full HP restore");
    } else if (item.healAmount) {
      parts.push(`+${item.healAmount} HP`);
    }
    if (item.cureStatus && item.cureStatus.length > 0) {
      parts.push(`Cures: ${item.cureStatus.join(", ")}`);
    }
    return parts.length > 0 ? parts.join(", ") : null;
  }
  if (isBattleItem(item)) {
    return `+${item.modifierValue}% ${item.statModifier} (${item.duration} turns)`;
  }
  if (isEquipmentItem(item)) {
    return item.effect;
  }
  if (isMaterialItem(item)) {
    return "Crafting material";
  }
  return null;
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
        const itemEffect = getItemEffect(itemDef);

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
            {itemEffect && (
              <span className="text-xs text-muted-foreground truncate max-w-full">
                {itemEffect}
              </span>
            )}
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
