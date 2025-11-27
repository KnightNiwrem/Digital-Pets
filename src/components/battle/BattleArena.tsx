/**
 * Battle arena component showing both combatants.
 */

import type { Combatant } from "@/game/core/battle/turn";
import { cn } from "@/lib/utils";
import { PetBattleCard } from "./PetBattleCard";

interface BattleArenaProps {
  player: Combatant;
  enemy: Combatant;
  playerAttacking?: boolean;
  enemyAttacking?: boolean;
  playerHit?: boolean;
  enemyHit?: boolean;
  className?: string;
}

/**
 * Displays the battle arena with both combatants facing each other.
 */
export function BattleArena({
  player,
  enemy,
  playerAttacking = false,
  enemyAttacking = false,
  playerHit = false,
  enemyHit = false,
  className,
}: BattleArenaProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Enemy (top) */}
      <div className="flex justify-end">
        <PetBattleCard
          combatant={enemy}
          position="enemy"
          isAttacking={enemyAttacking}
          isHit={enemyHit}
        />
      </div>

      {/* VS indicator */}
      <div className="flex justify-center">
        <span className="text-2xl font-bold text-muted-foreground">⚔️</span>
      </div>

      {/* Player (bottom) */}
      <div className="flex justify-start">
        <PetBattleCard
          combatant={player}
          position="player"
          isAttacking={playerAttacking}
          isHit={playerHit}
        />
      </div>
    </div>
  );
}
