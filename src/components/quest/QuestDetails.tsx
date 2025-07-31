// Quest details component showing comprehensive quest information

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, Coins, Star, MapPin, User, Gift, AlertTriangle } from "lucide-react";
import type { Quest, QuestProgress, QuestObjective, QuestReward } from "@/types/Quest";
import type { Result } from "@/types";
import { getItemById } from "@/data/items";
import { getNpcById } from "@/data/locations";
import { QuestUtils, GameMath, UIUtils } from "@/lib/utils";

interface QuestDetailsProps {
  quest: Quest | QuestProgress | null;
  isActive: boolean;
  isCompleted: boolean;
  onStartQuest: () => void;
  onAbandonQuest: (questId: string) => Promise<Result<void>>;
  onCompleteQuest: (questId: string) => Promise<Result<void>>;
  isLoading?: boolean;
}

export function QuestDetails({
  quest,
  isActive,
  isCompleted,
  onStartQuest,
  onAbandonQuest,
  onCompleteQuest,
  isLoading = false,
}: QuestDetailsProps) {
  if (!quest) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Select a quest to view details</p>
      </div>
    );
  }

  const questId = "questId" in quest ? quest.questId : quest.id;
  const questName = quest.name;
  const questDescription = quest.description;
  const questType = quest.type;
  const questObjectives = quest.objectives;
  const questRewards = quest.rewards;
  const questRequirements = "requirements" in quest ? quest.requirements : [];
  const questNpcId = "npcId" in quest ? quest.npcId : undefined;
  const questLocation = "location" in quest ? quest.location : undefined;
  const isMainQuest = "isMainQuest" in quest ? quest.isMainQuest : false;

  const canComplete = () => {
    return isActive && QuestUtils.isQuestComplete({ objectives: questObjectives });
  };

  const renderObjective = (objective: QuestObjective) => {
    const isCompleted = objective.completed;
    const hasProgress = objective.targetAmount && objective.currentAmount !== undefined;

    return (
      <div key={objective.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="mt-0.5">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <p className={`text-sm ${isCompleted ? "text-green-700 line-through" : "text-gray-700"}`}>
            {objective.description}
          </p>
          {hasProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {objective.currentAmount}/{objective.targetAmount}
                </span>
              </div>
              <Progress
                value={((objective.currentAmount || 0) / (objective.targetAmount || 1)) * 100}
                className="h-2"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReward = (reward: QuestReward, index: number) => {
    const getRewardIcon = (type: string) => {
      switch (type) {
        case "gold":
          return <Coins className="w-4 h-4 text-yellow-600" />;
        case "experience":
          return <Star className="w-4 h-4 text-blue-600" />;
        case "item":
          return <Gift className="w-4 h-4 text-purple-600" />;
        default:
          return <Gift className="w-4 h-4 text-gray-600" />;
      }
    };

    const getRewardText = () => {
      if (reward.type === "item") {
        const item = getItemById(reward.itemId!);
        const itemName = item ? item.name : reward.itemId;
        return `${reward.amount || 1}x ${itemName}`;
      }
      return UIUtils.formatRewardText(reward);
    };

    return (
      <div key={index} className="flex items-center gap-2 text-sm">
        {getRewardIcon(reward.type)}
        <span>{getRewardText()}</span>
      </div>
    );
  };

  const progress = isActive ? QuestUtils.calculateQuestProgress({ objectives: questObjectives }) : 0;

  return (
    <div className="space-y-6">
      {/* Quest Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">{questName}</h2>
          <Badge className={`${UIUtils.getQuestTypeColor(questType)} text-xs`}>{questType}</Badge>
        </div>
        {isMainQuest && (
          <Badge variant="outline" className="mb-2">
            Main Quest
          </Badge>
        )}
        <p className="text-sm text-gray-600">{questDescription}</p>
      </div>

      {/* Quest Info */}
      <div className="space-y-2 text-sm">
        {questLocation && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Location: {questLocation}</span>
          </div>
        )}
        {questNpcId && (
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>Quest Giver: {getNpcById(questNpcId)?.name || questNpcId}</span>
          </div>
        )}
      </div>

      {/* Progress (for active quests) */}
      {isActive && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{GameMath.roundToPercentage(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      )}

      <Separator />

      {/* Objectives */}
      <div>
        <h3 className="font-medium text-gray-800 mb-3">Objectives</h3>
        <div className="space-y-2">{questObjectives.map(renderObjective)}</div>
      </div>

      {/* Requirements (for available quests) */}
      {!isActive && !isCompleted && questRequirements.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Requirements</h3>
            <div className="space-y-2">
              {questRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {req.type === "level" && `Reach level ${req.value}`}
                    {req.type === "quest_completed" && `Complete quest: ${req.questId}`}
                    {req.type === "item_owned" && `Have ${req.value}x ${req.itemId}`}
                    {req.type === "pet_species" && `Pet species: ${req.petSpecies}`}
                    {req.type === "location_visited" && `Visit location: ${req.locationId}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Rewards */}
      {questRewards.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-medium text-gray-800 mb-3">Rewards</h3>
            <div className="space-y-2">{questRewards.map(renderReward)}</div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isActive && !isCompleted && (
          <Button onClick={onStartQuest} className="w-full" disabled={isLoading}>
            {isLoading ? "Starting..." : "Start Quest"}
          </Button>
        )}

        {isActive && (
          <div className="space-y-2">
            {canComplete() && (
              <Button
                onClick={() => onCompleteQuest(questId)}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Completing..." : "Complete Quest"}
              </Button>
            )}
            <Button
              onClick={() => onAbandonQuest(questId)}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
              disabled={isLoading}
            >
              {isLoading ? "Abandoning..." : "Abandon Quest"}
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Quest Completed!</p>
          </div>
        )}
      </div>
    </div>
  );
}
