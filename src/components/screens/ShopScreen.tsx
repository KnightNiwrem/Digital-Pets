/**
 * Shop screen for buying and selling items with merchants.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BuySellPanel, ShopInventory } from "@/components/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { findInventoryItem } from "@/game/core/inventory";
import { buyItem, calculateSellPrice, sellItem } from "@/game/core/shop";
import { getItemById } from "@/game/data/items";
import { getNpc } from "@/game/data/npcs";
import { getShopForNpc } from "@/game/data/shops";
import { useGameState } from "@/game/hooks/useGameState";
import type { InventoryItem } from "@/game/types/gameState";
import type { Item } from "@/game/types/item";
import { cn } from "@/lib/utils";

interface ShopScreenProps {
  npcId: string;
  onClose: () => void;
}

/**
 * Full shop interface for buying and selling items.
 */
export function ShopScreen({ npcId, onClose }: ShopScreenProps) {
  const { state, actions } = useGameState();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [message, setMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const npc = getNpc(npcId);
  const shop = npc?.shopId ? getShopForNpc(npc.shopId) : undefined;
  const playerCoins = state?.player.currency.coins ?? 0;

  // Clear message timeout on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current !== null) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Helper to show temporary message
  const showMessage = useCallback((msg: string) => {
    if (messageTimeoutRef.current !== null) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage(msg);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null);
      messageTimeoutRef.current = null;
    }, 2000);
  }, []);

  // Get shop items with their definitions
  const shopItems = useMemo(() => {
    if (!shop) return [];
    return shop.items
      .map((shopItem) => ({
        shopItem,
        itemDef: getItemById(shopItem.itemId),
      }))
      .filter(
        (item): item is { shopItem: typeof item.shopItem; itemDef: Item } =>
          item.itemDef !== undefined,
      );
  }, [shop]);

  // Get player's sellable items (stackable items with quantity > 0)
  const sellableItems = useMemo(() => {
    if (!state || !shop) return [];
    return state.player.inventory.items.reduce<
      Array<{
        inventoryItem: InventoryItem;
        itemDef: Item;
        sellPrice: number;
      }>
    >((acc, invItem) => {
      const itemDef = getItemById(invItem.itemId);
      // Only allow selling stackable items (not durability-based like toys)
      if (itemDef?.stackable && invItem.quantity > 0) {
        acc.push({
          inventoryItem: invItem,
          itemDef,
          sellPrice: calculateSellPrice(shop.id, invItem.itemId),
        });
      }
      return acc;
    }, []);
  }, [state, shop]);

  // Get selected item details
  const selectedShopItem = useMemo(() => {
    if (!selectedItemId || activeTab !== "buy") return undefined;
    return shopItems.find((item) => item.shopItem.itemId === selectedItemId);
  }, [selectedItemId, activeTab, shopItems]);

  const selectedSellItem = useMemo(() => {
    if (!selectedItemId || activeTab !== "sell") return undefined;
    return sellableItems.find(
      (item) => item.inventoryItem.itemId === selectedItemId,
    );
  }, [selectedItemId, activeTab, sellableItems]);

  // Handle buying
  const handleBuy = useCallback(
    (quantity: number) => {
      if (!state || !shop || !selectedItemId) return;

      const { result, state: newState } = buyItem(
        state,
        shop.id,
        selectedItemId,
        quantity,
      );

      if (result.success) {
        actions.updateState(() => newState);
      }
      showMessage(result.message);
    },
    [state, shop, selectedItemId, actions, showMessage],
  );

  // Handle selling
  const handleSell = useCallback(
    (quantity: number) => {
      if (!state || !shop || !selectedItemId) return;

      const { result, state: newState } = sellItem(
        state,
        shop.id,
        selectedItemId,
        quantity,
      );

      if (result.success) {
        actions.updateState(() => newState);
        // Clear selection if all items sold
        const remaining = findInventoryItem(
          newState.player.inventory,
          selectedItemId,
        );
        if (!remaining || remaining.quantity === 0) {
          setSelectedItemId(null);
        }
      }
      showMessage(result.message);
    },
    [state, shop, selectedItemId, actions, showMessage],
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "buy" | "sell");
    setSelectedItemId(null);
  };

  if (!npc || !shop) {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-muted-foreground text-center">Shop not found.</p>
          <Button className="w-full mt-4" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Shop Header */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{npc.emoji}</span>
              <div>
                <CardTitle className="text-lg">{shop.name}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {npc.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span>🪙</span>
                <span className="font-bold">{playerCoins}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close shop"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Message display */}
      {message && (
        <Card className="bg-primary/10 border-primary">
          <CardContent className="py-2 text-center text-sm">
            {message}
          </CardContent>
        </Card>
      )}

      {/* Buy/Sell Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Items for Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <ShopInventory
                items={shopItems}
                selectedItemId={selectedItemId}
                playerCoins={playerCoins}
                onSelectItem={setSelectedItemId}
              />
            </CardContent>
          </Card>

          {selectedShopItem && (
            <BuySellPanel
              mode="buy"
              itemDef={selectedShopItem.itemDef}
              shopItem={selectedShopItem.shopItem}
              playerCoins={playerCoins}
              onBuy={handleBuy}
              onSell={() => {}}
            />
          )}
        </TabsContent>

        <TabsContent value="sell" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Items</CardTitle>
            </CardHeader>
            <CardContent>
              {sellableItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No items to sell.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {sellableItems.map(
                    ({ inventoryItem, itemDef, sellPrice }) => {
                      const isSelected =
                        selectedItemId === inventoryItem.itemId;

                      return (
                        <button
                          key={inventoryItem.itemId}
                          type="button"
                          onClick={() =>
                            setSelectedItemId(inventoryItem.itemId)
                          }
                          aria-label={`Select ${itemDef.name}`}
                          className={cn(
                            "relative flex flex-col items-center justify-center gap-1 p-2 rounded-lg border-2 transition-all hover:bg-accent",
                            isSelected && "ring-2 ring-primary bg-primary/10",
                          )}
                        >
                          <span className="text-2xl">{itemDef.icon}</span>
                          <span className="text-xs font-medium truncate max-w-full">
                            {itemDef.name}
                          </span>
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            🪙 {sellPrice}
                          </span>
                          <span className="absolute top-1 right-1 text-xs bg-background/80 px-1 rounded">
                            ×{inventoryItem.quantity}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSellItem && (
            <BuySellPanel
              mode="sell"
              itemDef={selectedSellItem.itemDef}
              inventoryItem={selectedSellItem.inventoryItem}
              playerCoins={playerCoins}
              sellPrice={selectedSellItem.sellPrice}
              onBuy={() => {}}
              onSell={handleSell}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Back button */}
      <Button variant="outline" className="w-full" onClick={onClose}>
        Leave Shop
      </Button>
    </div>
  );
}
