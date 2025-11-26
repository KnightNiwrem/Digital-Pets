/**
 * Results panel showing items found during exploration.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getItemById } from "@/game/data/items";
import type { ExplorationDrop } from "@/game/types/activity";

interface ResultsPanelProps {
  itemsFound: ExplorationDrop[];
  message: string;
  onClose: () => void;
}

/**
 * Display exploration results with found items.
 */
export function ResultsPanel({
  itemsFound,
  message,
  onClose,
}: ResultsPanelProps) {
  return (
    <Card className="border-green-500/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          <CardTitle className="text-lg">Exploration Complete!</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>

        {itemsFound.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Items Found:</h4>
            <div className="grid grid-cols-2 gap-2">
              {itemsFound.map((drop, index) => {
                const item = getItemById(drop.itemId);
                return (
                  <div
                    key={`${drop.itemId}-${index}`}
                    className="flex items-center gap-2 p-2 bg-muted rounded-md"
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
        )}

        {itemsFound.length === 0 && (
          <div className="text-center py-4">
            <span className="text-3xl">😔</span>
            <p className="text-sm text-muted-foreground mt-2">
              Better luck next time!
            </p>
          </div>
        )}

        <Button className="w-full" onClick={onClose}>
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
