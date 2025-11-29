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
  BattlePhase,
  type BattleRewards,
  type BattleState,
  calculateBattleRewards,
  executeEnemyTurn,
  executePlayerTurn,
  isBattleComplete,
  resolveTurnEnd,
} from "@/game/core/battle/battle";
import type { Move } from "@/game/types/move";

/** Delay for enemy turn processing (ms) */
const ENEMY_TURN_DELAY_MS = 800;
/** Delay for turn resolution processing (ms) */
const TURN_RESOLUTION_DELAY_MS = 500;
/** Duration for attack animations (ms) */
const ATTACK_ANIMATION_DURATION_MS = 400;

interface BattleScreenProps {
  battleState: BattleState;
  onBattleStateChange: (state: BattleState) => void;
  onBattleEnd: (victory: boolean, rewards: BattleRewards) => void;
  onFlee?: () => void;
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
 */
export function BattleScreen({
  battleState,
  onBattleStateChange,
  onBattleEnd,
  onFlee,
}: BattleScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>(
    initialAnimationState,
  );
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Cleanup animation timeout on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  // Trigger attack animation
  const triggerAttackAnimation = useCallback(
    (isPlayerAttack: boolean, onComplete: () => void) => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
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

  // Process game loop (Enemy Turn & Turn Resolution)
  useEffect(() => {
    if (battleState.phase === BattlePhase.EnemyTurn) {
      setIsProcessing(true);
      // Small delay for dramatic effect
      const timeout = setTimeout(() => {
        triggerAttackAnimation(false, () => {
          onBattleStateChange(executeEnemyTurn(battleState));
          setIsProcessing(false);
        });
      }, ENEMY_TURN_DELAY_MS);
      return () => clearTimeout(timeout);
    }

    if (battleState.phase === BattlePhase.TurnResolution) {
      setIsProcessing(true);
      const timeout = setTimeout(() => {
        onBattleStateChange(resolveTurnEnd(battleState));
        setIsProcessing(false);
      }, TURN_RESOLUTION_DELAY_MS);
      return () => clearTimeout(timeout);
    }
  }, [battleState, onBattleStateChange, triggerAttackAnimation]);

  const handleSelectMove = (move: Move) => {
    if (battleState.phase !== BattlePhase.PlayerTurn || isProcessing) {
      return;
    }
    setIsProcessing(true);
    triggerAttackAnimation(true, () => {
      onBattleStateChange(executePlayerTurn(battleState, move));
      setIsProcessing(false);
    });
  };

  // Memoize battle completion info to avoid recalculating
  const battleResult = useMemo(() => {
    if (!isBattleComplete(battleState)) return null;
    const isVictory = battleState.phase === BattlePhase.Victory;
    const rewards = calculateBattleRewards(battleState, isVictory);
    return { isVictory, rewards };
  }, [battleState]);

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
            onClick={onFlee}
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
