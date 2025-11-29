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
  initializeBattle,
  isBattleComplete,
  resolveTurnEnd,
} from "@/game/core/battle/battle";
import type { Combatant } from "@/game/core/battle/turn";
import type { Move } from "@/game/types/move";

/** Delay for enemy turn processing (ms) */
const ENEMY_TURN_DELAY_MS = 800;
/** Delay for turn resolution processing (ms) */
const TURN_RESOLUTION_DELAY_MS = 500;
/** Duration for attack animations (ms) */
const ATTACK_ANIMATION_DURATION_MS = 400;

interface BattleScreenProps {
  playerCombatant: Combatant;
  enemyCombatant: Combatant;
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
  playerCombatant,
  enemyCombatant,
  onBattleEnd,
  onFlee,
}: BattleScreenProps) {
  const [battleState, setBattleState] = useState<BattleState>(() =>
    initializeBattle(playerCombatant, enemyCombatant),
  );
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
          setBattleState((prev) => executeEnemyTurn(prev));
          setIsProcessing(false);
        });
      }, ENEMY_TURN_DELAY_MS);
      return () => clearTimeout(timeout);
    }

    if (battleState.phase === BattlePhase.TurnResolution) {
      setIsProcessing(true);
      const timeout = setTimeout(() => {
        setBattleState((prev) => resolveTurnEnd(prev));
        setIsProcessing(false);
      }, TURN_RESOLUTION_DELAY_MS);
      return () => clearTimeout(timeout);
    }
  }, [battleState.phase, triggerAttackAnimation]);

  const handleSelectMove = (move: Move) => {
    if (battleState.phase !== BattlePhase.PlayerTurn || isProcessing) {
      return;
    }
    setIsProcessing(true);
    triggerAttackAnimation(true, () => {
      setBattleState((prev) => executePlayerTurn(prev, move));
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
    <div className="flex flex-col gap-2 md:gap-4 pb-4 min-h-[calc(100dvh-8rem)]">
      {/* Turn indicator */}
      <Card>
        <CardContent className="py-1.5 md:py-2 px-3 md:px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-lg">⚔️</span>
            <span className="font-medium text-sm md:text-base">
              Turn {battleState.turn}
            </span>
          </div>
          <span
            className={`text-xs md:text-sm ${isPlayerTurn ? "text-green-600" : "text-red-600"}`}
          >
            {isPlayerTurn ? "Your turn" : "Enemy's turn..."}
          </span>
        </CardContent>
      </Card>

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

      {/* Spacer to push actions to bottom on mobile */}
      <div className="flex-1" />

      {/* Move selection and flee button - sticky on mobile */}
      <div className="sticky bottom-20 bg-background pt-2 space-y-2">
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
