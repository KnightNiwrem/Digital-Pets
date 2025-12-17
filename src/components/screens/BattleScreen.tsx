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
 *
 * Animation Synchronization:
 * The game state updates HP instantly, but we need to show animations first.
 * This component buffers combatant state and only updates the visual HP
 * when animations complete, ensuring proper cause-effect visual ordering.
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
import type { Combatant } from "@/game/core/battle/turn";
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
}

const initialAnimationState: AnimationState = {
  playerAttacking: false,
  enemyAttacking: false,
  playerHit: false,
  enemyHit: false,
};

/**
 * Main battle screen component managing the battle flow.
 *
 * Uses visual state buffering: displayedPlayer/displayedEnemy hold the HP values
 * shown to the user, which only update when attack animations complete.
 * This ensures the HP bar drops AFTER the attack animation plays.
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
  // Visual state buffering: these hold the combatant states shown to the user
  // They only update when animations complete, not immediately when state changes
  const [displayedPlayer, setDisplayedPlayer] = useState<Combatant>(
    battleState.player,
  );
  const [displayedEnemy, setDisplayedEnemy] = useState<Combatant>(
    battleState.enemy,
  );

  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Track which events we've already processed to avoid duplicate animations
  const processedEventsRef = useRef<Set<number>>(new Set());
  // Guard against concurrent event processing
  const isProcessingRef = useRef(false);
  // Track if we have pending state updates to apply after animation
  const pendingStateRef = useRef<{
    player: Combatant;
    enemy: Combatant;
  } | null>(null);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Sync displayed state when battle/combatant changes (new battle started)
  useEffect(() => {
    // Only sync if not currently animating - prevents mid-animation resets
    if (!isAnimating) {
      setDisplayedPlayer(battleState.player);
      setDisplayedEnemy(battleState.enemy);
    } else {
      // Store pending state to apply after animation completes
      pendingStateRef.current = {
        player: battleState.player,
        enemy: battleState.enemy,
      };
    }
  }, [battleState.player, battleState.enemy, isAnimating]);

  // Apply pending state updates after animation completes
  const applyPendingState = useCallback(() => {
    if (pendingStateRef.current) {
      setDisplayedPlayer(pendingStateRef.current.player);
      setDisplayedEnemy(pendingStateRef.current.enemy);
      pendingStateRef.current = null;
    }
  }, []);

  // Trigger attack animation and update the target's displayed HP when animation starts
  const triggerAttackAnimation = useCallback(
    (isPlayerAttack: boolean) => {
      return new Promise<void>((resolve) => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
        }

        // Start animation
        setAnimationState({
          playerAttacking: isPlayerAttack,
          enemyAttacking: !isPlayerAttack,
          playerHit: !isPlayerAttack,
          enemyHit: isPlayerAttack,
        });

        // Update the target's HP when animation starts (synced with visual impact)
        // The attacker's state may have changed too (e.g., stamina), so update both
        if (isPlayerAttack) {
          // Player attacked enemy - update enemy HP
          setDisplayedEnemy(battleState.enemy);
          setDisplayedPlayer(battleState.player);
        } else {
          // Enemy attacked player - update player HP
          setDisplayedPlayer(battleState.player);
          setDisplayedEnemy(battleState.enemy);
        }

        animationTimeoutRef.current = setTimeout(() => {
          setAnimationState(initialAnimationState);
          applyPendingState();
          resolve();
        }, ATTACK_ANIMATION_DURATION_MS);
      });
    },
    [battleState.player, battleState.enemy, applyPendingState],
  );

  // Consume battle events for animations
  // The game state is ALREADY updated - we buffer the visual state
  // and only show HP changes when the animation triggers
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
          // Turn resolved: update both combatants for DoT/status effects
          setDisplayedPlayer(battleState.player);
          setDisplayedEnemy(battleState.enemy);
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
  }, [
    battleEvents,
    triggerAttackAnimation,
    battleState.player,
    battleState.enemy,
  ]);

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
        {/* Battle arena - uses buffered displayed state for HP sync */}
        <BattleArena
          player={displayedPlayer}
          enemy={displayedEnemy}
          playerAttacking={animationState.playerAttacking}
          enemyAttacking={animationState.enemyAttacking}
          playerHit={animationState.playerHit}
          enemyHit={animationState.enemyHit}
        />

        {/* Battle log */}
        <BattleLog entries={battleState.log} />
      </div>

      {/* Fixed bottom: Move selection + Flee */}
      <div className="shrink-0 space-y-2 pt-2 bg-background">
        {/* Move selection (player's turn only) - uses real state for move availability */}
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
