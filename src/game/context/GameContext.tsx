/**
 * React context for game state management.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  /** Current game state */
  state: GameState;
  /** Whether the game is loading */
  isLoading: boolean;
  /** Load error message if any */
  loadError: string | null;
  /** Available actions */
  actions: GameContextActions;
}

/**
 * Default context value (used before initialization).
 */
const defaultContextValue: GameContextValue = {
  state: null as unknown as GameState,
  isLoading: true,
  loadError: null,
  actions: {
    updateState: () => {},
    save: () => false,
    resetGame: () => {},
  },
};

/**
 * React context for game state.
 */
export const GameContext = createContext<GameContextValue>(defaultContextValue);

/**
 * Props for GameProvider.
 */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * Game context provider component.
 * Handles loading, saving, and state management.
 */
export function GameProvider({ children }: GameProviderProps) {
  const [state, setState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load game on mount
  useEffect(() => {
    const result = loadGame();
    if (result.success) {
      setState(result.state);
    } else {
      setLoadError(result.error);
    }
    setIsLoading(false);
  }, []);

  // Auto-save on state change (debounced would be better in production)
  useEffect(() => {
    if (state && !isLoading) {
      saveGame(state);
    }
  }, [state, isLoading]);

  const updateState = useCallback(
    (updater: (state: GameState) => GameState) => {
      setState((prev) => {
        if (!prev) return prev;
        return updater(prev);
      });
    },
    [],
  );

  const save = useCallback(() => {
    if (!state) return false;
    return saveGame(state);
  }, [state]);

  const resetGame = useCallback(() => {
    deleteSave();
    const result = loadGame();
    if (result.success) {
      setState(result.state);
      setLoadError(null);
    }
  }, []);

  const contextValue: GameContextValue = {
    state: state as GameState,
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
