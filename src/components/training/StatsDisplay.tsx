/**
 * Battle stats display component.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BattleStats } from "@/game/types/stats";
import { cn } from "@/lib/utils";

interface StatsDisplayProps {
  battleStats: BattleStats;
}

/**
 * Stat icons for each battle stat.
 */
const STAT_ICONS: Record<keyof BattleStats, string> = {
  strength: "💪",
  endurance: "❤️",
  agility: "⚡",
  precision: "🎯",
  fortitude: "🛡️",
  cunning: "🧠",
};

/**
 * Stat display names.
 */
const STAT_NAMES: Record<keyof BattleStats, string> = {
  strength: "Strength",
  endurance: "Endurance",
  agility: "Agility",
  precision: "Precision",
  fortitude: "Fortitude",
  cunning: "Cunning",
};

/**
 * Single stat display row.
 */
function StatRow({ stat, value }: { stat: keyof BattleStats; value: number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-sm">
        <span>{STAT_ICONS[stat]}</span>
        <span>{STAT_NAMES[stat]}</span>
      </span>
      <span
        className={cn(
          "font-medium text-sm",
          value > 0 ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Battle stats overview display.
 */
export function StatsDisplay({ battleStats }: StatsDisplayProps) {
  const stats: (keyof BattleStats)[] = [
    "strength",
    "endurance",
    "agility",
    "precision",
    "fortitude",
    "cunning",
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Battle Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4">
          {stats.map((stat) => (
            <StatRow key={stat} stat={stat} value={battleStats[stat]} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
