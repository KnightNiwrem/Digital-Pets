// Quest dialog component for NPC quest interactions

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, Coins, Star, Gift } from "lucide-react";
import type { Quest, QuestReward } from "@/types/Quest";
import type { Result } from "@/types";

interface QuestDialogProps {
  quest: Quest;
  onStartQuest: (questId: string) => Promise<Result<void>>;
  onClose: () => void;
  isLoading?: boolean;
}

export function QuestDialog({ quest, onStartQuest, onClose, isLoading = false }: QuestDialogProps) {
  const handleStartQuest = async () => {
    await onStartQuest(quest.id);
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
      switch (reward.type) {
        case "gold":
          return `${reward.amount} Gold`;
        case "experience":
          return `${reward.amount} EXP`;
        case "item":
          return `${reward.amount || 1}x ${reward.itemId}`;
        case "unlock_location":
          return `Unlock ${reward.locationId}`;
        case "unlock_quest":
          return `Unlock Quest: ${reward.questId}`;
        default:
          return "Unknown Reward";
      }
    };

    return (
      <div key={index} className="flex items-center gap-2 text-sm">
        {getRewardIcon(reward.type)}
        <span>{getRewardText()}</span>
      </div>
    );
  };

  const dialogueText = quest.dialogue?.start || quest.description;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {quest.npcId || "Quest Giver"}
            </DialogTitle>
            <Badge className={`${getQuestTypeColor(quest.type)} text-xs`}>{quest.type}</Badge>
          </div>
          {quest.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{quest.location}</span>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* NPC Dialogue */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 italic">&quot;{dialogueText}&quot;</p>
          </div>

          {/* Quest Info */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">{quest.name}</h3>
            <p className="text-sm text-gray-600">{quest.description}</p>
            {quest.isMainQuest && (
              <Badge variant="outline" className="mt-2">
                Main Quest
              </Badge>
            )}
          </div>

          {/* Objectives Preview */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Objectives:</h4>
            <ul className="space-y-1">
              {quest.objectives.map((objective, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{objective.description}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rewards */}
          {quest.rewards.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Rewards:</h4>
                <div className="space-y-1">{quest.rewards.map(renderReward)}</div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Decline
          </Button>
          <Button onClick={handleStartQuest} disabled={isLoading}>
            {isLoading ? "Starting..." : "Accept Quest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
