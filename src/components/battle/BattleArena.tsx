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
  /** When true, immediately sync displayed HP with actual HP (used for DoT, etc.) */
  syncHpNow?: boolean;
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
  syncHpNow = false,
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

  // Track previous states to detect changes
  // Initialize hit refs to false to ensure first render edge detection works
  const prevPlayerHitRef = useRef(false);
  const prevEnemyHitRef = useRef(false);
  const prevPlayerMaxHpRef = useRef(player.derivedStats.maxHealth);
  const prevEnemyMaxHpRef = useRef(enemy.derivedStats.maxHealth);
  const prevPlayerSpeciesRef = useRef(player.speciesId);
  const prevEnemySpeciesRef = useRef(enemy.speciesId);

  // Consolidated HP sync logic - handles all update scenarios in priority order:
  // 1. syncHpNow (DoT damage, etc.) - highest priority, sync immediately
  // 2. Hit animation trigger (rising edge) - sync on hit
  // 3. Combatant change (speciesId or maxHealth differs) - sync on new combatant
  // 4. Healing (HP increased) - sync immediately
  useEffect(() => {
    const playerCombatantChanged =
      player.derivedStats.maxHealth !== prevPlayerMaxHpRef.current ||
      player.speciesId !== prevPlayerSpeciesRef.current;
    const enemyCombatantChanged =
      enemy.derivedStats.maxHealth !== prevEnemyMaxHpRef.current ||
      enemy.speciesId !== prevEnemySpeciesRef.current;
    const playerHitRisingEdge = playerHit && !prevPlayerHitRef.current;
    const enemyHitRisingEdge = enemyHit && !prevEnemyHitRef.current;

    // Update player displayed HP
    if (syncHpNow || playerCombatantChanged) {
      // Immediate sync for DoT or combatant change
      setDisplayedPlayerHp(player.derivedStats.currentHealth);
    } else if (playerHitRisingEdge) {
      // Sync on hit animation start
      setDisplayedPlayerHp(player.derivedStats.currentHealth);
    } else {
      // Sync on healing (HP increase)
      setDisplayedPlayerHp((prev) =>
        player.derivedStats.currentHealth > prev
          ? player.derivedStats.currentHealth
          : prev,
      );
    }

    // Update enemy displayed HP
    if (syncHpNow || enemyCombatantChanged) {
      setDisplayedEnemyHp(enemy.derivedStats.currentHealth);
    } else if (enemyHitRisingEdge) {
      setDisplayedEnemyHp(enemy.derivedStats.currentHealth);
    } else {
      setDisplayedEnemyHp((prev) =>
        enemy.derivedStats.currentHealth > prev
          ? enemy.derivedStats.currentHealth
          : prev,
      );
    }

    // Update refs for next render
    prevPlayerHitRef.current = playerHit;
    prevEnemyHitRef.current = enemyHit;
    prevPlayerMaxHpRef.current = player.derivedStats.maxHealth;
    prevEnemyMaxHpRef.current = enemy.derivedStats.maxHealth;
    prevPlayerSpeciesRef.current = player.speciesId;
    prevEnemySpeciesRef.current = enemy.speciesId;
  }, [
    syncHpNow,
    playerHit,
    enemyHit,
    player.derivedStats.currentHealth,
    player.derivedStats.maxHealth,
    player.speciesId,
    enemy.derivedStats.currentHealth,
    enemy.derivedStats.maxHealth,
    enemy.speciesId,
  ]);

  // Create display combatants with buffered HP values
  // Note: No useMemo here since we spread the full objects and they change
  // frequently during battle - memoization would provide no benefit
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
