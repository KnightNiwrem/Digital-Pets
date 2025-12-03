/**
 * Quest detail component showing full quest information.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { areAllRequiredObjectivesComplete } from "@/game/core/quests";
import { getItemById } from "@/game/data/items";
import type { Quest, QuestProgress, QuestReward } from "@/game/types/quest";
import { formatTimeRemaining } from "./formatTimeRemaining";
import { ObjectiveList } from "./ObjectiveList";
import { hasExpiration } from "./questUtils";

interface QuestDetailProps {
  quest: Quest;
  progress?: QuestProgress;
  onAccept?: () => void;
  onComplete?: () => void;
}

/**
 * Format reward for display.
 */
function formatReward(reward: QuestReward): string {
  switch (reward.type) {
    case "currency":
      return `${reward.quantity} coins`;
    case "item": {
      const item = getItemById(reward.target);
      const itemName = item?.name ?? reward.target;
      return `${reward.quantity}x ${itemName}`;
    }
    case "xp":
      return `${reward.quantity} ${reward.target} XP`;
    case "unlock":
      return `Unlock: ${reward.target}`;
    default: {
      // Exhaustive check - ensures all reward types are handled
      const _exhaustiveCheck: never = reward.type;
      return _exhaustiveCheck;
    }
  }
}

/**
 * Displays detailed quest information with objectives and rewards.
 */
export function QuestDetail({
  quest,
  progress,
  onAccept,
  onComplete,
}: QuestDetailProps) {
  const isActive = progress?.state === "active";
  const isCompleted = progress?.state === "completed";
  const canComplete =
    isActive &&
    progress &&
    areAllRequiredObjectivesComplete(quest.objectives, progress);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>📜</span>
          {quest.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground">{quest.description}</p>

        {/* Expiration timer */}
        {isActive && hasExpiration(quest.type) && progress?.expiresAt && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-md">
            <span>⏰</span>
            <span>Expires in: {formatTimeRemaining(progress.expiresAt)}</span>
          </div>
        )}

        {/* Objectives */}
        {(isActive || isCompleted) && progress && (
          <div>
            <h4 className="font-semibold mb-2">Objectives</h4>
            <ObjectiveList objectives={quest.objectives} progress={progress} />
          </div>
        )}

        {/* Objectives preview for available quests */}
        {!isActive && !isCompleted && (
          <div>
            <h4 className="font-semibold mb-2">Objectives</h4>
            <ul className="space-y-1">
              {quest.objectives
                .filter((obj) => !obj.optional)
                .map((obj) => (
                  <li
                    key={obj.id}
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <span>•</span>
                    {obj.description}
                    {obj.quantity > 1 && ` (0/${obj.quantity})`}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        <div>
          <h4 className="font-semibold mb-2">Rewards</h4>
          <div className="flex flex-wrap gap-2">
            {quest.rewards.map((reward, index) => (
              <span
                key={`${reward.type}-${reward.target}-${index}`}
                className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded"
              >
                🎁 {formatReward(reward)}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          {!isActive && !isCompleted && onAccept && (
            <Button onClick={onAccept} className="w-full">
              Accept Quest
            </Button>
          )}
          {canComplete && onComplete && (
            <>
              {quest.type === "tutorial" ? (
                <Button disabled className="w-full" variant="outline">
                  Return to Oak to complete
                </Button>
              ) : (
                <Button onClick={onComplete} className="w-full">
                  Complete Quest
                </Button>
              )}
            </>
          )}
          {isCompleted && (
            <div className="text-center text-green-600 font-semibold">
              ✅ Quest Completed
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
