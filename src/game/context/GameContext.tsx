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
import { getFacility, getSession } from "@/game/data/facilities";
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
import {
  type ActiveTraining,
  createInitialGameState,
  type ExplorationResult,
  type GameNotification,
  type GameState,
  type GrowthStage,
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
  const previousStageRef = useRef<GrowthStage | null>(null);
  const previousTrainingRef = useRef<ActiveTraining | null>(null);
  const previousExplorationResultRef = useRef<
    (ExplorationResult & { locationName: string }) | null
  >(null);

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

  // Detect stage transitions via useEffect (idiomatic React pattern)
  useEffect(() => {
    const currentStage = state?.pet?.growth.stage ?? null;
    const previousStage = previousStageRef.current;

    // Reset ref when pet is null (game reset or no pet yet)
    if (!state?.pet) {
      previousStageRef.current = null;
      return;
    }

    if (currentStage && previousStage && currentStage !== previousStage) {
      setNotification({
        type: "stageTransition",
        previousStage: previousStage,
        newStage: currentStage,
        petName: state.pet.identity.name,
      });
    }

    previousStageRef.current = currentStage;
  }, [state?.pet]);

  // Detect training completion via useEffect
  useEffect(() => {
    const currentTraining = state?.pet?.activeTraining ?? null;
    const previousTraining = previousTrainingRef.current;

    // Reset ref when pet is null
    if (!state?.pet) {
      previousTrainingRef.current = null;
      return;
    }

    // Training completed: was training before, not training now, and was on last tick
    // If ticksRemaining > 1, training was cancelled, not completed
    const wasNaturalCompletion =
      previousTraining &&
      !currentTraining &&
      previousTraining.ticksRemaining <= 1;

    if (wasNaturalCompletion) {
      const facility = getFacility(previousTraining.facilityId);
      const session = getSession(
        previousTraining.facilityId,
        previousTraining.sessionType,
      );

      if (facility && session) {
        const statsGained: Record<string, number> = {
          [facility.primaryStat]: session.primaryStatGain,
        };
        if (session.secondaryStatGain > 0) {
          statsGained[facility.secondaryStat] = session.secondaryStatGain;
        }

        setNotification({
          type: "trainingComplete",
          facilityName: facility.name,
          statsGained,
          petName: state.pet.identity.name,
        });
      }
    }

    previousTrainingRef.current = currentTraining;
  }, [state?.pet]);

  // Detect exploration completion via useEffect (using ref-based pattern for consistency)
  useEffect(() => {
    const currentResult = state?.lastExplorationResult ?? null;
    const previousResult = previousExplorationResultRef.current;

    // Reset ref when pet is null
    if (!state?.pet) {
      previousExplorationResultRef.current = null;
      return;
    }

    // Only show notification for new results (avoid duplicates on re-renders)
    if (currentResult && currentResult !== previousResult) {
      setNotification({
        type: "explorationComplete",
        locationName: currentResult.locationName,
        itemsFound: currentResult.itemsFound,
        message: currentResult.message,
        petName: state.pet.identity.name,
      });
    }

    previousExplorationResultRef.current = currentResult;
  }, [state?.lastExplorationResult, state?.pet]);

  const dismissOfflineReport = useCallback(() => {
    setOfflineReport(null);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

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
      const newState: GameState = {
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
    offlineReport,
    notification,
    actions: {
      updateState,
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
