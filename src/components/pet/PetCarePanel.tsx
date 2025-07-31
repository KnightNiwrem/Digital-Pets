// Pet care panel with action buttons for feeding, playing, etc.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import type { Pet, Result, Inventory, Item } from "@/types";
import { PetValidator } from "@/lib/utils";

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

  // Helper functions to get available items for each action type
  const getFoodItems = (): Item[] => {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === "satiety"))
      .map(slot => slot.item);
  };

  const getDrinkItems = (): Item[] => {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === "hydration"))
      .map(slot => slot.item);
  };

  const getHappinessItems = (): Item[] => {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === "happiness"))
      .map(slot => slot.item);
  };

  const getCleaningItems = (): Item[] => {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === "clean"))
      .map(slot => slot.item);
  };

  const getMedicineItems = (): Item[] => {
    return inventory.slots
      .filter(slot => slot.item.effects.some(effect => effect.type === "cure" || effect.type === "health"))
      .map(slot => slot.item);
  };

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

  // Check if actions are available using proper validation and item availability
  const foodItems = getFoodItems();
  const drinkItems = getDrinkItems();
  const happinessItems = getHappinessItems();
  const cleaningItems = getCleaningItems();
  const medicineItems = getMedicineItems();

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
    pet.health !== "healthy" && pet.state !== "exploring" && pet.state !== "sleeping" && medicineItems.length > 0;
  // Separate logic for sleep vs wake actions
  const canSleep = pet.state !== "sleeping" && !PetValidator.validateSleepAction(pet);
  const canWake = pet.state === "sleeping";
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
                    {foodItems.length} food item{foodItems.length !== 1 ? "s" : ""} available
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
                            +{item.effects.find(e => e.type === "satiety")?.value || 0} Satiety
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
                    {drinkItems.length} drink item{drinkItems.length !== 1 ? "s" : ""} available
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
                            +{item.effects.find(e => e.type === "hydration")?.value || 0} Hydration
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
                    {happinessItems.length} toy/fun item{happinessItems.length !== 1 ? "s" : ""} available
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
                            +{item.effects.find(e => e.type === "happiness")?.value || 0} Happiness
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
                    {cleaningItems.length} cleaning item{cleaningItems.length !== 1 ? "s" : ""} available
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
              onClick={() => handleAction(pet.state === "sleeping" ? "Wake Up" : "Sleep", onToggleSleep)}
              disabled={!canToggleSleep || isLoading || actionLoading !== null}
              variant={pet.state === "sleeping" ? "secondary" : "default"}
              size="sm"
              className="w-full"
            >
              {actionLoading === "Sleep" || actionLoading === "Wake Up"
                ? "..."
                : pet.state === "sleeping"
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
                    {medicineItems.length} medicine item{medicineItems.length !== 1 ? "s" : ""} available
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
                          {item.effects.find(e => e.type === "cure")
                            ? "Cure Disease"
                            : item.effects.find(e => e.type === "health")
                              ? `+${item.effects.find(e => e.type === "health")?.value} Health`
                              : ""}
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
            {pet.state === "travelling" && (
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
              <div className={`${pet.health === "healthy" ? "text-green-600" : "text-red-600"}`}>{pet.health}</div>
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
