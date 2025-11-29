/**
 * Buy/Sell panel component for shop transactions.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toDisplay, toDisplayCare } from "@/game/types/common";
import type { InventoryItem } from "@/game/types/gameState";
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

interface BuySellPanelProps {
  mode: "buy" | "sell";
  itemDef: Item;
  shopItem?: ShopItem;
  inventoryItem?: InventoryItem;
  playerCoins: number;
  sellPrice?: number;
  onBuy: (quantity: number) => void;
  onSell: (quantity: number) => void;
}

/**
 * Panel for buying or selling items with quantity selection.
 */
export function BuySellPanel({
  mode,
  itemDef,
  shopItem,
  inventoryItem,
  playerCoins,
  sellPrice,
  onBuy,
  onSell,
}: BuySellPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const itemEffect = getItemEffect(itemDef);

  const maxBuyQuantity =
    shopItem && shopItem.buyPrice > 0
      ? Math.floor(playerCoins / shopItem.buyPrice)
      : 0;
  const maxSellQuantity = inventoryItem?.quantity ?? 0;

  const totalBuyCost = shopItem ? shopItem.buyPrice * quantity : 0;
  const totalSellValue = sellPrice ? sellPrice * quantity : 0;

  const canBuy = mode === "buy" && quantity > 0 && playerCoins >= totalBuyCost;
  const canSell =
    mode === "sell" && quantity > 0 && quantity <= maxSellQuantity;

  const handleQuantityChange = (delta: number) => {
    const maxQty = mode === "buy" ? maxBuyQuantity : maxSellQuantity;
    setQuantity(Math.max(1, Math.min(maxQty, quantity + delta)));
  };

  const handleAction = () => {
    if (mode === "buy" && canBuy) {
      onBuy(quantity);
      setQuantity(1);
    } else if (mode === "sell" && canSell) {
      onSell(quantity);
      setQuantity(1);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{itemDef.icon}</span>
          <div>
            <CardTitle className="text-lg">{itemDef.name}</CardTitle>
            <span className="text-xs text-muted-foreground capitalize">
              {itemDef.rarity} {itemDef.category}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{itemDef.description}</p>

        {/* Item effect */}
        {itemEffect && (
          <p className="text-sm font-medium text-primary">{itemEffect}</p>
        )}

        {/* Price info */}
        <div className="flex justify-between text-sm">
          {mode === "buy" && shopItem && (
            <>
              <span>Price each:</span>
              <span className="text-yellow-600 dark:text-yellow-400">
                🪙 {shopItem.buyPrice}
              </span>
            </>
          )}
          {mode === "sell" && (
            <>
              <span>Sell price each:</span>
              <span className="text-yellow-600 dark:text-yellow-400">
                🪙 {sellPrice ?? 0}
              </span>
            </>
          )}
        </div>

        {/* Quantity selector */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(-10)}
            disabled={quantity <= 1}
          >
            -10
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
          >
            -1
          </Button>
          <span className="text-xl font-bold w-12 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(1)}
            disabled={
              quantity >= (mode === "buy" ? maxBuyQuantity : maxSellQuantity)
            }
          >
            +1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(10)}
            disabled={
              quantity >= (mode === "buy" ? maxBuyQuantity : maxSellQuantity)
            }
          >
            +10
          </Button>
        </div>

        {/* Total and action */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              🪙 {mode === "buy" ? totalBuyCost : totalSellValue}
            </span>
          </div>
          <Button
            onClick={handleAction}
            disabled={mode === "buy" ? !canBuy : !canSell}
          >
            {mode === "buy" ? "Buy" : "Sell"}
          </Button>
        </div>

        {/* Available info */}
        <div className="text-xs text-muted-foreground text-center">
          {mode === "buy" && maxBuyQuantity > 0 && (
            <span>You can afford up to {maxBuyQuantity}</span>
          )}
          {mode === "buy" && maxBuyQuantity === 0 && (
            <span className="text-red-500">Not enough coins</span>
          )}
          {mode === "sell" && inventoryItem && (
            <span>You have {inventoryItem.quantity} to sell</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
