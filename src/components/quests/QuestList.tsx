/**
 * Quest list component showing active/available quests.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Quest, QuestProgress } from "@/game/types/quest";
import { cn } from "@/lib/utils";

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
const TYPE_STYLES: Record<string, string> = {
  main: "bg-purple-100 text-purple-700",
  side: "bg-blue-100 text-blue-700",
  tutorial: "bg-green-100 text-green-700",
  daily: "bg-orange-100 text-orange-700",
  hidden: "bg-gray-100 text-gray-700",
};

/**
 * Get quest type display name.
 */
function getQuestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    main: "Main",
    side: "Side",
    tutorial: "Tutorial",
    daily: "Daily",
    hidden: "Hidden",
  };
  return labels[type] ?? type;
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
        const isActive = progress?.state === "active";

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
                    TYPE_STYLES[quest.type] ?? TYPE_STYLES.side,
                  )}
                >
                  {getQuestTypeLabel(quest.type)}
                </span>
              </div>
              {isActive && (
                <span className="text-xs text-muted-foreground">
                  In Progress
                </span>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
