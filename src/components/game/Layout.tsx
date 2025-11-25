/**
 * Main game layout shell component.
 */

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that wraps the game screens.
 * Provides header, navigation, and content area.
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">{children}</main>
      <Navigation />
    </div>
  );
}
