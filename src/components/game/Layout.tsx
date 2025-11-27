/**
 * Main game layout shell component.
 */

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Navigation, type NavigationTab } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

/**
 * Main layout component that wraps the game screens.
 * Provides header, navigation, and content area.
 */
export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto container mx-auto p-4 pb-24">
        {children}
      </main>
      <Navigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
