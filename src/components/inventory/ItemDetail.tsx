/**
 * Detail panel for displaying item information.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryItem } from "@/game/types/gameState";
import type { Item } from "@/game/types/item";

interface ItemDetailProps {
  inventoryItem: InventoryItem;
  itemDef: Item;
}

/**
 * Get display text for item category.
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
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
  return labels[category] ?? category;
}

/**
 * Get display text for item rarity.
 */
function getRarityLabel(rarity: string): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

/**
 * Get CSS class for rarity text color.
 */
function getRarityTextClass(rarity: string): string {
  switch (rarity) {
    case "uncommon":
      return "text-green-600 dark:text-green-400";
    case "rare":
      return "text-blue-600 dark:text-blue-400";
    case "epic":
      return "text-purple-600 dark:text-purple-400";
    case "legendary":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-muted-foreground";
  }
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
        value: `+${(itemDef.satietyRestore / 1_000_000).toFixed(0)}%`,
      });
      if (itemDef.poopAcceleration) {
        stats.push({
          label: "Poop Speed",
          value: `+${itemDef.poopAcceleration} ticks`,
        });
      }
      break;
    case "drink":
      stats.push({
        label: "Hydration",
        value: `+${(itemDef.hydrationRestore / 1_000_000).toFixed(0)}%`,
      });
      if (itemDef.energyRestore) {
        stats.push({
          label: "Energy",
          value: `+${(itemDef.energyRestore / 1_000_000).toFixed(0)}%`,
        });
      }
      break;
    case "toy":
      stats.push({
        label: "Happiness",
        value: `+${(itemDef.happinessRestore / 1_000_000).toFixed(0)}%`,
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
