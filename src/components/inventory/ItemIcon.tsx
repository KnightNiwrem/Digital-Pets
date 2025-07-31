// Item icon component for displaying item visuals

import { cn, ItemEffectUtils } from "@/lib/utils";
import type { Item } from "@/types/Item";
import { Apple, Droplets, Heart, Pill, Sparkles, Zap, CircleDot, Fish, Utensils } from "lucide-react";

interface ItemIconProps {
  item: Item;
  className?: string;
}

export function ItemIcon({ item, className }: ItemIconProps) {
  // Map item IDs to icons (placeholder system)
  const getItemIcon = () => {
    switch (item.id) {
      case "apple":
        return <Apple className="text-red-500" />;
      case "berry":
        return <CircleDot className="text-purple-500" />;
      case "fish":
        return <Fish className="text-blue-500" />;
      case "rare_fish":
        return <Fish className="text-yellow-500" />;
      case "water_bottle":
        return <Droplets className="text-blue-500" />;
      case "basic_medicine":
        return <Pill className="text-green-500" />;
      case "herb":
        return <Heart className="text-green-600" />;
      case "soap":
        return <Sparkles className="text-cyan-500" />;
      case "energy_drink":
        return <Zap className="text-yellow-500" />;
      case "ball":
        return <CircleDot className="text-orange-500" />;
      case "fishing_rod":
        return <Utensils className="text-amber-700" />;
      case "bait":
        return <CircleDot className="text-green-700" />;
      default:
        // Generic icon based on item type
        return getTypeIcon();
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case "consumable":
        if (ItemEffectUtils.hasEffectType(item, "satiety")) {
          return <Apple className="text-red-500" />;
        }
        if (ItemEffectUtils.hasEffectType(item, "hydration")) {
          return <Droplets className="text-blue-500" />;
        }
        return <CircleDot className="text-gray-500" />;
      case "medicine":
        return <Pill className="text-green-500" />;
      case "hygiene":
        return <Sparkles className="text-cyan-500" />;
      case "energy_booster":
        return <Zap className="text-yellow-500" />;
      case "toy":
        return <CircleDot className="text-orange-500" />;
      case "equipment":
        return <Utensils className="text-gray-600" />;
      default:
        return <CircleDot className="text-gray-400" />;
    }
  };

  return <div className={cn("flex items-center justify-center", className)}>{getItemIcon()}</div>;
}
