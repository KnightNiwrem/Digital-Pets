/**
 * Hook for accessing game state from the context.
 */

import { useContext } from "react";
import { GameContext, type GameContextValue } from "@/game/context/GameContext";

/**
 * Hook to access the game state and actions.
 * Must be used within a GameProvider.
 */
export function useGameState(): GameContextValue {
  const context = useContext(GameContext);

  if (context.state === null && !context.isLoading) {
    throw new Error("useGameState must be used within a GameProvider");
  }

  return context;
}

/**
 * Hook to access only the game state (without actions).
 * Useful for components that only need to read state.
 */
export function useGameStateReadOnly() {
  const { state, isLoading, loadError } = useGameState();
  return { state, isLoading, loadError };
}

/**
 * Hook to access only the game actions (without state).
 * Useful for components that only need to dispatch actions.
 */
export function useGameActions() {
  const { actions } = useGameState();
  return actions;
}
