// Shop Panel - interface for buying and selling items with NPCs

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Coins, Package } from "lucide-react";
import type { Shop, Pet, Inventory, Item, InventorySlot } from "@/types";
import { getItemById } from "@/data/items";
interface ShopPanelProps {
  shop: Shop;
  pet: Pet;
  inventory: Inventory;
  onBuyItem: (itemId: string, quantity: number, price: number) => void;
  onSellItem: (itemId: string, quantity: number, price: number) => void;
  disabled?: boolean;
}

export function ShopPanel({ shop, inventory, onBuyItem, onSellItem, disabled = false }: ShopPanelProps) {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          {shop.name}
        </CardTitle>
        <p className="text-sm text-gray-600">{shop.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <Coins className="h-4 w-4" />
          <span className="font-medium">{inventory.gold} gold</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tab Selection */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "buy" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("buy")}
            disabled={disabled}
          >
            Buy Items
          </Button>
          <Button
            variant={activeTab === "sell" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("sell")}
            disabled={disabled}
          >
            Sell Items
          </Button>
        </div>

        <Separator className="mb-4" />

        {/* Buy Tab */}
        {activeTab === "buy" && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Available Items</h4>
            {shop.items.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No items available</div>
            ) : (
              <div className="space-y-2">
                {shop.items.map(shopItem => {
                  const item = getItemById(shopItem.itemId);
                  if (!item) return null;

                  const canAfford = inventory.gold >= shopItem.price;
                  const inStock = shopItem.stock === -1 || shopItem.stock > 0;

                  return (
                    <ShopItemRow
                      key={shopItem.itemId}
                      item={item}
                      price={shopItem.price}
                      stock={shopItem.stock}
                      canAfford={canAfford}
                      inStock={inStock}
                      onBuy={quantity => onBuyItem(item.id, quantity, shopItem.price)}
                      disabled={disabled || !canAfford || !inStock}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sell Tab */}
        {activeTab === "sell" && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-600 uppercase tracking-wide">Your Items</h4>
            {inventory.slots.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No items to sell</div>
            ) : (
              <div className="space-y-2">
                {inventory.slots.map(slot => {
                  const sellPrice = Math.floor(slot.item.value * 0.5); // 50% of value

                  return (
                    <InventoryItemRow
                      key={slot.slotIndex}
                      slot={slot}
                      sellPrice={sellPrice}
                      onSell={quantity => onSellItem(slot.item.id, quantity, sellPrice)}
                      disabled={disabled}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sub-component for shop items (buying)
interface ShopItemRowProps {
  item: Item;
  price: number;
  stock: number;
  canAfford: boolean;
  inStock: boolean;
  onBuy: (quantity: number) => void;
  disabled: boolean;
}

function ShopItemRow({ item, price, stock, canAfford, inStock, onBuy, disabled }: ShopItemRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">{item.name}</h5>
          <Badge variant="secondary" className="text-xs">
            {item.rarity}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{item.description}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>Price: {price} gold</span>
          {stock !== -1 && <span>Stock: {stock}</span>}
          {stock === -1 && <span>Unlimited stock</span>}
        </div>
      </div>
      <Button size="sm" onClick={() => onBuy(1)} disabled={disabled || !canAfford || !inStock} className="ml-4">
        <Coins className="h-4 w-4 mr-1" />
        Buy
      </Button>
    </div>
  );
}

// Sub-component for inventory items (selling)
interface InventoryItemRowProps {
  slot: InventorySlot;
  sellPrice: number;
  onSell: (quantity: number) => void;
  disabled: boolean;
}

function InventoryItemRow({ slot, sellPrice, onSell, disabled }: InventoryItemRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="font-medium">{slot.item.name}</h5>
          <Badge variant="secondary" className="text-xs">
            {slot.item.rarity}
          </Badge>
          {slot.quantity > 1 && (
            <Badge variant="outline" className="text-xs">
              x{slot.quantity}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">{slot.item.description}</p>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>Sell for: {sellPrice} gold</span>
          <span>Value: {slot.item.value} gold</span>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={() => onSell(1)} disabled={disabled} className="ml-4">
        <Package className="h-4 w-4 mr-1" />
        Sell
      </Button>
    </div>
  );
}
