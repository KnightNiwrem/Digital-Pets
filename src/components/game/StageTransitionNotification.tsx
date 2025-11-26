/**
 * Stage transition notification component.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrowthStage } from "@/game/types/constants";
import { cn } from "@/lib/utils";

interface StageTransitionNotificationProps {
  previousStage: GrowthStage;
  newStage: GrowthStage;
  petName: string;
  onDismiss: () => void;
}

/**
 * Get display name for a growth stage.
 */
function getStageDisplayName(stage: GrowthStage): string {
  switch (stage) {
    case "baby":
      return "Baby";
    case "child":
      return "Child";
    case "teen":
      return "Teen";
    case "youngAdult":
      return "Young Adult";
    case "adult":
      return "Adult";
  }
}

/**
 * Get emoji for a growth stage.
 */
function getStageEmoji(stage: GrowthStage): string {
  switch (stage) {
    case "baby":
      return "🐣";
    case "child":
      return "🌱";
    case "teen":
      return "🌿";
    case "youngAdult":
      return "🌳";
    case "adult":
      return "⭐";
  }
}

/**
 * Display a notification when the pet transitions to a new growth stage.
 */
export function StageTransitionNotification({
  previousStage,
  newStage,
  petName,
  onDismiss,
}: StageTransitionNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  // Reset animation after initial display
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card
        className={cn(
          "m-4 max-w-sm w-full shadow-lg border-2 border-primary",
          isAnimating && "animate-in zoom-in-95 duration-300",
        )}
      >
        <CardHeader className="text-center pb-2">
          <div className="text-6xl mb-2">{getStageEmoji(newStage)}</div>
          <CardTitle className="text-xl">Stage Evolution!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg">
            <span className="font-semibold">{petName}</span> has grown!
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <div className="text-2xl">{getStageEmoji(previousStage)}</div>
              <div className="text-sm text-muted-foreground">
                {getStageDisplayName(previousStage)}
              </div>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-center">
              <div className="text-2xl">{getStageEmoji(newStage)}</div>
              <div className="text-sm font-medium text-primary">
                {getStageDisplayName(newStage)}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Stats have increased and new abilities may be unlocked!
          </p>
          <Button onClick={onDismiss} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
