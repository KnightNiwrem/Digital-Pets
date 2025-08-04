// Item details panel showing item information and actions

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ItemIcon } from "./ItemIcon";
import type { InventorySlot, DurabilityItem } from "@/types/Item";
import type { Pet } from "@/types/Pet";
import { ITEM_CONSTANTS } from "@/types/Item";
import { ItemPricing, UIUtils, ItemEffectUtils } from "@/lib/utils";
import { X, Play, Coins, AlertTriangle, Info } from "lucide-react";
import { QuantitySelector } from "@/components/ui/QuantitySelector";

interface ItemDetailsPanelProps {
  slot: InventorySlot;
  pet: Pet;
  onUseItem: () => void;
  onSellItem: (quantity: number) => void;
  onClose: () => void;
}

export function ItemDetailsPanel({ slot, pet, onUseItem, onSellItem, onClose }: ItemDetailsPanelProps) {
  const { item, quantity } = slot;
  const [sellQuantity, setSellQuantity] = useState(1);

  const isDurabilityItem = !item.stackable;
  const durabilityItem = isDurabilityItem ? (item as DurabilityItem) : null;
  const isLowDurability =
    durabilityItem && durabilityItem.currentDurability <= ITEM_CONSTANTS.DURABILITY_WARNING_THRESHOLD;

  // Basic item usage validation (detailed validation happens in ActionCoordinator)
  const canUseItem = (() => {
    // Check if item has zero durability
    if (durabilityItem && durabilityItem.currentDurability <= 0) {
      return { success: false, error: "Item is broken and cannot be used" };
    }

    // Check if pet is in a state that prevents item usage
    if (pet.state === "travelling") {
      return { success: false, error: "Cannot use items while pet is travelling" };
    }

    return { success: true };
  })();

  const sellValue = ItemPricing.getStandardSellPrice(item.value);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border rounded-lg p-2 bg-white">
              <ItemIcon item={item} className="w-full h-full" />
            </div>
            <div>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <p className={`text-sm font-medium capitalize ${UIUtils.getRarityColor(item.rarity)}`}>
                {item.rarity} {item.type}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>

        {/* Effects */}
        {item.effects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Effects</h4>
            <p className="text-sm text-green-600">{ItemEffectUtils.getEffectDescription(item.effects)}</p>
          </div>
        )}

        {/* Durability info */}
        {durabilityItem && (
          <div>
            <h4 className="text-sm font-medium mb-2">Durability</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Condition</span>
                <span className={isLowDurability ? "text-red-600" : "text-green-600"}>
                  {durabilityItem.currentDurability}/{durabilityItem.maxDurability}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isLowDurability ? "bg-red-500" : "bg-green-500"}`}
                  style={{
                    width: `${(durabilityItem.currentDurability / durabilityItem.maxDurability) * 100}%`,
                  }}
                />
              </div>
              {isLowDurability && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Low durability</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quantity info */}
        {item.stackable && (
          <div>
            <h4 className="text-sm font-medium mb-2">Quantity</h4>
            <p className="text-sm">{quantity} in inventory</p>
          </div>
        )}

        {/* Usage validation */}
        {!canUseItem.success && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">Cannot use item</p>
              <p className="text-xs text-yellow-700">{canUseItem.error}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2 border-t">
          {/* Use item */}
          <Button onClick={onUseItem} disabled={!canUseItem.success} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Use Item
          </Button>

          {/* Sell item */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sell for {sellValue} gold each</span>
            </div>

            {item.stackable && quantity > 1 && (
              <div className="flex items-center justify-center">
                <QuantitySelector value={sellQuantity} min={1} max={quantity} onChange={setSellQuantity} />
              </div>
            )}

            <Button variant="outline" onClick={() => onSellItem(sellQuantity)} className="w-full">
              <Coins className="h-4 w-4 mr-2" />
              Sell {item.stackable && sellQuantity > 1 ? `${sellQuantity}x` : ""}({sellValue * sellQuantity} gold)
            </Button>
          </div>
        </div>

        {/* Item stats */}
        <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Base Value:</span>
            <span>{item.value} gold</span>
          </div>
          <div className="flex justify-between">
            <span>Item ID:</span>
            <span>{item.id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
