/**
 * React context for game state management.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createGameManager, type GameManager } from "@/game/GameManager";
import { deleteSave, loadGame, saveGame } from "@/game/state/persistence";
import type { GameState } from "@/game/types";

/**
 * Actions available through the game context.
 */
export interface GameContextActions {
  /** Update the game state */
  updateState: (updater: (state: GameState) => GameState) => void;
  /** Save the current game state */
  save: () => boolean;
  /** Reset the game to initial state */
  resetGame: () => void;
}

/**
 * Game context value combining state and actions.
 */
export interface GameContextValue {
  /** Current game state (null during loading or on error) */
  state: GameState | null;
  /** Whether the game is loading */
  isLoading: boolean;
  /** Load error message if any */
  loadError: string | null;
  /** Available actions */
  actions: GameContextActions;
}

/**
 * React context for game state.
 */
export const GameContext = createContext<GameContextValue | undefined>(
  undefined,
);

/**
 * Props for GameProvider.
 */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * Game context provider component.
 * Handles loading, saving, state management, and game loop.
 */
export function GameProvider({ children }: GameProviderProps) {
  const [state, setState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  const updateState = useCallback(
    (updater: (state: GameState) => GameState) => {
      setState((prev) => {
        if (!prev) return prev;
        return updater(prev);
      });
    },
    [],
  );

  // Load game on mount and start game loop
  useEffect(() => {
    const result = loadGame();
    if (result.success) {
      setState(result.state);

      // Create game manager and process offline ticks
      const manager = createGameManager(updateState);
      gameManagerRef.current = manager;

      // Process any offline time
      if (result.state.lastSaveTime) {
        manager.processOffline(result.state.lastSaveTime);
      }

      // Start the game loop
      manager.start();
    } else {
      setLoadError(result.error);
    }
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.stop();
      }
    };
  }, [updateState]);

  // Auto-save on state change (debounced would be better in production)
  useEffect(() => {
    if (state && !isLoading) {
      saveGame(state);
    }
  }, [state, isLoading]);

  const save = useCallback(() => {
    if (!state) return false;
    return saveGame(state);
  }, [state]);

  const resetGame = useCallback(() => {
    // Stop the current game loop
    if (gameManagerRef.current) {
      gameManagerRef.current.stop();
    }

    deleteSave();
    const result = loadGame();
    if (result.success) {
      setState(result.state);
      setLoadError(null);

      // Create a new game manager and start the loop
      const manager = createGameManager(updateState);
      gameManagerRef.current = manager;
      manager.start();
    } else {
      setLoadError(result.error);
    }
  }, [updateState]);

  const contextValue: GameContextValue = {
    state,
    isLoading,
    loadError,
    actions: {
      updateState,
      save,
      resetGame,
    },
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}
