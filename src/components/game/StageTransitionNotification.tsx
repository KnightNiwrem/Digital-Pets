/**
 * Stage transition notification component.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GROWTH_STAGE_DISPLAY_NAMES,
  type GrowthStage,
} from "@/game/types/constants";
import { cn } from "@/lib/utils";

interface StageTransitionNotificationProps {
  previousStage: GrowthStage;
  newStage: GrowthStage;
  petName: string;
  onDismiss: () => void;
}

/**
 * Emojis for each growth stage.
 */
const STAGE_EMOJIS: Record<GrowthStage, string> = {
  baby: "🐣",
  child: "🌱",
  teen: "🌿",
  youngAdult: "🌳",
  adult: "⭐",
};

/**
 * Get display name for a growth stage.
 */
function getStageDisplayName(stage: GrowthStage): string {
  return GROWTH_STAGE_DISPLAY_NAMES[stage];
}

/**
 * Get emoji for a growth stage.
 */
function getStageEmoji(stage: GrowthStage): string {
  return STAGE_EMOJIS[stage];
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
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent
        className={cn(
          "sm:max-w-sm",
          isAnimating && "animate-in zoom-in-95 duration-300",
        )}
      >
        <DialogHeader className="text-center">
          <div className="text-6xl mb-2 text-center">
            {getStageEmoji(newStage)}
          </div>
          <DialogTitle className="text-xl text-center">
            Stage Evolution!
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-semibold text-foreground">{petName}</span> has
            grown!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
          <p className="text-sm text-muted-foreground text-center">
            Stats have increased and new abilities may be unlocked!
          </p>
          <Button onClick={onDismiss} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
