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
        "flex flex-row items-center justify-around gap-2 sm:gap-4 p-1 sm:p-4",
        className,
      )}
    >
      {/* Player (left) */}
      <PetBattleCard
        combatant={player}
        position="player"
        isAttacking={playerAttacking}
        isHit={playerHit}
      />

      {/* VS indicator */}
      <div className="flex justify-center shrink-0">
        <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
          ⚔️
        </span>
      </div>

      {/* Enemy (right) */}
      <PetBattleCard
        combatant={enemy}
        position="enemy"
        isAttacking={enemyAttacking}
        isHit={enemyHit}
      />
    </div>
  );
}
