/**
 * Training complete notification component.
 */

import { useEffect, useState } from "react";
import { StatsGainedDisplay } from "@/components/shared";
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
          <StatsGainedDisplay statsGained={statsGained} />
          <Button onClick={onDismiss} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
