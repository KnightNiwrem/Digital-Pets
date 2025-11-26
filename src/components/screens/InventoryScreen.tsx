/**
 * Inventory screen for viewing and managing items.
 */

import { useState } from "react";
import { ItemDetail } from "@/components/inventory/ItemDetail";
import { ItemGrid } from "@/components/inventory/ItemGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getItemById } from "@/game/data/items";
import { useGameState } from "@/game/hooks/useGameState";
import { ItemCategory } from "@/game/types/constants";
import type { InventoryItem } from "@/game/types/gameState";

/**
 * Category filter options for inventory.
 */
const CATEGORY_FILTERS: {
  id: "all" | keyof typeof ItemCategory;
  label: string;
  icon: string;
}[] = [
  { id: "all", label: "All", icon: "📦" },
  { id: "Food", label: "Food", icon: "🍎" },
  { id: "Drink", label: "Drink", icon: "🥤" },
  { id: "Toy", label: "Toys", icon: "🧸" },
  { id: "Cleaning", label: "Clean", icon: "🧹" },
];

/**
 * Main inventory screen showing all items with filtering and details.
 */
export function InventoryScreen() {
  const { state, isLoading } = useGameState();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | keyof typeof ItemCategory
  >("all");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No game state found.</p>
      </div>
    );
  }

  const inventory = state.player.inventory;

  // Filter items by category
  const filteredItems: InventoryItem[] =
    categoryFilter === "all"
      ? inventory.items
      : inventory.items.filter((invItem) => {
          const itemDef = getItemById(invItem.itemId);
          return (
            itemDef?.category ===
            ItemCategory[categoryFilter as keyof typeof ItemCategory]
          );
        });

  // Get selected item details
  const selectedItem =
    selectedIndex !== null ? filteredItems[selectedIndex] : null;
  const selectedItemDef = selectedItem
    ? getItemById(selectedItem.itemId)
    : null;

  // Reset selection when filter changes and selected item is no longer visible
  const handleFilterChange = (filter: "all" | keyof typeof ItemCategory) => {
    setCategoryFilter(filter);
    setSelectedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with coin display */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Inventory</CardTitle>
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <span className="text-lg">🪙</span>
              <span className="font-medium">{state.player.currency.coins}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Category Filters */}
          <div className="flex gap-1 overflow-x-auto pb-2">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                type="button"
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap ${
                  categoryFilter === filter.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Item Grid */}
      <Card>
        <CardContent className="pt-4">
          <ItemGrid
            items={filteredItems}
            selectedIndex={selectedIndex}
            onSelectItem={setSelectedIndex}
          />
        </CardContent>
      </Card>

      {/* Item Detail Panel */}
      {selectedItem && selectedItemDef && (
        <ItemDetail inventoryItem={selectedItem} itemDef={selectedItemDef} />
      )}
    </div>
  );
}
