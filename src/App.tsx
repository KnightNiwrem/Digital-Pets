/**
 * Main App component.
 * Integrates the game context and layout.
 */

import { useEffect, useState } from "react";
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
  NewGameScreen,
  QuestScreen,
  SkillsScreen,
  TrainingScreen,
} from "@/components/screens";
import { Button } from "@/components/ui/button";
import { GameProvider } from "@/game/context/GameContext";
import {
  type BattleRewards,
  createCombatantFromPet,
  createWildCombatant,
} from "@/game/core/battle/battle";
import { useGameState } from "@/game/hooks/useGameState";
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

  // Battle state
  const [battleInfo, setBattleInfo] = useState<{
    enemySpeciesId: string;
    enemyLevel: number;
  } | null>(null);

  // Redirect to exploration if battle tab is accessed without battle info
  useEffect(() => {
    if (activeTab === "battle" && !battleInfo) {
      onTabChange("exploration");
    }
  }, [activeTab, battleInfo, onTabChange]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
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

  // Handle starting a battle
  const handleStartBattle = (enemySpeciesId: string, enemyLevel: number) => {
    setBattleInfo({ enemySpeciesId, enemyLevel });
    onTabChange("battle");
  };

  // Handle battle end
  const handleBattleEnd = (victory: boolean, rewards: BattleRewards) => {
    if (victory && state) {
      // Award coins
      actions.updateState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          currency: {
            ...prev.player.currency,
            coins: prev.player.currency.coins + rewards.coins,
          },
        },
      }));
    }
    setBattleInfo(null);
    onTabChange("exploration");
  };

  // Handle fleeing from battle
  const handleFlee = () => {
    setBattleInfo(null);
    onTabChange("exploration");
  };

  const renderScreen = () => {
    // Battle screen (special case - not in normal navigation)
    if (activeTab === "battle" && battleInfo && state?.pet) {
      const playerCombatant = createCombatantFromPet(state.pet, true);
      const enemyCombatant = createWildCombatant(
        battleInfo.enemySpeciesId,
        battleInfo.enemyLevel,
      );
      return (
        <BattleScreen
          playerCombatant={playerCombatant}
          enemyCombatant={enemyCombatant}
          onBattleEnd={handleBattleEnd}
          onFlee={handleFlee}
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
      case "battle":
        // Fallback if no battle info (useEffect will redirect)
        return <ExplorationScreen onStartBattle={handleStartBattle} />;
      case "debug":
        // Debug tab triggers a dialog in Navigation, not a screen change
        return <CareScreen />;
      default:
        return <CareScreen />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={onTabChange}>
      <div className="pb-20">{renderScreen()}</div>
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
