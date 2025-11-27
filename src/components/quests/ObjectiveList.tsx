/**
 * Objective list component showing quest objectives with progress.
 */

import {
  getQuestCompletionPercent,
  isObjectiveComplete,
} from "@/game/core/quests";
import type { QuestObjective, QuestProgress } from "@/game/types/quest";
import { cn } from "@/lib/utils";

interface ObjectiveListProps {
  objectives: QuestObjective[];
  progress: QuestProgress;
}

/**
 * Displays quest objectives with progress bars.
 */
export function ObjectiveList({ objectives, progress }: ObjectiveListProps) {
  const completionPercent = getQuestCompletionPercent(objectives, progress);

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Individual objectives */}
      <div className="space-y-3">
        {objectives.map((objective) => {
          const current = progress.objectiveProgress[objective.id] ?? 0;
          const isComplete = isObjectiveComplete(objective, progress);
          const progressPercent = Math.min(
            (current / objective.quantity) * 100,
            100,
          );

          return (
            <div
              key={objective.id}
              className={cn(
                "p-3 rounded-lg border",
                isComplete
                  ? "bg-green-50 border-green-200"
                  : "bg-card border-border",
                objective.optional && "opacity-75",
              )}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{isComplete ? "✅" : "⬜"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm",
                        isComplete && "line-through text-muted-foreground",
                      )}
                    >
                      {objective.description}
                    </span>
                    {objective.optional && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  {!isComplete && objective.quantity > 1 && (
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {current} / {objective.quantity}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
