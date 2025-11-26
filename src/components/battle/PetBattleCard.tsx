/**
 * Pet battle card showing HP, stamina, and status effects.
 */

import { Card, CardContent } from "@/components/ui/card";
import { getEffectSummary } from "@/game/core/battle/status";
import type { Combatant } from "@/game/core/battle/turn";
import { getSpeciesById } from "@/game/data/species";
import { cn } from "@/lib/utils";

interface PetBattleCardProps {
  combatant: Combatant;
  position: "player" | "enemy";
}

/**
 * Displays a pet's battle status including HP bar, stamina, and effects.
 */
export function PetBattleCard({ combatant, position }: PetBattleCardProps) {
  const { derivedStats, statusEffects, name } = combatant;
  const hpPercent = (derivedStats.currentHealth / derivedStats.maxHealth) * 100;
  const staminaPercent =
    (derivedStats.currentStamina / derivedStats.maxStamina) * 100;

  const { buffs, debuffs, other } = getEffectSummary(statusEffects);

  // Get species emoji for display
  const species = getSpeciesById(name.replace("Wild ", "").toLowerCase());
  const emoji = species?.emoji ?? "🐾";

  return (
    <Card
      className={cn(
        "w-48",
        position === "enemy" ? "bg-red-50 dark:bg-red-950/20" : "",
      )}
    >
      <CardContent className="pt-4 pb-3 px-4">
        {/* Name and emoji */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{emoji}</span>
          <span className="font-semibold text-sm truncate">{name}</span>
        </div>

        {/* HP Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>HP</span>
            <span>
              {derivedStats.currentHealth}/{derivedStats.maxHealth}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                hpPercent > 50
                  ? "bg-green-500"
                  : hpPercent > 25
                    ? "bg-yellow-500"
                    : "bg-red-500",
              )}
              style={{ width: `${Math.max(0, hpPercent)}%` }}
            />
          </div>
        </div>

        {/* Stamina Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Stamina</span>
            <span>
              {derivedStats.currentStamina}/{derivedStats.maxStamina}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(0, staminaPercent)}%` }}
            />
          </div>
        </div>

        {/* Status Effects */}
        {statusEffects.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {buffs.map((effect) => (
              <span
                key={effect.id}
                className="text-xs px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                title={`${effect.name} (${effect.duration} turns)`}
              >
                ↑ {effect.stat?.slice(0, 3)}
              </span>
            ))}
            {debuffs.map((effect) => (
              <span
                key={effect.id}
                className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                title={`${effect.name} (${effect.duration} turns)`}
              >
                ↓ {effect.stat?.slice(0, 3) ?? "DoT"}
              </span>
            ))}
            {other.map((effect) => (
              <span
                key={effect.id}
                className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
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
