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
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-around gap-2 md:gap-4 p-2 md:p-4",
        className,
      )}
    >
      {/* Enemy (top on mobile, right on desktop) */}
      <div className="flex justify-end md:order-3">
        <PetBattleCard
          combatant={enemy}
          position="enemy"
          isAttacking={enemyAttacking}
          isHit={enemyHit}
        />
      </div>

      {/* VS indicator */}
      <div className="flex justify-center md:order-2">
        <span className="text-2xl font-bold text-muted-foreground">⚔️</span>
      </div>

      {/* Player (bottom on mobile, left on desktop) */}
      <div className="flex justify-start md:order-1">
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
