// Main quest screen component for viewing and managing quests

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestList } from "./QuestList";
import { QuestDetails } from "./QuestDetails";
import { QuestDialog } from "./QuestDialog";
import { Scroll, Star, CheckCircle } from "lucide-react";
import type { Quest, QuestProgress } from "@/types/Quest";
import type { Result } from "@/types";

interface QuestScreenProps {
  activeQuests: QuestProgress[];
  availableQuests: Quest[];
  completedQuests: string[];
  onStartQuest: (questId: string) => Promise<Result<void>>;
  onAbandonQuest: (questId: string) => Promise<Result<void>>;
  onCompleteQuest: (questId: string) => Promise<Result<void>>;
  isLoading?: boolean;
}

export function QuestScreen({
  activeQuests,
  availableQuests,
  completedQuests,
  onStartQuest,
  onAbandonQuest,
  onCompleteQuest,
  isLoading = false,
}: QuestScreenProps) {
  const [selectedTab, setSelectedTab] = useState<"available" | "active" | "completed">("active");
  const [selectedQuest, setSelectedQuest] = useState<Quest | QuestProgress | null>(null);
  const [showQuestDialog, setShowQuestDialog] = useState(false);

  const handleQuestSelect = (quest: Quest | QuestProgress) => {
    setSelectedQuest(quest);
  };

  const handleStartQuest = async (questId: string): Promise<Result<void>> => {
    const result = await onStartQuest(questId);
    if (result.success) {
      setShowQuestDialog(false);
    }
    return result;
  };

  const handleCloseDialog = () => {
    setShowQuestDialog(false);
    setSelectedQuest(null);
  };

  const getTabButtonClass = (tab: string) => {
    const isActive = selectedTab === tab;
    return `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent"
    }`;
  };

  const getQuestCount = (tab: string) => {
    switch (tab) {
      case "available":
        return availableQuests.length;
      case "active":
        return activeQuests.length;
      case "completed":
        return completedQuests.length;
      default:
        return 0;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Quest Navigation Tabs */}
      <div className="lg:col-span-3">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={() => setSelectedTab("available")}
            className={getTabButtonClass("available")}
            variant="ghost"
          >
            <Scroll className="w-4 h-4" />
            Available ({getQuestCount("available")})
          </Button>
          <Button onClick={() => setSelectedTab("active")} className={getTabButtonClass("active")} variant="ghost">
            <Star className="w-4 h-4" />
            Active ({getQuestCount("active")})
          </Button>
          <Button
            onClick={() => setSelectedTab("completed")}
            className={getTabButtonClass("completed")}
            variant="ghost"
          >
            <CheckCircle className="w-4 h-4" />
            Completed ({getQuestCount("completed")})
          </Button>
        </div>
      </div>

      {/* Quest List */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedTab === "available" && <Scroll className="w-5 h-5" />}
              {selectedTab === "active" && <Star className="w-5 h-5" />}
              {selectedTab === "completed" && <CheckCircle className="w-5 h-5" />}
              {selectedTab === "available" && "Available Quests"}
              {selectedTab === "active" && "Active Quests"}
              {selectedTab === "completed" && "Completed Quests"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuestList
              tab={selectedTab}
              activeQuests={activeQuests}
              availableQuests={availableQuests}
              completedQuests={completedQuests}
              onQuestSelect={handleQuestSelect}
              selectedQuest={selectedQuest}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quest Details */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Quest Details</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestDetails
              quest={selectedQuest}
              isActive={selectedTab === "active"}
              isCompleted={selectedTab === "completed"}
              onStartQuest={() => {
                if (selectedQuest && "id" in selectedQuest) {
                  setShowQuestDialog(true);
                }
              }}
              onAbandonQuest={onAbandonQuest}
              onCompleteQuest={onCompleteQuest}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quest Dialog Modal */}
      {showQuestDialog && selectedQuest && "id" in selectedQuest && (
        <QuestDialog
          quest={selectedQuest as Quest}
          onStartQuest={handleStartQuest}
          onClose={handleCloseDialog}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
