/**
 * Training complete notification component.
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
import type { BattleStats } from "@/game/types/stats";
import { cn } from "@/lib/utils";

interface TrainingCompleteNotificationProps {
  facilityName: string;
  statsGained: Partial<BattleStats>;
  petName: string;
  onDismiss: () => void;
}

/**
 * Stat display names.
 */
const STAT_DISPLAY_NAMES: Record<keyof BattleStats, string> = {
  strength: "Strength",
  endurance: "Endurance",
  agility: "Agility",
  precision: "Precision",
  fortitude: "Fortitude",
  cunning: "Cunning",
};

/**
 * Stat icons.
 */
const STAT_ICONS: Record<keyof BattleStats, string> = {
  strength: "💪",
  endurance: "❤️",
  agility: "⚡",
  precision: "🎯",
  fortitude: "🛡️",
  cunning: "🧠",
};

/**
 * Display a notification when training completes.
 */
export function TrainingCompleteNotification({
  facilityName,
  statsGained,
  petName,
  onDismiss,
}: TrainingCompleteNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  // Reset animation after initial display
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const gainedEntries = Object.entries(statsGained).filter(
    ([_, value]) => value && value > 0,
  ) as [keyof BattleStats, number][];

  return (
    <Dialog open onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent
        className={cn(
          "sm:max-w-sm",
          isAnimating && "animate-in zoom-in-95 duration-300",
        )}
      >
        <DialogHeader className="text-center">
          <div className="text-6xl mb-2 text-center">🎉</div>
          <DialogTitle className="text-xl text-center">
            Training Complete!
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-semibold text-foreground">{petName}</span>{" "}
            finished training at {facilityName}!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-center mb-2">
              Stats Gained
            </h4>
            <div className="flex flex-col items-center gap-2">
              {gainedEntries.map(([stat, value]) => (
                <div key={stat} className="flex items-center gap-2">
                  <span>{STAT_ICONS[stat]}</span>
                  <span className="text-sm">{STAT_DISPLAY_NAMES[stat]}</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={onDismiss} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
