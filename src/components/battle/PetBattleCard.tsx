/**
 * Pet battle card showing HP, stamina, and status effects.
 *
 * Uses visual state buffering to sync HP changes with hit animations.
 * The displayed HP only updates when the hit animation starts
 * (when isHit transitions from false to true), preventing the jarring effect
 * of HP dropping before the animation plays.
 */

import { useEffect, useMemo, useRef, useState } from "react";
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
 *
 * Uses visual state buffering: displayedHealth only updates when isHit
 * transitions from false to true, syncing the HP bar with the hit animation.
 */
export function PetBattleCard({
  combatant,
  position,
  isAttacking = false,
  isHit = false,
}: PetBattleCardProps) {
  const { derivedStats, statusEffects, name, speciesId } = combatant;

  // Visual state buffering: track displayed health separately from actual health
  const [displayedHealth, setDisplayedHealth] = useState(
    derivedStats.currentHealth,
  );
  const prevIsHitRef = useRef(isHit);
  const prevCombatantRef = useRef(combatant);

  // Unified effect for syncing displayed health with actual health
  // Handles: hit animations, healing, DoT damage, and combatant changes
  useEffect(() => {
    const wasHit = !prevIsHitRef.current && isHit;
    const combatantChanged = prevCombatantRef.current !== combatant;
    prevIsHitRef.current = isHit;
    prevCombatantRef.current = combatant;

    // Reset state when combatant changes (new battle)
    if (combatantChanged) {
      setDisplayedHealth(derivedStats.currentHealth);
      return;
    }

    // Update on hit animation start (attack damage)
    if (wasHit) {
      setDisplayedHealth(derivedStats.currentHealth);
      return;
    }

    // Handle healing or non-hit damage (e.g., DoT during turn resolution)
    // Use functional update to avoid infinite loops
    setDisplayedHealth((prev) => {
      // Healing: immediately reflect increased health
      if (derivedStats.currentHealth > prev) {
        return derivedStats.currentHealth;
      }
      // Non-hit damage (DoT): sync when not animating a hit
      if (derivedStats.currentHealth < prev && !isHit) {
        return derivedStats.currentHealth;
      }
      return prev;
    });
  }, [isHit, derivedStats.currentHealth, combatant]);

  // Use displayed health for the visual HP bar
  const hpPercent = clampPercent(displayedHealth, derivedStats.maxHealth);
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
              {displayedHealth}/{derivedStats.maxHealth}
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
