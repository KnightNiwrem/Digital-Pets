/**
 * Main App component.
 * Integrates the game context and layout.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ExplorationCompleteNotification,
  Layout,
  type NavigationTab,
  OfflineReport,
  StageTransitionNotification,
  TrainingCompleteNotification,
} from "@/components/game";
import {
  BattleScreen,
  CareScreen,
  ExplorationScreen,
  InventoryScreen,
  MapScreen,
  MenuScreen,
  NewGameScreen,
  QuestScreen,
  SkillsScreen,
  TrainingScreen,
} from "@/components/screens";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { GameProvider } from "@/game/context/GameContext";
import {
  type BattleRewards,
  createCombatantFromPet,
  createWildCombatant,
  initializeBattle,
} from "@/game/core/battle/battle";
import { updateQuestProgress } from "@/game/core/quests/quests";
import { useGameState } from "@/game/hooks/useGameState";
import type { BattleActionEvent, GameEvent } from "@/game/types/event";
import { ObjectiveType } from "@/game/types/quest";
import "./index.css";

/**
 * Main game content that renders based on active tab.
 */
function GameContent({
  activeTab,
  onTabChange,
}: {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}) {
  const { state, isLoading, loadError, offlineReport, notification, actions } =
    useGameState();

  // Get active battle from game state (persisted across page refreshes)
  const activeBattle = state?.activeBattle ?? null;

  // Get battle events from pending events for UI animations
  const battleEvents = useMemo(() => {
    if (!state?.pendingEvents) return [];
    return state.pendingEvents.filter(
      (e): e is BattleActionEvent => e.type === "battleAction",
    );
  }, [state?.pendingEvents]);

  // Redirect to exploration if battle tab is accessed without battle info
  // Also redirect back to battle if navigating to exploration during an active battle
  useEffect(() => {
    if (activeTab === "battle" && !activeBattle) {
      onTabChange("exploration");
    } else if (activeTab === "exploration" && activeBattle) {
      onTabChange("battle");
    }
  }, [activeTab, activeBattle, onTabChange]);

  // Show loading state
  if (isLoading) {
    return <LoadingState className="h-screen" />;
  }

  // Show error state
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive">Error loading game: {loadError}</p>
        <Button onClick={actions.resetGame}>Start New Game</Button>
      </div>
    );
  }

  // Show new game screen if no initialized game
  if (!state?.isInitialized) {
    return <NewGameScreen onStartGame={actions.startNewGame} />;
  }

  // Helper to filter out battle events from pending events
  const clearBattleEvents = (events: GameEvent[]) =>
    events.filter((e) => e.type !== "battleAction");

  // Handle starting a battle
  const handleStartBattle = (enemySpeciesId: string, enemyLevel: number) => {
    if (!state?.pet) return;

    // Set pet activity state to Battling and initialize battle inside updateState
    // to avoid stale pet data from concurrent state updates
    actions.updateState((prev) => {
      if (!prev.pet) return prev;

      const playerCombatant = createCombatantFromPet(prev.pet, true);
      const enemyCombatant = createWildCombatant(enemySpeciesId, enemyLevel);
      const battleState = initializeBattle(playerCombatant, enemyCombatant);

      return {
        ...prev,
        pet: { ...prev.pet, activityState: "battling" as const },
        activeBattle: { enemySpeciesId, enemyLevel, battleState },
        // Clear stale battle events to prevent animation replay
        pendingEvents: clearBattleEvents(prev.pendingEvents),
      };
    });

    onTabChange("battle");
  };

  // Handle battle end
  const handleBattleEnd = (victory: boolean, rewards: BattleRewards) => {
    // Reset pet activity state, clear battle, and apply rewards
    actions.updateState((prev) => {
      // First reset activity state, clear battle, and clear battle events
      const stateWithIdlePet = {
        ...prev,
        pet: prev.pet
          ? { ...prev.pet, activityState: "idle" as const }
          : prev.pet,
        activeBattle: undefined,
        // Clear battle events to prevent animation replay in next battle
        pendingEvents: clearBattleEvents(prev.pendingEvents),
      };

      if (!victory) {
        return stateWithIdlePet;
      }

      // Award coins
      const stateWithCoins = {
        ...stateWithIdlePet,
        player: {
          ...stateWithIdlePet.player,
          currency: {
            ...stateWithIdlePet.player.currency,
            coins: stateWithIdlePet.player.currency.coins + rewards.coins,
          },
        },
      };

      // Update quest progress for defeating the enemy
      // Use specific species ID if available, otherwise use "any"
      // Note: objectives with target "any" will match any species ID
      const defeatedTarget = prev.activeBattle?.enemySpeciesId ?? "any";
      const finalState = updateQuestProgress(
        stateWithCoins,
        ObjectiveType.Defeat,
        defeatedTarget,
      );

      return finalState;
    });

    onTabChange("exploration");
  };

  // Handle fleeing from battle
  const handleFlee = () => {
    // Reset pet activity state, clear battle, and clear battle events
    actions.updateState((prev) => ({
      ...prev,
      pet: prev.pet
        ? { ...prev.pet, activityState: "idle" as const }
        : prev.pet,
      activeBattle: undefined,
      pendingEvents: clearBattleEvents(prev.pendingEvents),
    }));

    onTabChange("exploration");
  };

  const renderScreen = () => {
    // Battle screen (special case - not in normal navigation)
    if (activeTab === "battle" && activeBattle) {
      return (
        <BattleScreen
          battleState={activeBattle.battleState}
          onBattleEnd={handleBattleEnd}
          onFlee={handleFlee}
          battleEvents={battleEvents}
          dispatch={actions.dispatchBattleAction}
        />
      );
    }

    switch (activeTab) {
      case "care":
        return <CareScreen />;
      case "inventory":
        return <InventoryScreen />;
      case "map":
        return <MapScreen />;
      case "exploration":
        return <ExplorationScreen onStartBattle={handleStartBattle} />;
      case "training":
        return <TrainingScreen />;
      case "skills":
        return <SkillsScreen />;
      case "quests":
        return <QuestScreen />;
      case "menu":
        return <MenuScreen />;
      case "battle":
        // Fallback if no battle info (useEffect will redirect)
        return <ExplorationScreen onStartBattle={handleStartBattle} />;
      default:
        return <CareScreen />;
    }
  };

  // Check if we're in battle mode (for layout adjustments)
  const isBattleActive = activeTab === "battle" && activeBattle !== null;

  return (
    <Layout activeTab={activeTab} onTabChange={onTabChange}>
      <div className={isBattleActive ? "" : "pb-20"}>{renderScreen()}</div>
      {offlineReport && (
        <OfflineReport
          report={offlineReport}
          onDismiss={actions.dismissOfflineReport}
        />
      )}
      {notification?.type === "stageTransition" && (
        <StageTransitionNotification
          previousStage={notification.previousStage}
          newStage={notification.newStage}
          petName={notification.petName}
          onDismiss={actions.dismissNotification}
        />
      )}
      {notification?.type === "trainingComplete" && (
        <TrainingCompleteNotification
          facilityName={notification.facilityName}
          statsGained={notification.statsGained}
          petName={notification.petName}
          onDismiss={actions.dismissNotification}
        />
      )}
      {notification?.type === "explorationComplete" && (
        <ExplorationCompleteNotification
          locationName={notification.locationName}
          itemsFound={notification.itemsFound}
          message={notification.message}
          petName={notification.petName}
          onDismiss={actions.dismissNotification}
        />
      )}
    </Layout>
  );
}

/**
 * Root App component with providers.
 */
export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>("care");

  return (
    <GameProvider>
      <GameContent activeTab={activeTab} onTabChange={setActiveTab} />
    </GameProvider>
  );
}

export default App;
