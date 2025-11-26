/**
 * Main App component.
 * Integrates the game context and layout.
 */

import { useState } from "react";
import {
  Layout,
  type NavigationTab,
  OfflineReport,
  StageTransitionNotification,
} from "@/components/game";
import {
  CareScreen,
  InventoryScreen,
  MapScreen,
  NewGameScreen,
  TrainingScreen,
} from "@/components/screens";
import { Button } from "@/components/ui/button";
import { GameProvider } from "@/game/context/GameContext";
import { useGameState } from "@/game/hooks/useGameState";
import "./index.css";

/**
 * Placeholder screen for tabs not yet implemented.
 */
function PlaceholderScreen({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">
        {name} screen will be implemented in a future milestone.
      </p>
    </div>
  );
}

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

  const renderScreen = () => {
    switch (activeTab) {
      case "care":
        return <CareScreen />;
      case "inventory":
        return <InventoryScreen />;
      case "map":
        return <MapScreen />;
      case "training":
        return <TrainingScreen />;
      case "skills":
        return <PlaceholderScreen name="Skills" />;
      case "quests":
        return <PlaceholderScreen name="Quests" />;
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
