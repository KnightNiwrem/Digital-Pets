// Item category tabs for filtering inventory

import { Button } from "@/components/ui/button";
import { ItemSystem } from "@/systems/ItemSystem";
import type { Inventory } from "@/types/Item";
import { Package, Apple, Droplets, Pill, CircleDot, Wrench } from "lucide-react";

interface ItemCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  inventory: Inventory;
}

export function ItemCategoryTabs({ activeCategory, onCategoryChange, inventory }: ItemCategoryTabsProps) {
  const categories = ItemSystem.getItemsByCategory(inventory);

  const categoryInfo = [
    {
      id: "all",
      name: "All",
      icon: Package,
      count: inventory.slots.length,
    },
    {
      id: "food",
      name: "Food",
      icon: Apple,
      count: categories.food.length,
    },
    {
      id: "drinks",
      name: "Drinks",
      icon: Droplets,
      count: categories.drinks.length,
    },
    {
      id: "medicine",
      name: "Medicine",
      icon: Pill,
      count: categories.medicine.length,
    },
    {
      id: "toys",
      name: "Toys",
      icon: CircleDot,
      count: categories.toys.length,
    },
    {
      id: "equipment",
      name: "Equipment",
      icon: Wrench,
      count: categories.equipment.length,
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {categoryInfo.map(({ id, name, icon: Icon, count }) => (
        <Button
          key={id}
          variant={activeCategory === id ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onCategoryChange(id)}
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          <span>{name}</span>
          {count > 0 && <span className="bg-muted-foreground/20 text-xs px-1.5 py-0.5 rounded-full">{count}</span>}
        </Button>
      ))}
    </div>
  );
}
