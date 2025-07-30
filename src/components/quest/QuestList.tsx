// Quest list component for displaying different types of quests

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, MapPin, User, Trophy, Heart } from "lucide-react";
import type { Quest, QuestProgress } from "@/types/Quest";

interface QuestListProps {
  tab: "available" | "active" | "completed";
  activeQuests: QuestProgress[];
  availableQuests: Quest[];
  completedQuests: string[];
  onQuestSelect: (quest: Quest | QuestProgress) => void;
  selectedQuest: Quest | QuestProgress | null;
  isLoading?: boolean;
}

export function QuestList({
  tab,
  activeQuests,
  availableQuests,
  completedQuests,
  onQuestSelect,
  selectedQuest,
  isLoading = false,
}: QuestListProps) {
  const getQuestTypeIcon = (type: string) => {
    switch (type) {
      case "story":
        return <Trophy className="w-4 h-4" />;
      case "exploration":
        return <MapPin className="w-4 h-4" />;
      case "collection":
        return <Heart className="w-4 h-4" />;
      case "battle":
        return <Trophy className="w-4 h-4" />;
      case "care":
        return <Heart className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case "story":
        return "bg-yellow-100 text-yellow-800";
      case "exploration":
        return "bg-green-100 text-green-800";
      case "collection":
        return "bg-blue-100 text-blue-800";
      case "battle":
        return "bg-red-100 text-red-800";
      case "care":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateQuestProgress = (quest: QuestProgress) => {
    const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
    const totalObjectives = quest.objectives.length;
    return totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;
  };

  const isQuestSelected = (quest: Quest | QuestProgress) => {
    if (!selectedQuest) return false;
    const questId = "questId" in quest ? quest.questId : quest.id;
    const selectedId = "questId" in selectedQuest ? selectedQuest.questId : selectedQuest.id;
    return questId === selectedId;
  };

  const renderAvailableQuests = () => {
    if (availableQuests.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No available quests at the moment.</p>
          <p className="text-sm">Complete current quests to unlock more!</p>
        </div>
      );
    }

    return availableQuests.map(quest => (
      <div
        key={quest.id}
        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
          isQuestSelected(quest)
            ? "border-blue-300 bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
        onClick={() => onQuestSelect(quest)}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800">{quest.name}</h3>
          <Badge className={`${getQuestTypeColor(quest.type)} text-xs`}>
            <span className="flex items-center gap-1">
              {getQuestTypeIcon(quest.type)}
              {quest.type}
            </span>
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            {quest.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {quest.location}
              </span>
            )}
            {quest.npcId && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                NPC Quest
              </span>
            )}
          </div>
          {quest.isMainQuest && (
            <Badge variant="outline" className="text-xs">
              Main Quest
            </Badge>
          )}
        </div>
      </div>
    ));
  };

  const renderActiveQuests = () => {
    if (activeQuests.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No active quests.</p>
          <p className="text-sm">Start a quest to begin your adventure!</p>
        </div>
      );
    }

    return activeQuests.map(questProgress => {
      const progress = calculateQuestProgress(questProgress);
      return (
        <div
          key={questProgress.questId}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            isQuestSelected(questProgress)
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
          onClick={() => onQuestSelect(questProgress)}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-800">{questProgress.name}</h3>
            <Badge className={`${getQuestTypeColor(questProgress.type)} text-xs`}>
              <span className="flex items-center gap-1">
                {getQuestTypeIcon(questProgress.type)}
                {questProgress.type}
              </span>
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3">{questProgress.description}</p>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Objectives Summary */}
          <div className="text-xs text-gray-500">
            <span>
              {questProgress.objectives.filter(obj => obj.completed).length}/{questProgress.objectives.length}{" "}
              objectives completed
            </span>
          </div>
        </div>
      );
    });
  };

  const renderCompletedQuests = () => {
    if (completedQuests.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No completed quests yet.</p>
          <p className="text-sm">Complete quests to see them here!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {completedQuests.map(questId => (
          <div key={questId} className="p-3 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">{questId}</span>
              <Badge className="bg-green-100 text-green-800 text-xs ml-auto">Completed</Badge>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-500">Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {tab === "available" && renderAvailableQuests()}
      {tab === "active" && renderActiveQuests()}
      {tab === "completed" && renderCompletedQuests()}
    </div>
  );
}
