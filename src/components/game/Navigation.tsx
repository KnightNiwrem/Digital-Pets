/**
 * Navigation component with tab navigation between screens.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameActions } from "@/game/hooks/useGameState";

/**
 * Navigation tabs for the game.
 */
export type NavigationTab =
  | "care"
  | "inventory"
  | "map"
  | "exploration"
  | "training"
  | "skills"
  | "quests"
  | "debug";

interface NavigationProps {
  activeTab?: NavigationTab;
  onTabChange?: (tab: NavigationTab) => void;
}

const TABS: { id: NavigationTab; label: string; icon: string }[] = [
  { id: "care", label: "Care", icon: "🏠" },
  { id: "inventory", label: "Items", icon: "🎒" },
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "exploration", label: "Explore", icon: "🌿" },
  { id: "training", label: "Train", icon: "💪" },
  { id: "skills", label: "Skills", icon: "⭐" },
  { id: "quests", label: "Quests", icon: "📜" },
  { id: "debug", label: "Debug", icon: "🔧" },
];

/**
 * Bottom navigation bar for switching between game screens.
 */
export function Navigation({
  activeTab = "care",
  onTabChange,
}: NavigationProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { resetGame } = useGameActions();

  const handleTabClick = (tab: NavigationTab) => {
    if (tab === "debug") {
      setShowDeleteConfirm(true);
      return;
    }
    onTabChange?.(tab);
  };

  const handleDeleteSave = () => {
    resetGame();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <nav className="border-t bg-card fixed bottom-0 left-0 right-0">
        <div className="container mx-auto px-2">
          <div className="flex justify-around py-2">
            {TABS.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
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

      {/* Delete Save Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 m-4 max-w-sm w-full shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Delete Save Data?</h2>
            <p className="text-muted-foreground mb-4">
              This will permanently delete all your progress. This action cannot
              be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSave}>
                Delete Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
