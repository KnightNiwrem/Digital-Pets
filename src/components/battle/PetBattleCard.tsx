/**
 * Pet battle card showing HP, stamina, and status effects.
 *
 * This component displays the combatant state it receives without any
 * buffering - the parent BattleScreen handles animation synchronization
 * by passing buffered (displayed) state instead of raw game state.
 */

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getEffectSummary } from "@/game/core/battle/status";
import type { Combatant } from "@/game/core/battle/turn";
import { getSpeciesById } from "@/game/data/species";
import { cn } from "@/lib/utils";

interface PetBattleCardProps {
  combatant: Combatant;
  position: "player" | "enemy";
  isAttacking?: boolean;
  isHit?: boolean;
}

/**
 * Clamp a percentage between 0 and 100, handling edge cases.
 */
function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Displays a pet's battle status including HP bar, stamina, and effects.
 */
export function PetBattleCard({
  combatant,
  position,
  isAttacking = false,
  isHit = false,
}: PetBattleCardProps) {
  const { derivedStats, statusEffects, name, speciesId } = combatant;
  const hpPercent = clampPercent(
    derivedStats.currentHealth,
    derivedStats.maxHealth,
  );
  const staminaPercent = clampPercent(
    derivedStats.currentStamina,
    derivedStats.maxStamina,
  );

  const { buffs, debuffs, other } = useMemo(
    () => getEffectSummary(statusEffects),
    [statusEffects],
  );

  // Get species emoji for display
  const species = getSpeciesById(speciesId);
  const emoji = species?.emoji ?? "🐾";

  return (
    <Card
      className={cn(
        "w-full max-w-40 sm:max-w-48 transition-all duration-200",
        position === "enemy" ? "bg-red-50 dark:bg-red-950/20" : "",
        isAttacking && "animate-battle-attack",
        isHit && "animate-battle-hit",
      )}
    >
      <CardContent className="pt-2 pb-2 px-2 sm:pt-4 sm:pb-3 sm:px-4">
        {/* Name and emoji */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <span
            className={cn("text-xl sm:text-2xl", isHit && "animate-pet-shake")}
          >
            {emoji}
          </span>
          <span className="font-semibold text-xs sm:text-sm truncate">
            {name}
          </span>
        </div>

        {/* HP Bar */}
        <div className="mb-1.5 sm:mb-2">
          <div className="flex justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
            <span>HP</span>
            <span>
              {derivedStats.currentHealth}/{derivedStats.maxHealth}
            </span>
          </div>
          <div className="h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                hpPercent > 50
                  ? "bg-green-500"
                  : hpPercent > 25
                    ? "bg-yellow-500"
                    : "bg-red-500",
              )}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Stamina Bar */}
        <div className="mb-1 sm:mb-2">
          <div className="flex justify-between text-[10px] sm:text-xs mb-0.5 sm:mb-1">
            <span>SP</span>
            <span>
              {derivedStats.currentStamina}/{derivedStats.maxStamina}
            </span>
          </div>
          <div className="h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${staminaPercent}%` }}
            />
          </div>
        </div>

        {/* Status Effects */}
        {statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-1 sm:mt-2">
            {buffs.map((effect) => (
              <span
                key={effect.id}
                className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                title={`${effect.name} (${effect.duration} turns)`}
              >
                ↑{effect.stat?.slice(0, 3)}
              </span>
            ))}
            {debuffs.map((effect) => (
              <span
                key={effect.id}
                className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                title={`${effect.name} (${effect.duration} turns)`}
              >
                ↓{effect.stat?.slice(0, 3) ?? "DoT"}
              </span>
            ))}
            {other.map((effect) => (
              <span
                key={effect.id}
                className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                title={`${effect.name} (${effect.duration} turns)`}
              >
                ⚡
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
