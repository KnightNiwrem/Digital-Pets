/**
 * Navigation component with tab navigation between screens.
 */

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
  | "menu"
  | "battle";

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
  { id: "menu", label: "Menu", icon: "⚙️" },
];

/**
 * Bottom navigation bar for switching between game screens.
 */
export function Navigation({
  activeTab = "care",
  onTabChange,
}: NavigationProps) {
  const handleTabClick = (tab: NavigationTab) => {
    onTabChange?.(tab);
  };

  return (
    <nav className="border-t bg-card fixed bottom-0 left-0 right-0 safe-area-inset-bottom">
      <div className="container mx-auto px-1">
        <div className="flex sm:justify-center overflow-x-auto no-scrollbar py-2 gap-1 sm:gap-4">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[4.5rem] rounded-lg transition-colors flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
