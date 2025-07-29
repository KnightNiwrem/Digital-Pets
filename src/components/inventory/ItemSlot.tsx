// Individual item slot component

import { cn } from "@/lib/utils";
import { ItemIcon } from "./ItemIcon";
import type { InventorySlot, DurabilityItem } from "@/types/Item";
import { ITEM_CONSTANTS } from "@/types/Item";

interface ItemSlotProps {
  slot: InventorySlot | null;
  isSelected: boolean;
  isEmpty: boolean;
  onClick: () => void;
}

export function ItemSlot({ slot, isSelected, isEmpty, onClick }: ItemSlotProps) {
  if (isEmpty || !slot) {
    return (
      <div
        className={cn(
          "aspect-square border-2 border-dashed border-muted-foreground/20",
          "rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
        )}
        onClick={onClick}
      />
    );
  }

  const { item, quantity } = slot;
  const isDurabilityItem = !item.stackable;
  const isLowDurability =
    isDurabilityItem && (item as DurabilityItem).currentDurability <= ITEM_CONSTANTS.DURABILITY_WARNING_THRESHOLD;

  const getRarityColor = () => {
    switch (item.rarity) {
      case "common":
        return "border-gray-400";
      case "uncommon":
        return "border-green-400";
      case "rare":
        return "border-blue-400";
      case "epic":
        return "border-purple-400";
      case "legendary":
        return "border-yellow-400";
      default:
        return "border-gray-400";
    }
  };

  const getRarityGlow = () => {
    switch (item.rarity) {
      case "uncommon":
        return "shadow-green-400/20";
      case "rare":
        return "shadow-blue-400/20";
      case "epic":
        return "shadow-purple-400/20";
      case "legendary":
        return "shadow-yellow-400/20";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "relative aspect-square border-2 rounded-lg p-2 cursor-pointer transition-all",
        "hover:scale-105 hover:shadow-lg",
        isSelected ? "ring-2 ring-primary ring-offset-2" : "",
        getRarityColor(),
        getRarityGlow() && `shadow-lg ${getRarityGlow()}`,
        isLowDurability ? "border-red-400 bg-red-50" : "bg-white"
      )}
      onClick={onClick}
    >
      {/* Item icon */}
      <ItemIcon item={item} className="w-full h-full" />

      {/* Quantity badge for stackable items */}
      {item.stackable && quantity > 1 && (
        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {quantity > 99 ? "99+" : quantity}
        </div>
      )}

      {/* Durability bar for equipment */}
      {isDurabilityItem && (
        <div className="absolute bottom-1 left-1 right-1">
          <div className="h-1 bg-black/20 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all", isLowDurability ? "bg-red-500" : "bg-green-500")}
              style={{
                width: `${
                  ((item as DurabilityItem).currentDurability / (item as DurabilityItem).maxDurability) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Low durability warning */}
      {isLowDurability && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
    </div>
  );
}
