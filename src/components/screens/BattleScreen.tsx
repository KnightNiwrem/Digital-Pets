/**
 * Battle screen for combat encounters.
 *
 * This component follows the "headless engine" pattern:
 * - Logic runs independently in the game tick processor
 * - UI reacts to state changes and events, playing animations
 * - Player input dispatches actions via the action-dispatch pattern
 *
 * The UI knows NOTHING about game rules/math - it simply expresses
 * intent via dispatched actions, and the game engine handles the logic.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BattleArena,
  BattleLog,
  MoveSelect,
  VictoryScreen,
} from "@/components/battle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BattlePhase,
  type BattleRewards,
  type BattleState,
  calculateBattleRewards,
  isBattleComplete,
} from "@/game/core/battle/battle";
import type { BattleAction } from "@/game/core/battle/battleActions";
import type { BattleActionEvent } from "@/game/types/event";
import type { Move } from "@/game/types/move";

/** Duration for attack animations (ms) */
const ATTACK_ANIMATION_DURATION_MS = 400;

interface BattleScreenProps {
  battleState: BattleState;
  onBattleEnd: (victory: boolean, rewards: BattleRewards) => void;
  onFlee?: () => void;
  /** Battle events from the game state for UI animations */
  battleEvents?: BattleActionEvent[];
  /** Dispatch function for battle actions */
  dispatch: (action: BattleAction) => void;
}

interface AnimationState {
  playerAttacking: boolean;
  enemyAttacking: boolean;
  playerHit: boolean;
  enemyHit: boolean;
  /** Force immediate HP sync (for DoT damage, etc.) */
  syncHpNow: boolean;
}

const initialAnimationState: AnimationState = {
  playerAttacking: false,
  enemyAttacking: false,
  playerHit: false,
  enemyHit: false,
  syncHpNow: false,
};

/**
 * Main battle screen component managing the battle flow.
 */
export function BattleScreen({
  battleState,
  onBattleEnd,
  onFlee,
  battleEvents = [],
  dispatch,
}: BattleScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>(
    initialAnimationState,
  );
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Track which events we've already processed to avoid duplicate animations
  const processedEventsRef = useRef<Set<number>>(new Set());
  // Guard against concurrent event processing
  const isProcessingRef = useRef(false);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Trigger attack animation (returns a promise for sequencing)
  const triggerAttackAnimation = useCallback((isPlayerAttack: boolean) => {
    return new Promise<void>((resolve) => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setAnimationState({
        playerAttacking: isPlayerAttack,
        enemyAttacking: !isPlayerAttack,
        playerHit: !isPlayerAttack,
        enemyHit: isPlayerAttack,
        syncHpNow: false,
      });

      animationTimeoutRef.current = setTimeout(() => {
        setAnimationState(initialAnimationState);
        resolve();
      }, ATTACK_ANIMATION_DURATION_MS);
    });
  }, []);

  // Trigger immediate HP sync for non-animated HP changes (DoT, etc.)
  const triggerHpSync = useCallback(() => {
    setAnimationState((prev) => ({ ...prev, syncHpNow: true }));
    // Reset syncHpNow on next tick to allow future syncs
    setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, syncHpNow: false }));
    }, 0);
  }, []);

  // Consume battle events for animations
  // The game state is ALREADY updated - we just play animations to visualize what happened
  useEffect(() => {
    let isMounted = true;

    const processEvents = async () => {
      // Guard against concurrent processing
      if (isProcessingRef.current) return;

      // Filter unprocessed events first
      const unprocessedEvents = battleEvents.filter(
        (event) => !processedEventsRef.current.has(event.timestamp),
      );

      if (unprocessedEvents.length === 0) return;

      isProcessingRef.current = true;
      if (isMounted) setIsAnimating(true);

      for (const event of unprocessedEvents) {
        processedEventsRef.current.add(event.timestamp);

        // Play appropriate animation based on event type
        if (event.action === "playerAttack") {
          await triggerAttackAnimation(true);
        } else if (event.action === "enemyAttack") {
          await triggerAttackAnimation(false);
        } else if (event.action === "turnResolved") {
          // turnResolved has no animation, but may include DoT damage
          // Signal BattleArena to sync HP immediately
          triggerHpSync();
        }
      }

      if (isMounted) setIsAnimating(false);
      isProcessingRef.current = false;
    };

    if (battleEvents.length > 0) {
      processEvents();
    }

    return () => {
      isMounted = false;
    };
  }, [battleEvents, triggerAttackAnimation, triggerHpSync]);

  // Handle player move selection
  // UI simply expresses intent via dispatch - logic runs in the engine
  const handleSelectMove = (move: Move) => {
    if (battleState.phase !== BattlePhase.PlayerTurn || isAnimating) {
      return;
    }

    // Dispatch action - UI knows nothing about game rules/math
    dispatch({
      type: "BATTLE_PLAYER_ATTACK",
      payload: { moveName: move.name },
    });
  };

  // Memoize battle completion info to avoid recalculating
  const battleResult = useMemo(() => {
    if (!isBattleComplete(battleState)) return null;
    const isVictory = battleState.phase === BattlePhase.Victory;
    const rewards = calculateBattleRewards(battleState, isVictory);
    return { isVictory, rewards };
  }, [battleState]);

  // Clear processed events when battle ends to prevent memory leak
  useEffect(() => {
    if (battleResult) {
      processedEventsRef.current.clear();
    }
  }, [battleResult]);

  // Show victory/defeat screen
  if (battleResult) {
    const handleContinue = () => {
      onBattleEnd(battleResult.isVictory, battleResult.rewards);
    };
    return (
      <VictoryScreen
        isVictory={battleResult.isVictory}
        rewards={battleResult.rewards}
        onContinue={handleContinue}
      />
    );
  }

  const isPlayerTurn = battleState.phase === BattlePhase.PlayerTurn;

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] overflow-hidden sm:h-auto sm:overflow-visible sm:gap-4 sm:pb-4">
      {/* Turn indicator - compact */}
      <Card className="shrink-0">
        <CardContent className="py-1.5 px-3 sm:py-2 sm:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg">⚔️</span>
            <span className="font-medium text-sm sm:text-base">
              Turn {battleState.turn}
            </span>
          </div>
          <span
            className={`text-xs sm:text-sm ${isPlayerTurn ? "text-green-600" : "text-red-600"}`}
          >
            {isPlayerTurn ? "Your turn" : "Enemy's turn..."}
          </span>
        </CardContent>
      </Card>

      {/* Scrollable middle section: Arena + Log */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 sm:space-y-4 py-2 sm:py-0">
        {/* Battle arena */}
        <BattleArena
          player={battleState.player}
          enemy={battleState.enemy}
          playerAttacking={animationState.playerAttacking}
          enemyAttacking={animationState.enemyAttacking}
          playerHit={animationState.playerHit}
          enemyHit={animationState.enemyHit}
          syncHpNow={animationState.syncHpNow}
        />

        {/* Battle log */}
        <BattleLog entries={battleState.log} />
      </div>

      {/* Fixed bottom: Move selection + Flee */}
      <div className="shrink-0 space-y-2 pt-2 bg-background">
        {/* Move selection (player's turn only) */}
        {isPlayerTurn && (
          <MoveSelect
            combatant={battleState.player}
            onSelectMove={handleSelectMove}
            disabled={isAnimating}
          />
        )}

        {/* Flee button */}
        {onFlee && isPlayerTurn && (
          <Button
            variant="outline"
            onClick={onFlee}
            disabled={isAnimating}
            className="w-full"
          >
            🏃 Flee
          </Button>
        )}
      </div>
    </div>
  );
}
