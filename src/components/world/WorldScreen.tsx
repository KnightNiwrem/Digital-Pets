// World Screen - main interface for world exploration

import { useState } from "react";
import { WorldMap } from "./WorldMap";
import { ActivitiesPanel } from "./ActivitiesPanel";
import { ShopModal } from "./ShopModal";
import { WorldSystem } from "@/systems/WorldSystem";
import type { Pet, WorldState, Inventory } from "@/types";

interface WorldScreenProps {
  pet: Pet;
  worldState: WorldState;
  inventory: Inventory;
  onTravel: (destinationId: string) => void;
  onStartActivity: (activityId: string) => void;
  onCancelActivity: () => void;
  onBuyItem: (itemId: string, quantity: number, price: number) => void;
  onSellItem: (itemId: string, quantity: number, price: number) => void;
  disabled?: boolean;
}

export function WorldScreen({
  pet,
  worldState,
  inventory,
  onTravel,
  onStartActivity,
  onCancelActivity,
  onBuyItem,
  onSellItem,
  disabled = false,
}: WorldScreenProps) {
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const currentShop = currentShopId ? WorldSystem.getShopById(worldState, currentShopId) : null;

  const handleOpenShop = (shopId: string) => {
    setCurrentShopId(shopId);
  };

  const handleCloseShop = () => {
    setCurrentShopId(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* World Map - Left Side */}
        <div className="w-full">
          <WorldMap pet={pet} worldState={worldState} onTravel={onTravel} disabled={disabled} />
        </div>

        {/* Activities Panel - Right Side */}
        <div className="w-full">
          <ActivitiesPanel
            pet={pet}
            worldState={worldState}
            onStartActivity={onStartActivity}
            onCancelActivity={onCancelActivity}
            onOpenShop={handleOpenShop}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Shop Modal */}
      {currentShop && (
        <ShopModal
          shop={currentShop}
          pet={pet}
          inventory={inventory}
          isOpen={currentShopId !== null}
          onClose={handleCloseShop}
          onBuyItem={onBuyItem}
          onSellItem={onSellItem}
        />
      )}
    </>
  );
}
