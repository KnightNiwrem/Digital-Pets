/**
 * Quest list component showing active/available quests.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type Quest,
  type QuestProgress,
  QuestState,
  QuestType,
} from "@/game/types/quest";
import { cn } from "@/lib/utils";
import { formatTimeRemaining } from "./formatTimeRemaining";
import { hasExpiration } from "./questUtils";

interface QuestListProps {
  quests: Quest[];
  progressMap: Map<string, QuestProgress>;
  selectedQuestId?: string;
  onSelectQuest: (questId: string) => void;
  emptyMessage?: string;
}

/**
 * Quest type badge styling.
 */
const TYPE_STYLES: Record<QuestType, string> = {
  [QuestType.Main]: "bg-purple-100 text-purple-700",
  [QuestType.Side]: "bg-blue-100 text-blue-700",
  [QuestType.Tutorial]: "bg-green-100 text-green-700",
  [QuestType.Daily]: "bg-orange-100 text-orange-700",
  [QuestType.Weekly]: "bg-amber-100 text-amber-700",
  [QuestType.Timed]: "bg-red-100 text-red-700",
  [QuestType.Hidden]: "bg-gray-100 text-gray-700",
};

/**
 * Get quest type display name.
 */
function getQuestTypeLabel(type: QuestType): string {
  const labels: Record<QuestType, string> = {
    [QuestType.Main]: "Main",
    [QuestType.Side]: "Side",
    [QuestType.Tutorial]: "Tutorial",
    [QuestType.Daily]: "Daily",
    [QuestType.Weekly]: "Weekly",
    [QuestType.Timed]: "Timed",
    [QuestType.Hidden]: "Hidden",
  };
  return labels[type];
}

/**
 * Displays a list of quests with selection.
 */
export function QuestList({
  quests,
  progressMap,
  selectedQuestId,
  onSelectQuest,
  emptyMessage = "No quests available",
}: QuestListProps) {
  if (quests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {quests.map((quest) => {
        const progress = progressMap.get(quest.id);
        const isSelected = selectedQuestId === quest.id;
        const isActive = progress?.state === QuestState.Active;

        return (
          <Button
            key={quest.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "w-full justify-start h-auto py-3 px-4",
              isSelected && "ring-2 ring-primary",
            )}
            onClick={() => onSelectQuest(quest.id)}
          >
            <div className="flex flex-col items-start gap-1 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold">{quest.name}</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    TYPE_STYLES[quest.type],
                  )}
                >
                  {getQuestTypeLabel(quest.type)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="text-xs text-muted-foreground">
                    In Progress
                  </span>
                )}
                {isActive &&
                  hasExpiration(quest.type) &&
                  progress?.expiresAt && (
                    <span className="text-xs text-orange-600">
                      ⏰ {formatTimeRemaining(progress.expiresAt)}
                    </span>
                  )}
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
