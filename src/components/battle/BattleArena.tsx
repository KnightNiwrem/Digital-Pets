/**
 * Battle arena component showing both combatants.
 *
 * Implements "visual state buffering" to sync HP changes with animations:
 * - Maintains displayed HP separate from actual game state HP
 * - Updates displayed HP only when hit animation triggers (after attack animation)
 * - This ensures damage appears to happen when the attack "lands"
 */

import { useEffect, useRef, useState } from "react";
import type { Combatant } from "@/game/core/battle/turn";
import { BattleUI } from "@/game/data/uiText";
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
 * Uses visual state buffering to sync HP updates with hit animations.
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
  // Visual state buffering: track displayed HP separately from actual HP
  // This allows us to delay HP bar updates until the hit animation plays
  const [displayedPlayerHp, setDisplayedPlayerHp] = useState(
    player.derivedStats.currentHealth,
  );
  const [displayedEnemyHp, setDisplayedEnemyHp] = useState(
    enemy.derivedStats.currentHealth,
  );

  // Track previous hit states to detect rising edges (false -> true)
  const prevPlayerHitRef = useRef(false);
  const prevEnemyHitRef = useRef(false);

  // Update displayed HP when hit animation triggers (rising edge detection)
  useEffect(() => {
    // Player was just hit (enemy attacked) - update player's displayed HP
    if (playerHit && !prevPlayerHitRef.current) {
      setDisplayedPlayerHp(player.derivedStats.currentHealth);
    }
    prevPlayerHitRef.current = playerHit;
  }, [playerHit, player.derivedStats.currentHealth]);

  useEffect(() => {
    // Enemy was just hit (player attacked) - update enemy's displayed HP
    if (enemyHit && !prevEnemyHitRef.current) {
      setDisplayedEnemyHp(enemy.derivedStats.currentHealth);
    }
    prevEnemyHitRef.current = enemyHit;
  }, [enemyHit, enemy.derivedStats.currentHealth]);

  // Sync displayed HP on battle initialization or when HP increases (healing/new battle)
  useEffect(() => {
    if (player.derivedStats.currentHealth > displayedPlayerHp) {
      setDisplayedPlayerHp(player.derivedStats.currentHealth);
    }
  }, [player.derivedStats.currentHealth, displayedPlayerHp]);

  useEffect(() => {
    if (enemy.derivedStats.currentHealth > displayedEnemyHp) {
      setDisplayedEnemyHp(enemy.derivedStats.currentHealth);
    }
  }, [enemy.derivedStats.currentHealth, displayedEnemyHp]);

  // Create display combatants with buffered HP values
  const displayPlayer: Combatant = {
    ...player,
    derivedStats: {
      ...player.derivedStats,
      currentHealth: displayedPlayerHp,
    },
  };

  const displayEnemy: Combatant = {
    ...enemy,
    derivedStats: {
      ...enemy.derivedStats,
      currentHealth: displayedEnemyHp,
    },
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center justify-around gap-2 sm:gap-4 p-1 sm:p-4",
        className,
      )}
    >
      {/* Player (left) */}
      <PetBattleCard
        combatant={displayPlayer}
        position="player"
        isAttacking={playerAttacking}
        isHit={playerHit}
      />

      {/* VS indicator - decorative, hidden from screen readers */}
      <div className="flex justify-center shrink-0" aria-hidden="true">
        <span className="text-lg sm:text-2xl font-bold text-muted-foreground">
          {BattleUI.vsIndicator}
        </span>
      </div>

      {/* Enemy (right) */}
      <PetBattleCard
        combatant={displayEnemy}
        position="enemy"
        isAttacking={enemyAttacking}
        isHit={enemyHit}
      />
    </div>
  );
}
