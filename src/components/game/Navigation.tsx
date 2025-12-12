/**
 * Navigation component with tab navigation between screens.
 */

import { cn } from "@/lib/utils";

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

  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    let newIndex: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
        newIndex = currentIndex > 0 ? currentIndex - 1 : TABS.length - 1;
        break;
      case "ArrowRight":
        newIndex = currentIndex < TABS.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = TABS.length - 1;
        break;
      case " ":
      case "Enter":
        handleTabClick(TABS[currentIndex]?.id ?? "care");
        event.preventDefault();
        return;
      default:
        return;
    }

    if (newIndex !== null) {
      event.preventDefault();
      const newTab = TABS[newIndex];
      if (newTab) {
        handleTabClick(newTab.id);
        const button = document.querySelector(
          `[aria-controls="${newTab.id}-panel"]`,
        ) as HTMLButtonElement | null;
        button?.focus();
      }
    }
  };

  return (
    <nav
      aria-label="Main Navigation"
      className="border-t bg-card fixed bottom-0 left-0 right-0 safe-area-inset-bottom"
    >
      <div className="container mx-auto px-1">
        <div
          role="tablist"
          className="flex sm:justify-center overflow-x-auto no-scrollbar py-2 gap-1 sm:gap-4"
        >
          {TABS.map((tab, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id ? "true" : "false"}
              aria-controls={`${tab.id}-panel`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 min-w-[4.5rem] rounded-lg transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
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
