/**
 * Exploration complete notification component.
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
import { getItemById } from "@/game/data/items";
import type { ExplorationDrop } from "@/game/types/activity";
import { cn } from "@/lib/utils";

interface ExplorationCompleteNotificationProps {
  locationName: string;
  itemsFound: ExplorationDrop[];
  message: string;
  petName: string;
  onDismiss: () => void;
}

/**
 * Display a notification when exploration completes.
 */
export function ExplorationCompleteNotification({
  locationName,
  itemsFound,
  message: _message,
  petName,
  onDismiss,
}: ExplorationCompleteNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  // Reset animation after initial display
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const hasItems = itemsFound.length > 0;

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
            {hasItems ? "🎉" : "😔"}
          </div>
          <DialogTitle className="text-xl text-center">
            Exploration Complete!
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-semibold text-foreground">{petName}</span>{" "}
            finished exploring {locationName}!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasItems ? (
            <div className="bg-secondary/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-center mb-3">
                Items Found
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {itemsFound.map((drop, index) => {
                  const item = getItemById(drop.itemId);
                  return (
                    <div
                      key={`${drop.itemId}-${index}`}
                      className="flex items-center gap-2 p-2 bg-background rounded-md"
                    >
                      <span className="text-xl">{item?.icon ?? "❓"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item?.name ?? drop.itemId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          x{drop.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Didn't find anything this time. Better luck next time!
              </p>
            </div>
          )}
          <Button onClick={onDismiss} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
