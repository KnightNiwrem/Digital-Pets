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
import { processOfflineCatchup } from "@/game/core/tickProcessor";
import { calculateElapsedTicks, MAX_OFFLINE_TICKS } from "@/game/core/time";
import {
  createNewPet,
  getStartingInventory,
  STARTING_COINS,
} from "@/game/data/starting";
import { createGameManager, type GameManager } from "@/game/GameManager";
import {
  deleteSave,
  hasSave,
  loadGame,
  saveGame,
} from "@/game/state/persistence";
import { createInitialGameState, type GameState, type Pet } from "@/game/types";

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
  /** Start a new game with given pet name and species */
  startNewGame: (petName: string, speciesId: string) => void;
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
  /** Whether a save exists (for showing new game vs load game) */
  hasSaveData: boolean;
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
  const [hasSaveData, setHasSaveData] = useState(false);
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

  /**
   * Process offline ticks and return the updated state.
   * This is done before setting state to avoid race conditions.
   */
  const processOffline = useCallback((gameState: GameState): GameState => {
    if (!gameState.lastSaveTime) return gameState;

    const ticksElapsed = calculateElapsedTicks(gameState.lastSaveTime);
    if (ticksElapsed <= 0) return gameState;

    const { state: newState } = processOfflineCatchup(
      gameState,
      ticksElapsed,
      MAX_OFFLINE_TICKS,
    );
    return newState;
  }, []);

  /**
   * Start the game with the given state.
   * Processes offline ticks before setting state, then starts the game loop.
   */
  const startGame = useCallback(
    (gameState: GameState) => {
      // Process offline ticks before setting state to avoid race condition
      const stateWithOffline = processOffline(gameState);
      setState(stateWithOffline);

      // Create game manager and start the loop
      const manager = createGameManager(updateState);
      gameManagerRef.current = manager;
      manager.start();
    },
    [processOffline, updateState],
  );

  // Load game on mount and start game loop
  useEffect(() => {
    const saveExists = hasSave();
    setHasSaveData(saveExists);

    if (saveExists) {
      const result = loadGame();
      if (result.success && result.state.isInitialized) {
        startGame(result.state);
      } else if (!result.success) {
        setLoadError(result.error);
      }
      // If save exists but is not initialized (e.g., from a previous incomplete game creation),
      // delete the corrupted save and let user start fresh
      if (result.success && !result.state.isInitialized) {
        deleteSave();
        setHasSaveData(false);
      }
    }
    // If no save, wait for startNewGame to be called
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      if (gameManagerRef.current) {
        gameManagerRef.current.stop();
      }
    };
  }, [startGame]);

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
    setHasSaveData(false);
    setState(null);
    setLoadError(null);
  }, []);

  const startNewGame = useCallback(
    (petName: string, speciesId: string) => {
      // Stop any existing game loop before starting a new one
      if (gameManagerRef.current) {
        gameManagerRef.current.stop();
      }

      // Create new pet with given name and species, handle errors gracefully
      let pet: Pet;
      try {
        pet = createNewPet(petName, speciesId);
      } catch (error) {
        console.error("Failed to create new pet:", error);
        setLoadError(
          error instanceof Error ? error.message : "Failed to create pet",
        );
        return;
      }

      // Create initial game state with pet and starting items
      const newState: GameState = {
        ...createInitialGameState(),
        pet,
        player: {
          inventory: { items: getStartingInventory() },
          currency: { coins: STARTING_COINS },
          currentLocationId: "home",
        },
        isInitialized: true,
      };

      // Start the game with the new state
      // Note: setHasSaveData is set after startGame for consistency,
      // ensuring state is initialized before marking that save data exists.
      startGame(newState);
      setHasSaveData(true);
    },
    [startGame],
  );

  const contextValue: GameContextValue = {
    state,
    isLoading,
    loadError,
    hasSaveData,
    actions: {
      updateState,
      save,
      resetGame,
      startNewGame,
    },
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}
