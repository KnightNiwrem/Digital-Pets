/**
 * Battle screen for combat encounters.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
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

  // Trigger attack animation
  const triggerAttackAnimation = useCallback(
    (isPlayerAttack: boolean, onComplete: () => void) => {
      setAnimationState((prev) => ({
        ...prev,
        playerAttacking: isPlayerAttack,
        enemyAttacking: !isPlayerAttack,
        playerHit: !isPlayerAttack,
        enemyHit: isPlayerAttack,
      }));

      setTimeout(() => {
        setAnimationState(initialAnimationState);
        onComplete();
      }, ATTACK_ANIMATION_DURATION_MS);
    },
    [],
  );

  // Process enemy turn automatically after player acts
  useEffect(() => {
    if (battleState.phase === BattlePhase.EnemyTurn && !isProcessing) {
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
  }, [battleState.phase, isProcessing, triggerAttackAnimation]);

  // Process turn resolution automatically
  useEffect(() => {
    if (battleState.phase === BattlePhase.TurnResolution && !isProcessing) {
      setIsProcessing(true);
      const timeout = setTimeout(() => {
        setBattleState((prev) => resolveTurnEnd(prev));
        setIsProcessing(false);
      }, TURN_RESOLUTION_DELAY_MS);
      return () => clearTimeout(timeout);
    }
  }, [battleState.phase, isProcessing]);

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
    <div className="flex flex-col gap-4 h-full">
      {/* Turn indicator */}
      <Card>
        <CardContent className="py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <span className="font-medium">Turn {battleState.turn}</span>
          </div>
          <span
            className={`text-sm ${isPlayerTurn ? "text-green-600" : "text-red-600"}`}
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
  );
}
