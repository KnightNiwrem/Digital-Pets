/**
 * Shared constants and utilities for displaying battle stats.
 */

import type { BattleStats } from "@/game/types/stats";

/**
 * Display names for battle stats.
 */
export const STAT_DISPLAY_NAMES: Record<keyof BattleStats, string> = {
  strength: "Strength",
  endurance: "Endurance",
  agility: "Agility",
  precision: "Precision",
  fortitude: "Fortitude",
  cunning: "Cunning",
};

/**
 * Emoji icons for battle stats.
 */
export const STAT_ICONS: Record<keyof BattleStats, string> = {
  strength: "💪",
  endurance: "❤️",
  agility: "⚡",
  precision: "🎯",
  fortitude: "🛡️",
  cunning: "🧠",
};

/**
 * Type guard to check if a stat key is a valid BattleStats key.
 */
export function isBattleStat(key: string): key is keyof BattleStats {
  return key in STAT_DISPLAY_NAMES;
}

/**
 * Extract non-zero stat gains from a partial BattleStats object.
 * Returns an array of [stat, value] tuples with proper typing.
 */
export function extractStatGains(
  statsGained: Partial<BattleStats> | undefined,
): Array<[keyof BattleStats, number]> {
  if (!statsGained) return [];

  return Object.entries(statsGained).filter(
    (entry): entry is [keyof BattleStats, number] => {
      const [key, value] = entry;
      return isBattleStat(key) && typeof value === "number" && value > 0;
    },
  );
}
