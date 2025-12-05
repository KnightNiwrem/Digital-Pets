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
import type { BattleAction } from "@/game/core/battle/battleActions";
import {
  refreshDailyQuests,
  refreshWeeklyQuests,
} from "@/game/core/quests/quests";
import { processOfflineCatchup } from "@/game/core/tickProcessor";
import { calculateElapsedTicks, MAX_OFFLINE_TICKS } from "@/game/core/time";
import {
  createNewPet,
  getStartingInventory,
  STARTING_COINS,
} from "@/game/data/starting";
import { createGameManager, type GameManager } from "@/game/GameManager";
import { useGameNotifications } from "@/game/hooks/useGameNotifications";
import {
  deleteSave,
  hasSave,
  loadGame,
  saveGame,
} from "@/game/state/persistence";
import {
  createInitialGameState,
  type GameNotification,
  type GameState,
  MIN_OFFLINE_REPORT_MS,
  type OfflineReport,
  type Pet,
} from "@/game/types";

/**
 * Actions available through the game context.
 */
export interface GameContextActions {
  /** Update the game state */
  updateState: (updater: (state: GameState) => GameState) => void;
  /** Dispatch a battle action */
  dispatchBattleAction: (action: BattleAction) => void;
  /** Save the current game state */
  save: () => boolean;
  /** Reset the game to initial state */
  resetGame: () => void;
  /** Start a new game with given pet name and species */
  startNewGame: (petName: string, speciesId: string) => void;
  /** Dismiss the offline report */
  dismissOfflineReport: () => void;
  /** Dismiss a notification */
  dismissNotification: () => void;
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
  /** Offline report to display (null if none or dismissed) */
  offlineReport: OfflineReport | null;
  /** Current notification to display (null if none or dismissed) */
  notification: GameNotification | null;
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
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(
    null,
  );
  const [notification, setNotification] = useState<GameNotification | null>(
    null,
  );
  const gameManagerRef = useRef<GameManager | null>(null);

  // Standard updateState that just updates the state
  const updateState = useCallback(
    (updater: (state: GameState) => GameState) => {
      setState((prev) => {
        if (!prev) return prev;
        return updater(prev);
      });
    },
    [],
  );

  // Use the notification hook to handle state-based notifications
  useGameNotifications(state, setNotification);

  const dismissOfflineReport = useCallback(() => {
    setOfflineReport(null);
  }, []);

  const dismissNotification = useCallback(() => {
    // Remove the first notification from pendingNotifications in state
    updateState((state) => ({
      ...state,
      pendingNotifications: state.pendingNotifications.slice(1),
    }));
  }, [updateState]);

  /**
   * Process offline ticks and return the updated state plus report.
   * This is done before setting state to avoid race conditions.
   */
  const processOffline = useCallback(
    (
      gameState: GameState,
    ): { state: GameState; report: OfflineReport | null } => {
      if (!gameState.lastSaveTime) return { state: gameState, report: null };

      const currentTime = Date.now();
      const elapsedMs = currentTime - gameState.lastSaveTime;
      const ticksElapsed = calculateElapsedTicks(
        gameState.lastSaveTime,
        currentTime,
      );

      if (ticksElapsed <= 0) return { state: gameState, report: null };

      const result = processOfflineCatchup(
        gameState,
        ticksElapsed,
        MAX_OFFLINE_TICKS,
        elapsedMs,
      );

      // Only return report if significant time passed
      const shouldShowReport = elapsedMs >= MIN_OFFLINE_REPORT_MS;
      return {
        state: result.state,
        report: shouldShowReport ? result.report : null,
      };
    },
    [],
  );

  /**
   * Start the game with the given state.
   * Processes offline ticks before setting state, then starts the game loop.
   */
  const startGame = useCallback(
    (gameState: GameState) => {
      // Process offline ticks before setting state to avoid race condition
      const { state: stateWithOffline, report } = processOffline(gameState);
      setState(stateWithOffline);

      // Set offline report if applicable
      if (report) {
        setOfflineReport(report);
      }

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
      let newState: GameState = {
        ...createInitialGameState(),
        pet,
        player: {
          ...createInitialGameState().player,
          inventory: { items: getStartingInventory() },
          currency: { coins: STARTING_COINS },
          currentLocationId: "home",
        },
        isInitialized: true,
      };

      // Initialize daily and weekly quests (auto-activated)
      newState = refreshDailyQuests(newState);
      newState = refreshWeeklyQuests(newState);

      // Start the game with the new state
      // Note: setHasSaveData is set after startGame for consistency,
      // ensuring state is initialized before marking that save data exists.
      startGame(newState);
      setHasSaveData(true);
    },
    [startGame],
  );

  const dispatchBattleAction = useCallback((action: BattleAction) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.dispatchBattleAction(action);
    }
  }, []);

  const contextValue: GameContextValue = {
    state,
    isLoading,
    loadError,
    hasSaveData,
    offlineReport,
    notification,
    actions: {
      updateState,
      dispatchBattleAction,
      save,
      resetGame,
      startNewGame,
      dismissOfflineReport,
      dismissNotification,
    },
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}
