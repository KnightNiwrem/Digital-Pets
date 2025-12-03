/**
 * Shared component for displaying gained battle stats.
 */

import {
  extractStatGains,
  STAT_DISPLAY_NAMES,
  STAT_ICONS,
} from "@/game/data/stats";
import type { BattleStats } from "@/game/types/stats";

interface StatsGainedDisplayProps {
  /** Stats gained to display */
  statsGained: Partial<BattleStats> | undefined;
  /** Optional title to show above the stats */
  title?: string;
}

/**
 * Display a list of gained stats with icons and values.
 * Used by training completion notifications and offline reports.
 */
export function StatsGainedDisplay({
  statsGained,
  title = "Stats Gained",
}: StatsGainedDisplayProps) {
  const gainedEntries = extractStatGains(statsGained);

  if (gainedEntries.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
        {title}
      </p>
      <div className="flex flex-col items-center gap-2">
        {gainedEntries.map(([stat, value]) => (
          <div key={stat} className="flex items-center gap-2">
            <span>{STAT_ICONS[stat]}</span>
            <span className="text-sm">{STAT_DISPLAY_NAMES[stat]}</span>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              +{value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
