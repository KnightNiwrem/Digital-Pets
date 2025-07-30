// Main inventory screen component

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InventoryGrid } from "./InventoryGrid";
import { ItemDetailsPanel } from "./ItemDetailsPanel";
import { ItemCategoryTabs } from "./ItemCategoryTabs";
import type { Inventory, InventorySlot } from "@/types/Item";
import type { Pet } from "@/types/Pet";
import { Coins, Package, Settings } from "lucide-react";

interface InventoryScreenProps {
  inventory: Inventory;
  pet: Pet;
  onUseItem: (itemId: string) => void;
  onSellItem: (itemId: string, quantity: number) => void;
  onSortInventory: (sortBy: "name" | "value" | "rarity" | "type" | "quantity") => void;
}

export function InventoryScreen({ inventory, pet, onUseItem, onSellItem, onSortInventory }: InventoryScreenProps) {
  const [selectedItem, setSelectedItem] = useState<InventorySlot | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "value" | "rarity" | "type" | "quantity">("name");

  const handleSort = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    onSortInventory(newSortBy);
  };

  const handleItemSelect = (slot: InventorySlot | null) => {
    setSelectedItem(slot);
  };

  const handleUseItem = () => {
    if (selectedItem) {
      onUseItem(selectedItem.item.id);
      // Close item details after use
      setSelectedItem(null);
    }
  };

  const handleSellItem = (quantity: number) => {
    if (selectedItem) {
      onSellItem(selectedItem.item.id, quantity);
      // Update selected item if quantity changed
      if (quantity >= selectedItem.quantity) {
        setSelectedItem(null);
      } else {
        setSelectedItem({
          ...selectedItem,
          quantity: selectedItem.quantity - quantity,
        });
      }
    }
  };

  const availableSlots = inventory.maxSlots - inventory.slots.length;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Main inventory panel */}
      <div className="flex-1 space-y-4">
        {/* Header with gold and stats */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Inventory
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{inventory.gold}</span>
                </div>
                <span>
                  {inventory.slots.length}/{inventory.maxSlots} slots
                </span>
                <span className="text-green-600">{availableSlots} free</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              <ItemCategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                inventory={inventory}
              />
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className={`text-xs whitespace-nowrap ${sortBy === "name" ? "bg-secondary" : ""}`}
                >
                  Name
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("value")}
                  className={`text-xs whitespace-nowrap ${sortBy === "value" ? "bg-secondary" : ""}`}
                >
                  Value
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("rarity")}
                  className={`text-xs whitespace-nowrap ${sortBy === "rarity" ? "bg-secondary" : ""}`}
                >
                  Rarity
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory grid */}
        <Card className="flex-1">
          <CardContent className="p-4">
            <InventoryGrid
              inventory={inventory}
              selectedItem={selectedItem}
              activeCategory={activeCategory}
              onItemSelect={handleItemSelect}
            />
          </CardContent>
        </Card>
      </div>

      {/* Item details side panel */}
      {selectedItem && (
        <div className="w-full lg:w-80">
          <ItemDetailsPanel
            slot={selectedItem}
            pet={pet}
            onUseItem={handleUseItem}
            onSellItem={handleSellItem}
            onClose={() => setSelectedItem(null)}
          />
        </div>
      )}
    </div>
  );
}
