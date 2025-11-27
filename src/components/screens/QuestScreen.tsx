/**
 * Quest screen - quest journal for viewing and managing quests.
 */

import { useMemo, useState } from "react";
import { QuestDetail, QuestList } from "@/components/quests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  completeQuest,
  getActiveQuests,
  getAvailableQuests,
  getCompletedQuests,
  startQuest,
} from "@/game/core/quests";
import { quests as allQuestsData, getQuest } from "@/game/data/quests";
import { useGameActions, useGameState } from "@/game/hooks/useGameState";
import type { Quest, QuestProgress } from "@/game/types/quest";

type TabType = "active" | "available" | "completed";

/**
 * Quest journal screen displaying active, available, and completed quests.
 */
export function QuestScreen() {
  const { state } = useGameState();
  const { updateState } = useGameActions();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  // Get quest lists
  const { activeQuests, availableQuests, completedQuests, progressMap } =
    useMemo(() => {
      if (!state) {
        return {
          activeQuests: [],
          availableQuests: [],
          completedQuests: [],
          progressMap: new Map<string, QuestProgress>(),
        };
      }

      const active = getActiveQuests(state);
      const available = getAvailableQuests(state, Object.values(allQuestsData));
      const completed = getCompletedQuests(state);

      const map = new Map<string, QuestProgress>();
      for (const progress of state.quests) {
        map.set(progress.questId, progress);
      }

      return {
        activeQuests: active
          .map((p) => getQuest(p.questId))
          .filter((q): q is Quest => q !== undefined),
        availableQuests: available,
        completedQuests: completed
          .map((p) => getQuest(p.questId))
          .filter((q): q is Quest => q !== undefined),
        progressMap: map,
      };
    }, [state]);

  // Get selected quest
  const selectedQuest = selectedQuestId ? getQuest(selectedQuestId) : null;
  const selectedProgress = selectedQuestId
    ? progressMap.get(selectedQuestId)
    : undefined;

  // Get current tab's quests
  const currentQuests = useMemo(() => {
    switch (activeTab) {
      case "active":
        return activeQuests;
      case "available":
        return availableQuests;
      case "completed":
        return completedQuests;
      default: {
        // Exhaustive check - ensures all tab types are handled
        const _exhaustiveCheck: never = activeTab;
        return _exhaustiveCheck;
      }
    }
  }, [activeTab, activeQuests, availableQuests, completedQuests]);

  // Handle quest accept
  const handleAcceptQuest = () => {
    if (!selectedQuestId) return;
    let success = false;
    updateState((prevState) => {
      const result = startQuest(prevState, selectedQuestId);
      success = result.success;
      return result.state;
    });
    if (success) {
      setActiveTab("active");
    }
  };

  // Handle quest complete
  const handleCompleteQuest = () => {
    if (!selectedQuestId) return;
    let success = false;
    updateState((prevState) => {
      const result = completeQuest(prevState, selectedQuestId);
      success = result.success;
      return result.state;
    });
    if (success) {
      setSelectedQuestId(null);
    }
  };

  if (!state) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <span>📜</span>
            Quest Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Track your quests, complete objectives, and earn rewards.
          </p>
        </CardContent>
      </Card>

      {/* Tab navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTab("active");
            setSelectedQuestId(null);
          }}
        >
          Active ({activeQuests.length})
        </Button>
        <Button
          variant={activeTab === "available" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTab("available");
            setSelectedQuestId(null);
          }}
        >
          Available ({availableQuests.length})
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setActiveTab("completed");
            setSelectedQuestId(null);
          }}
        >
          Completed ({completedQuests.length})
        </Button>
      </div>

      {/* Quest list and detail */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quest list */}
        <div>
          <QuestList
            quests={currentQuests}
            progressMap={progressMap}
            selectedQuestId={selectedQuestId ?? undefined}
            onSelectQuest={setSelectedQuestId}
            emptyMessage={
              activeTab === "active"
                ? "No active quests. Accept a quest to get started!"
                : activeTab === "available"
                  ? "No quests available right now."
                  : "No completed quests yet."
            }
          />
        </div>

        {/* Quest detail */}
        <div>
          {selectedQuest ? (
            <QuestDetail
              quest={selectedQuest}
              progress={selectedProgress}
              onAccept={
                activeTab === "available" ? handleAcceptQuest : undefined
              }
              onComplete={
                activeTab === "active" ? handleCompleteQuest : undefined
              }
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Select a quest to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
