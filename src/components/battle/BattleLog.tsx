/**
 * Battle log component showing turn-by-turn actions.
 */

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BattleLogEntry } from "@/game/core/battle/battle";
import { cn } from "@/lib/utils";

interface BattleLogProps {
  entries: BattleLogEntry[];
  maxEntries?: number;
}

/**
 * Displays the battle log with color-coded entries.
 */
export function BattleLog({ entries, maxEntries = 8 }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const entriesLength = entries.length;

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (entriesLength > 0) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [entriesLength]);

  const visibleEntries = entries.slice(-maxEntries);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <span>📜</span>
          Battle Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={scrollRef} className="h-32 overflow-y-auto space-y-1 text-sm">
          {visibleEntries.map((entry, index) => (
            <LogEntry key={`${entry.turn}-${index}`} entry={entry} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface LogEntryProps {
  entry: BattleLogEntry;
}

function LogEntry({ entry }: LogEntryProps) {
  const getEntryStyle = (type: BattleLogEntry["type"]): string => {
    switch (type) {
      case "action":
        return "text-foreground";
      case "damage":
        return "text-red-600 dark:text-red-400";
      case "effect":
        return "text-purple-600 dark:text-purple-400";
      case "system":
        return "text-blue-600 dark:text-blue-400 font-medium";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("leading-snug", getEntryStyle(entry.type))}>
      {entry.turn > 0 && (
        <span className="text-muted-foreground text-xs mr-1">
          [{entry.turn}]
        </span>
      )}
      {entry.message}
    </div>
  );
}
