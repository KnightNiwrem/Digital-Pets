// Pet care panel with action buttons for feeding, playing, etc.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pet, Result } from "@/types";
import { PetValidator } from "@/lib/utils";

interface PetCarePanelProps {
  pet: Pet;
  isLoading: boolean;
  onFeed: () => Promise<Result<void>>;
  onDrink: () => Promise<Result<void>>;
  onPlay: () => Promise<Result<void>>;
  onCleanPoop: () => Promise<Result<void>>;
  onTreat: (medicineType: string) => Promise<Result<void>>;
  onToggleSleep: () => Promise<Result<void>>;
}

export function PetCarePanel({
  pet,
  isLoading,
  onFeed,
  onDrink,
  onPlay,
  onCleanPoop,
  onTreat,
  onToggleSleep,
}: PetCarePanelProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<string>("basic_medicine");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Helper to handle actions with loading states and feedback
  const handleAction = async (actionName: string, action: () => Promise<Result<void>>) => {
    setActionLoading(actionName);
    setMessage(null);

    try {
      const result = await action();

      if (result.success) {
        setMessage({ type: "success", text: `${actionName} successful!` });
      } else {
        setMessage({ type: "error", text: result.error || `${actionName} failed` });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : `${actionName} failed`,
      });
    } finally {
      setActionLoading(null);

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Check if actions are available using proper validation
  const canFeed = pet.satiety < 100 && !PetValidator.validateCareAction(pet, "feed");
  const canDrink = pet.hydration < 100 && !PetValidator.validateCareAction(pet, "drink");
  const canPlay = pet.happiness < 100 && !PetValidator.validateCareAction(pet, "play", 10);
  const canClean = pet.poopTicksLeft <= 0 && pet.state !== "exploring" && pet.state !== "sleeping" && pet.state !== "travelling";
  const canTreat = pet.health !== "healthy" && pet.state !== "exploring" && pet.state !== "sleeping";
  const canSleep = !PetValidator.validateSleepAction(pet);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Pet Care</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Messages */}
        {message && (
          <div
            className={`p-2 rounded text-sm text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Basic Care Actions */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Basic Care</h3>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleAction("Feed", onFeed)}
              disabled={!canFeed || isLoading || actionLoading !== null}
              variant={canFeed ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {actionLoading === "Feed" ? "..." : "🍖 Feed"}
            </Button>

            <Button
              onClick={() => handleAction("Give Water", onDrink)}
              disabled={!canDrink || isLoading || actionLoading !== null}
              variant={canDrink ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {actionLoading === "Give Water" ? "..." : "💧 Water"}
            </Button>

            <Button
              onClick={() => handleAction("Play", onPlay)}
              disabled={!canPlay || isLoading || actionLoading !== null}
              variant={canPlay ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {actionLoading === "Play" ? "..." : "🎾 Play"}
            </Button>

            <Button
              onClick={() => handleAction("Clean", onCleanPoop)}
              disabled={!canClean || isLoading || actionLoading !== null}
              variant={canClean ? "destructive" : "outline"}
              size="sm"
              className="w-full"
            >
              {actionLoading === "Clean" ? "..." : "🧹 Clean"}
            </Button>
          </div>
        </div>

        {/* Sleep Control */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Rest</h3>

          <Button
            onClick={() => handleAction(pet.state === "sleeping" ? "Wake Up" : "Sleep", onToggleSleep)}
            disabled={!canSleep || isLoading || actionLoading !== null}
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
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select medicine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic_medicine">Basic Medicine</SelectItem>
                  <SelectItem value="antidote">Antidote</SelectItem>
                  <SelectItem value="bandage">Bandage</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleAction("Treat", () => onTreat(selectedMedicine))}
                disabled={isLoading || actionLoading !== null}
                variant="default"
                size="sm"
                className="w-full"
              >
                {actionLoading === "Treat" ? "..." : "💊 Treat"}
              </Button>
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
            <li>Feed when satiety is low</li>
            <li>Play requires energy but increases happiness</li>
            <li>Sleep restores energy over time</li>
            <li>Clean poop quickly to prevent sickness</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
