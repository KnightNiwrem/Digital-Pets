// Pet care panel with action buttons for feeding, playing, etc.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import type { Pet, Result, Inventory } from "@/types";
import { PetValidator, InventoryUtils, TextUtils, ItemEffectUtils } from "@/lib/utils";

interface PetCarePanelProps {
  pet: Pet;
  inventory: Inventory;
  isLoading: boolean;
  onFeedWithItem: (itemId: string) => Promise<Result<void>>;
  onDrinkWithItem: (itemId: string) => Promise<Result<void>>;
  onPlayWithItem: (itemId: string) => Promise<Result<void>>;
  onCleanWithItem: (itemId: string) => Promise<Result<void>>;
  onTreatWithItem: (itemId: string) => Promise<Result<void>>;
  onToggleSleep: () => Promise<Result<void>>;
}

export function PetCarePanel({
  pet,
  inventory,
  isLoading,
  onFeedWithItem,
  onDrinkWithItem,
  onPlayWithItem,
  onCleanWithItem,
  onTreatWithItem,
  onToggleSleep,
}: PetCarePanelProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string; show: boolean } | null>(
    null
  );

  // Helper to handle actions with loading states and feedback
  const handleAction = async (actionName: string, action: () => Promise<Result<void>>) => {
    setActionLoading(actionName);
    setToastMessage(null);

    try {
      const result = await action();

      if (result.success) {
        setToastMessage({ type: "success", text: `${actionName} successful!`, show: true });
      } else {
        setToastMessage({ type: "error", text: result.error || `${actionName} failed`, show: true });
      }
    } catch (error) {
      setToastMessage({
        type: "error",
        text: error instanceof Error ? error.message : `${actionName} failed`,
        show: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToastClose = () => {
    setToastMessage(null);
  };

  // Use utility functions instead of duplicated filtering logic
  const foodItems = InventoryUtils.getFoodItems(inventory);
  const drinkItems = InventoryUtils.getDrinkItems(inventory);
  const happinessItems = InventoryUtils.getHappinessItems(inventory);
  const cleaningItems = InventoryUtils.getCleaningItems(inventory);
  const medicineItems = InventoryUtils.getMedicineItems(inventory);

  const canFeed = pet.satiety < 100 && !PetValidator.validateCareAction(pet, "feed") && foodItems.length > 0;
  const canDrink = pet.hydration < 100 && !PetValidator.validateCareAction(pet, "drink") && drinkItems.length > 0;
  const canPlay = pet.happiness < 100 && !PetValidator.validateCareAction(pet, "play", 10) && happinessItems.length > 0;
  const canClean =
    pet.poopTicksLeft <= 0 &&
    pet.state !== "exploring" &&
    pet.state !== "sleeping" &&
    pet.state !== "travelling" &&
    cleaningItems.length > 0;
  const canTreat =
    PetValidator.isUnhealthy(pet) &&
    !PetValidator.isExploring(pet) &&
    !PetValidator.isSleeping(pet) &&
    medicineItems.length > 0;
  // Separate logic for sleep vs wake actions
  const canSleep = pet.state !== "sleeping" && !PetValidator.validateSleepAction(pet);
  const canWake = PetValidator.isSleeping(pet);
  const canToggleSleep = canSleep || canWake;

  return (
    <>
      {/* Toast Notification - positioned at top of screen */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          show={toastMessage.show}
          onClose={handleToastClose}
          duration={3000}
        />
      )}

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Pet Care</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Basic Care Actions - Now Item-Based */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Basic Care</h3>

            <div className="space-y-3">
              {/* Feed Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">🍖 Feed Pet</span>
                  <span className="text-xs text-muted-foreground">
                    {TextUtils.formatItemCount(foodItems.length, "food item")}
                  </span>
                </div>
                {canFeed ? (
                  <div className="grid grid-cols-1 gap-2">
                    {foodItems.slice(0, 3).map(item => (
                      <Button
                        key={item.id}
                        onClick={() => handleAction(`Feed ${item.name}`, () => onFeedWithItem(item.id))}
                        disabled={isLoading || actionLoading !== null}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-xs text-green-600">
                            +{ItemEffectUtils.getEffectValue(item, "satiety")} Satiety
                          </span>
                        </span>
                        {actionLoading === `Feed ${item.name}` ? "..." : "Use"}
                      </Button>
                    ))}
                    {foodItems.length > 3 && (
                      <span className="text-xs text-muted-foreground text-center">
                        +{foodItems.length - 3} more in inventory
                      </span>
                    )}
                  </div>
                ) : (
                  <Button disabled variant="outline" size="sm" className="w-full">
                    {foodItems.length === 0 ? "No Food Items" : pet.satiety >= 100 ? "Pet Full" : "Cannot Feed"}
                  </Button>
                )}
              </div>

              {/* Drink Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">💧 Give Drink</span>
                  <span className="text-xs text-muted-foreground">
                    {TextUtils.formatItemCount(drinkItems.length, "drink item")}
                  </span>
                </div>
                {canDrink ? (
                  <div className="grid grid-cols-1 gap-2">
                    {drinkItems.slice(0, 3).map(item => (
                      <Button
                        key={item.id}
                        onClick={() => handleAction(`Give ${item.name}`, () => onDrinkWithItem(item.id))}
                        disabled={isLoading || actionLoading !== null}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-xs text-blue-600">
                            +{ItemEffectUtils.getEffectValue(item, "hydration")} Hydration
                          </span>
                        </span>
                        {actionLoading === `Give ${item.name}` ? "..." : "Use"}
                      </Button>
                    ))}
                    {drinkItems.length > 3 && (
                      <span className="text-xs text-muted-foreground text-center">
                        +{drinkItems.length - 3} more in inventory
                      </span>
                    )}
                  </div>
                ) : (
                  <Button disabled variant="outline" size="sm" className="w-full">
                    {drinkItems.length === 0
                      ? "No Drink Items"
                      : pet.hydration >= 100
                        ? "Pet Hydrated"
                        : "Cannot Give Drink"}
                  </Button>
                )}
              </div>

              {/* Play Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">🎾 Play with Pet</span>
                  <span className="text-xs text-muted-foreground">
                    {TextUtils.formatItemCount(happinessItems.length, "toy/fun item")}
                  </span>
                </div>
                {canPlay ? (
                  <div className="grid grid-cols-1 gap-2">
                    {happinessItems.slice(0, 3).map(item => (
                      <Button
                        key={item.id}
                        onClick={() => handleAction(`Play with ${item.name}`, () => onPlayWithItem(item.id))}
                        disabled={isLoading || actionLoading !== null}
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-xs text-purple-600">
                            +{ItemEffectUtils.getEffectValue(item, "happiness")} Happiness
                          </span>
                        </span>
                        {actionLoading === `Play with ${item.name}` ? "..." : "Use"}
                      </Button>
                    ))}
                    {happinessItems.length > 3 && (
                      <span className="text-xs text-muted-foreground text-center">
                        +{happinessItems.length - 3} more in inventory
                      </span>
                    )}
                  </div>
                ) : (
                  <Button disabled variant="outline" size="sm" className="w-full">
                    {happinessItems.length === 0 ? "No Fun Items" : pet.happiness >= 100 ? "Pet Happy" : "Cannot Play"}
                  </Button>
                )}
              </div>

              {/* Clean Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">🧹 Clean Pet</span>
                  <span className="text-xs text-muted-foreground">
                    {TextUtils.formatItemCount(cleaningItems.length, "cleaning item")}
                  </span>
                </div>
                {canClean ? (
                  <div className="grid grid-cols-1 gap-2">
                    {cleaningItems.slice(0, 3).map(item => (
                      <Button
                        key={item.id}
                        onClick={() => handleAction(`Clean with ${item.name}`, () => onCleanWithItem(item.id))}
                        disabled={isLoading || actionLoading !== null}
                        variant="destructive"
                        size="sm"
                        className="w-full justify-between text-left"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <span className="text-xs text-yellow-600">Clean Pet</span>
                        </span>
                        {actionLoading === `Clean with ${item.name}` ? "..." : "Use"}
                      </Button>
                    ))}
                    {cleaningItems.length > 3 && (
                      <span className="text-xs text-muted-foreground text-center">
                        +{cleaningItems.length - 3} more in inventory
                      </span>
                    )}
                  </div>
                ) : (
                  <Button disabled variant="outline" size="sm" className="w-full">
                    {cleaningItems.length === 0
                      ? "No Cleaning Items"
                      : pet.poopTicksLeft > 0
                        ? "No Poop to Clean"
                        : "Cannot Clean"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sleep Control */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Rest</h3>

            <Button
              onClick={() => handleAction(PetValidator.isSleeping(pet) ? "Wake Up" : "Sleep", onToggleSleep)}
              disabled={!canToggleSleep || isLoading || actionLoading !== null}
              variant={PetValidator.isSleeping(pet) ? "secondary" : "default"}
              size="sm"
              className="w-full"
            >
              {actionLoading === "Sleep" || actionLoading === "Wake Up"
                ? "..."
                : PetValidator.isSleeping(pet)
                  ? "☀️ Wake Up"
                  : "😴 Sleep"}
            </Button>
          </div>

          {/* Medical Care */}
          {canTreat && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Medical Care</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">💊 Treat Pet</span>
                  <span className="text-xs text-muted-foreground">
                    {TextUtils.formatItemCount(medicineItems.length, "medicine item")}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {medicineItems.map(item => (
                    <Button
                      key={item.id}
                      onClick={() => handleAction(`Treat with ${item.name}`, () => onTreatWithItem(item.id))}
                      disabled={isLoading || actionLoading !== null}
                      variant="default"
                      size="sm"
                      className="w-full justify-between text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-xs text-green-600">
                          {ItemEffectUtils.hasEffectType(item, "cure")
                            ? "Cure Disease"
                            : `+${ItemEffectUtils.getEffectValue(item, "health")} Health`}
                        </span>
                      </span>
                      {actionLoading === `Treat with ${item.name}` ? "..." : "Use"}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pet State Info */}
          <div className="text-center p-2 bg-muted rounded">
            <p className="text-sm text-muted-foreground">
              Current State: <span className="font-medium">{pet.state}</span>
            </p>
            {PetValidator.isTravelling(pet) && (
              <p className="text-xs text-amber-600 mt-1">Pet is travelling - limited actions available</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-1 bg-muted rounded">
              <div className="font-medium">Energy</div>
              <div>
                {pet.currentEnergy}/{pet.maxEnergy}
              </div>
            </div>
            <div className="p-1 bg-muted rounded">
              <div className="font-medium">Stage</div>
              <div>{pet.growthStage + 1}</div>
            </div>
            <div className="p-1 bg-muted rounded">
              <div className="font-medium">Health</div>
              <div className={`${PetValidator.isHealthy(pet) ? "text-green-600" : "text-red-600"}`}>{pet.health}</div>
            </div>
          </div>

          {/* Action Tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 Tips:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Use food items from inventory to feed your pet</li>
              <li>Use toys and fun items to play and increase happiness</li>
              <li>Sleep restores energy over time</li>
              <li>Use cleaning items to clean poop and prevent sickness</li>
              <li>Buy more items from shops when inventory is low</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
