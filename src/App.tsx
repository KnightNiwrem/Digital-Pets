/**
 * Main App component.
 * Integrates the game context and layout.
 */

import { useState } from "react";
import { Layout, type NavigationTab } from "@/components/game";
import { CareScreen } from "@/components/screens";
import { GameProvider } from "@/game/context/GameContext";
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
  const renderScreen = () => {
    switch (activeTab) {
      case "care":
        return <CareScreen />;
      case "inventory":
        return <PlaceholderScreen name="Inventory" />;
      case "map":
        return <PlaceholderScreen name="Map" />;
      case "training":
        return <PlaceholderScreen name="Training" />;
      case "skills":
        return <PlaceholderScreen name="Skills" />;
      case "quests":
        return <PlaceholderScreen name="Quests" />;
      default:
        return <CareScreen />;
    }
  };

  return (
    <Layout>
      <div className="pb-20">{renderScreen()}</div>
      <div className="fixed bottom-0 left-0 right-0">
        <nav className="border-t bg-card">
          <div className="container mx-auto px-2">
            <div className="flex justify-around py-2">
              {(
                [
                  { id: "care", label: "Care", icon: "🏠" },
                  { id: "inventory", label: "Items", icon: "🎒" },
                  { id: "map", label: "Map", icon: "🗺️" },
                  { id: "training", label: "Train", icon: "💪" },
                  { id: "skills", label: "Skills", icon: "⭐" },
                  { id: "quests", label: "Quests", icon: "📜" },
                ] as const
              ).map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-xs">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
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
