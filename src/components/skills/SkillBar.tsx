/**
 * Skill bar component showing single skill display.
 */

import { Card, CardContent } from "@/components/ui/card";
import {
  getSkillProgress,
  getSkillTier,
  getSkillTierDisplayName,
  xpForNextLevel,
} from "@/game/core/skills";
import {
  getSkillDisplayName,
  getSkillEmoji,
  MAX_SKILL_LEVEL,
  type Skill,
} from "@/game/types/skill";
import { cn } from "@/lib/utils";

interface SkillBarProps {
  skill: Skill;
  className?: string;
}

/**
 * Displays a single skill with level, tier, XP progress bar.
 */
export function SkillBar({ skill, className }: SkillBarProps) {
  const displayName = getSkillDisplayName(skill.type);
  const emoji = getSkillEmoji(skill.type);
  const tier = getSkillTier(skill.level);
  const tierName = getSkillTierDisplayName(tier);
  const progress = getSkillProgress(skill);
  const xpNeeded = xpForNextLevel(skill.level);
  const isMaxLevel = skill.level >= MAX_SKILL_LEVEL;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="pt-4 pb-3 px-4">
        {/* Header: name and level */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <span className="font-semibold">{displayName}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">Lv. {skill.level}</span>
          </div>
        </div>

        {/* Tier badge */}
        <div className="mb-2">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              tier === "master" && "bg-purple-100 text-purple-700",
              tier === "expert" && "bg-blue-100 text-blue-700",
              tier === "journeyman" && "bg-green-100 text-green-700",
              tier === "apprentice" && "bg-yellow-100 text-yellow-700",
              tier === "novice" && "bg-gray-100 text-gray-700",
            )}
          >
            {tierName}
          </span>
        </div>

        {/* XP Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>XP</span>
            <span>
              {isMaxLevel ? "MAX" : `${skill.currentXp} / ${xpNeeded}`}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                isMaxLevel ? "bg-purple-500" : "bg-primary",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
