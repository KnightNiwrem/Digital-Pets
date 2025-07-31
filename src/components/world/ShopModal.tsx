// Shop Modal - displays shop interface in a modal dialog

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ShopPanel } from "./ShopPanel";
import { getNpcById } from "@/data/locations";
import type { Shop, Pet, Inventory } from "@/types";

interface ShopModalProps {
  shop: Shop;
  pet: Pet;
  inventory: Inventory;
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (itemId: string, quantity: number, price: number) => void;
  onSellItem: (itemId: string, quantity: number, price: number) => void;
}

export function ShopModal({ shop, pet, inventory, isOpen, onClose, onBuyItem, onSellItem }: ShopModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{shop.name}</h2>
            <p className="text-sm text-gray-600">Shopkeeper: {getNpcById(shop.keeper)?.name || shop.keeper}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="ml-4">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-4">
            <ShopPanel
              shop={shop}
              pet={pet}
              inventory={inventory}
              onBuyItem={onBuyItem}
              onSellItem={onSellItem}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
