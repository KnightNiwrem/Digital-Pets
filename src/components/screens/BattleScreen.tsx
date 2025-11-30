/**
 * Battle screen for combat encounters.
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
  type BattleEvent,
  BattlePhase,
  type BattleRewards,
  type BattleState,
  calculateBattleRewards,
  isBattleComplete,
} from "@/game/core/battle/battle";
import {
  processBattleRound,
  processFleeAttempt,
} from "@/game/core/battle/system";
import type { Move } from "@/game/types/move";

/** Duration for attack animations (ms) */
const ATTACK_ANIMATION_DURATION_MS = 400;
/** Delay between sequential events (ms) */
const EVENT_PLAYBACK_DELAY_MS = 800;

import type { GameState } from "@/game/types/gameState";

interface BattleScreenProps {
  battleState: BattleState;
  // Legacy prop - might be removed in future but kept for interface compatibility if needed elsewhere
  onBattleStateChange?: (state: BattleState) => void;
  onBattleEnd: (victory: boolean, rewards: BattleRewards) => void;
  onFlee?: () => void;
  // Helper to dispatch game updates (like context.updateState)
  dispatchUpdate: (updater: (state: GameState) => GameState) => void;
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
 * Refactored to be event-driven and "headless".
 */
export function BattleScreen({
  battleState,
  onBattleEnd,
  onFlee,
  dispatchUpdate,
}: BattleScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>(
    initialAnimationState,
  );

  // Track the last processed event timestamp to avoid replaying old events
  // Initialize with current time so we don't replay old history on reload
  const [lastProcessedEventTime, setLastProcessedEventTime] = useState<number>(
    Date.now(),
  );

  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const playbackQueueRef = useRef<BattleEvent[]>([]);
  const isPlayingRef = useRef(false);

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Trigger attack animation helper
  const triggerAttackAnimation = useCallback(
    (actorId: string, onComplete: () => void) => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      const isPlayerAttack = actorId === "player";

      setAnimationState((prev) => ({
        ...prev,
        playerAttacking: isPlayerAttack,
        enemyAttacking: !isPlayerAttack,
        playerHit: !isPlayerAttack,
        enemyHit: isPlayerAttack,
      }));

      animationTimeoutRef.current = setTimeout(() => {
        setAnimationState(initialAnimationState);
        onComplete();
      }, ATTACK_ANIMATION_DURATION_MS);
    },
    [],
  );

  // Event Playback System
  const playNextEvent = useCallback(() => {
    if (playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsProcessing(false);
      return;
    }

    isPlayingRef.current = true;
    const event = playbackQueueRef.current.shift();

    if (!event) return;

    // Process based on event type
    if (event.type === "ATTACK") {
      triggerAttackAnimation(event.actorId, () => {
        // Add a small delay before next event
        setTimeout(playNextEvent, EVENT_PLAYBACK_DELAY_MS / 2);
      });
    } else if (event.type === "VICTORY" || event.type === "DEFEAT") {
      // For end game events, just wait a bit then continue
      setTimeout(playNextEvent, EVENT_PLAYBACK_DELAY_MS);
    } else {
      // For other events (BUFF, HEAL, etc.), just wait delay
      setTimeout(playNextEvent, EVENT_PLAYBACK_DELAY_MS);
    }

    // We could update a "current displayed log" here if we wanted step-by-step logs
  }, [triggerAttackAnimation]);

  // Watch for new round events in the state
  useEffect(() => {
    if (battleState.roundEvents && battleState.roundEvents.length > 0) {
      // Filter for new events only
      // Capture local reference to avoid undefined checks inside filter
      const events = battleState.roundEvents;
      const newEvents = events.filter(
        (e) => e.timestamp > lastProcessedEventTime,
      );

      if (newEvents.length > 0) {
        // Update tracker
        // Ensure we have a valid event before accessing timestamp
        const lastEvent = newEvents[newEvents.length - 1];
        if (lastEvent) {
          setLastProcessedEventTime(lastEvent.timestamp);
        }

        // Add to queue
        playbackQueueRef.current = [...playbackQueueRef.current, ...newEvents];

        // Start playback if not already running
        if (!isPlayingRef.current) {
          setIsProcessing(true);
          playNextEvent();
        }
      }
    }
  }, [battleState.roundEvents, lastProcessedEventTime, playNextEvent]);

  const handleSelectMove = (move: Move) => {
    if (battleState.phase !== BattlePhase.PlayerTurn || isProcessing) {
      return;
    }

    setIsProcessing(true);

    // Call the "Headless" system
    // We use dispatchUpdate to update the global GameState
    dispatchUpdate((state) => {
      return processBattleRound(state, move);
    });
  };

  const handleFlee = () => {
    if (isProcessing) return;

    setIsProcessing(true);

    dispatchUpdate((state) => {
      return processFleeAttempt(state);
    });

    if (onFlee) {
      // We rely on state update to trigger effect or close screen,
      // but legacy onFlee might just close the modal.
      // For now we keep onFlee for compatibility if needed, but logic is in processFleeAttempt
    }
  };

  // Memoize battle completion info to avoid recalculating
  const battleResult = useMemo(() => {
    if (!isBattleComplete(battleState)) return null;
    // Only show result if we are done processing events (animations finished)
    if (isProcessing) return null;

    const isVictory = battleState.phase === BattlePhase.Victory;
    const rewards = calculateBattleRewards(battleState, isVictory);
    return { isVictory, rewards };
  }, [battleState, isProcessing]);

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
            disabled={isProcessing}
          />
        )}

        {/* Flee button */}
        {onFlee && isPlayerTurn && (
          <Button
            variant="outline"
            onClick={handleFlee}
            disabled={isProcessing}
            className="w-full"
          >
            🏃 Flee
          </Button>
        )}
      </div>
    </div>
  );
}
