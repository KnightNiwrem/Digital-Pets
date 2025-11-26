/**
 * Victory/defeat screen after battle ends.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BattleRewards } from "@/game/core/battle/battle";
import { cn } from "@/lib/utils";

interface VictoryScreenProps {
  isVictory: boolean;
  rewards: BattleRewards;
  onContinue: () => void;
}

/**
 * Displays battle results and rewards.
 */
export function VictoryScreen({
  isVictory,
  rewards,
  onContinue,
}: VictoryScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
      <Card
        className={cn("w-full max-w-sm", isVictory ? "" : "border-red-500/50")}
      >
        <CardHeader className="text-center">
          <div className="text-6xl mb-2">{isVictory ? "🏆" : "💔"}</div>
          <CardTitle
            className={cn(isVictory ? "text-green-600" : "text-red-600")}
          >
            {isVictory ? "Victory!" : "Defeat..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVictory ? (
            <>
              <p className="text-center text-muted-foreground">
                You won the battle!
              </p>
              {(rewards.coins > 0 || rewards.items.length > 0) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Rewards</h3>
                  {rewards.coins > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>💰</span>
                      <span>{rewards.coins} coins</span>
                    </div>
                  )}
                  {rewards.items.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span>📦</span>
                      <span>
                        {item.itemId} x{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              Your pet is exhausted and needs rest.
            </p>
          )}

          <Button onClick={onContinue} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
