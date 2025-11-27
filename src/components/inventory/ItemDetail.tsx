/**
 * Detail panel for displaying item information.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TICK_DURATION_MS, toDisplay } from "@/game/types/common";
import type { ItemCategory, Rarity } from "@/game/types/constants";
import type { InventoryItem } from "@/game/types/gameState";
import type { Item } from "@/game/types/item";

interface ItemDetailProps {
  inventoryItem: InventoryItem;
  itemDef: Item;
}

/**
 * Get display text for item category.
 * Includes mappings for future item types (medicine, battle, equipment, material, key).
 */
function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    food: "Food",
    drink: "Drink",
    toy: "Toy",
    cleaning: "Cleaning",
    medicine: "Medicine",
    battle: "Battle Item",
    equipment: "Equipment",
    material: "Material",
    key: "Key Item",
  };
  return labels[category];
}

/**
 * Get display text for item rarity.
 */
function getRarityLabel(rarity: Rarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Get CSS class for rarity text color.
 */
function getRarityTextClass(rarity: Rarity): string {
  switch (rarity) {
    case "common":
      return "text-muted-foreground";
    case "uncommon":
      return "text-green-600 dark:text-green-400";
    case "rare":
      return "text-blue-600 dark:text-blue-400";
    case "epic":
      return "text-purple-600 dark:text-purple-400";
    case "legendary":
      return "text-yellow-600 dark:text-yellow-400";
  }
}

/**
 * Format ticks as a human-readable time string.
 */
function formatTicksAsTime(ticks: number): string {
  const totalMinutes = Math.floor((ticks * TICK_DURATION_MS) / (1000 * 60));
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Get item-specific stat details.
 */
function getItemStats(itemDef: Item): { label: string; value: string }[] {
  const stats: { label: string; value: string }[] = [];

  switch (itemDef.category) {
    case "food":
      stats.push({
        label: "Satiety",
        value: `+${toDisplay(itemDef.satietyRestore)}%`,
      });
      if (itemDef.poopAcceleration) {
        stats.push({
          label: "Poop Speed",
          value: `+${formatTicksAsTime(itemDef.poopAcceleration)}`,
        });
      }
      break;
    case "drink":
      stats.push({
        label: "Hydration",
        value: `+${toDisplay(itemDef.hydrationRestore)}%`,
      });
      if (itemDef.energyRestore) {
        stats.push({
          label: "Energy",
          value: `+${toDisplay(itemDef.energyRestore)}%`,
        });
      }
      break;
    case "toy":
      stats.push({
        label: "Happiness",
        value: `+${toDisplay(itemDef.happinessRestore)}%`,
      });
      stats.push({
        label: "Durability",
        value: `${itemDef.maxDurability} uses`,
      });
      break;
    case "cleaning":
      stats.push({
        label: "Poop Removed",
        value: `${itemDef.poopRemoved}`,
      });
      break;
    default:
      // Future item types (medicine, battle, equipment, material, key) will be handled here
      break;
  }

  return stats;
}

/**
 * Display detailed information about a selected item.
 */
export function ItemDetail({ inventoryItem, itemDef }: ItemDetailProps) {
  const durability = inventoryItem.currentDurability;
  const maxDurability =
    itemDef.category === "toy" ? itemDef.maxDurability : undefined;
  const stats = getItemStats(itemDef);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{itemDef.icon}</span>
          <div>
            <CardTitle className="text-lg">{itemDef.name}</CardTitle>
            <div className="flex gap-2 text-sm">
              <span className="text-muted-foreground">
                {getCategoryLabel(itemDef.category)}
              </span>
              <span className={getRarityTextClass(itemDef.rarity)}>
                {getRarityLabel(itemDef.rarity)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{itemDef.description}</p>

        {/* Quantity/Durability */}
        <div className="flex gap-4 text-sm">
          {durability !== null && maxDurability !== undefined ? (
            <div>
              <span className="text-muted-foreground">Durability: </span>
              <span className="font-medium">
                {durability}/{maxDurability}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-muted-foreground">Quantity: </span>
              <span className="font-medium">{inventoryItem.quantity}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Sell: </span>
            <span className="font-medium">{itemDef.sellValue} coins</span>
          </div>
        </div>

        {/* Item Stats */}
        {stats.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Effects</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <span className="text-muted-foreground">{stat.label}: </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
