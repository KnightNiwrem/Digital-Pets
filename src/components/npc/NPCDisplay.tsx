/**
 * NPC display component showing the NPC avatar and info.
 */

import { Button } from "@/components/ui/button";
import type { NPC } from "@/game/types/npc";
import { NpcRole } from "@/game/types/npc";

interface NPCDisplayProps {
  npc: NPC;
  onClick: () => void;
}

/**
 * Display data for NPC roles.
 */
const ROLE_DISPLAY: Record<NpcRole, { name: string; color: string }> = {
  [NpcRole.QuestGiver]: {
    name: "Quest Giver",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  [NpcRole.Merchant]: {
    name: "Merchant",
    color: "text-green-600 dark:text-green-400",
  },
  [NpcRole.Trainer]: {
    name: "Trainer",
    color: "text-blue-600 dark:text-blue-400",
  },
  [NpcRole.Guide]: {
    name: "Guide",
    color: "text-purple-600 dark:text-purple-400",
  },
  [NpcRole.Lore]: {
    name: "Lore",
    color: "text-orange-600 dark:text-orange-400",
  },
};

/**
 * Get display info for an NPC role.
 */
function getRoleDisplay(role: NpcRole): { name: string; color: string } {
  return ROLE_DISPLAY[role];
}

/**
 * Displays an NPC with their avatar and basic info.
 */
export function NPCDisplay({ npc, onClick }: NPCDisplayProps) {
  const primaryRole = npc.roles[0];
  const roleDisplay = primaryRole ? getRoleDisplay(primaryRole) : null;

  return (
    <Button
      variant="outline"
      className="flex items-center gap-3 p-4 h-auto w-full justify-start"
      onClick={onClick}
    >
      <span className="text-3xl">{npc.emoji}</span>
      <div className="flex flex-col items-start">
        <span className="font-medium">{npc.name}</span>
        {roleDisplay && (
          <span className={`text-xs ${roleDisplay.color}`}>
            {roleDisplay.name}
          </span>
        )}
      </div>
    </Button>
  );
}
