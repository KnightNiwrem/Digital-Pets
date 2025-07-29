// React hook for managing game state and game loop

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, Pet, Result } from "@/types";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { GameStorage } from "@/storage/GameStorage";
import { PetSystem } from "@/systems/PetSystem";

export interface UseGameStateReturn {
  // State
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;

  // Game management
  startNewGame: (starterPetName?: string) => Promise<void>;
  loadExistingGame: () => Promise<void>;
  saveGame: () => Promise<Result<void>>;

  // Pet care actions
  feedPet: () => Promise<Result<void>>;
  giveDrink: () => Promise<Result<void>>;
  playWithPet: () => Promise<Result<void>>;
  cleanPoop: () => Promise<Result<void>>;
  treatPet: (medicineType: string) => Promise<Result<void>>;
  toggleSleep: () => Promise<Result<void>>;

  // Game loop control
  pauseGame: () => void;
  resumeGame: () => void;
  isPaused: boolean;

  // Utility
  hasExistingSave: boolean;
  storageInfo: {
    used: number;
    available: number;
    percentage: number;
  };
}

export function useGameState(): UseGameStateReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [hasExistingSave, setHasExistingSave] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, available: 0, percentage: 0 });

  const gameLoopRef = useRef<GameLoop | null>(null);

  // Initialize game loop and check for existing saves
  useEffect(() => {
    gameLoopRef.current = GameLoop.getInstance();
    setHasExistingSave(GameStorage.hasExistingSave());
    setStorageInfo(GameStorage.getStorageInfo());

    // Add game state listener
    const handleStateChange = (newState: GameState) => {
      setGameState(newState);
      setStorageInfo(GameStorage.getStorageInfo());
    };

    gameLoopRef.current.addListener(handleStateChange);

    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.removeListener(handleStateChange);
      }
    };
  }, []);

  // Pet care action wrapper
  const performPetAction = useCallback(
    async (action: (pet: Pet) => Result<string[]>, actionName: string): Promise<Result<void>> => {
      if (!gameState?.currentPet) {
        return { success: false, error: "No active pet" };
      }

      try {
        const result = action(gameState.currentPet);

        if (result.success) {
          // Update the game state
          setGameState(prev => (prev ? { ...prev } : null));

          // Save the game
          const saveResult = GameStorage.saveGame(gameState);
          if (!saveResult.success) {
            console.warn(`${actionName} succeeded but save failed:`, saveResult.error);
          }

          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Unknown error in ${actionName}`;
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [gameState]
  );

  // Game management functions
  const startNewGame = useCallback(async (starterPetName = "Buddy"): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create new game state with starter pet
      const newGameState = GameStateFactory.createTestGame();
      if (newGameState.currentPet) {
        newGameState.currentPet.name = starterPetName;
      }

      // Initialize game loop
      if (gameLoopRef.current) {
        gameLoopRef.current.initialize(newGameState);
        gameLoopRef.current.start();
      }

      // Save initial state
      const saveResult = GameStorage.saveGame(newGameState);
      if (!saveResult.success) {
        throw new Error(`Failed to save new game: ${saveResult.error}`);
      }

      setGameState(newGameState);
      setHasExistingSave(true);
      setIsPaused(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start new game";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadExistingGame = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Load game with offline progression
      const loadResult = GameLoop.loadGameWithProgression();

      if (!loadResult.success) {
        throw new Error(`Failed to load game: ${loadResult.error}`);
      }

      const loadedState = loadResult.gameState!;

      // Initialize game loop
      if (gameLoopRef.current) {
        gameLoopRef.current.initialize(loadedState);
        gameLoopRef.current.start();
      }

      setGameState(loadedState);
      setIsPaused(false);

      // Show offline progression info if any
      if (loadResult.offlineProgression?.progressionApplied) {
        const { ticksElapsed, majorEvents } = loadResult.offlineProgression;
        const hoursOffline = (ticksElapsed * 15) / 3600; // 15 seconds per tick

        console.log(`Welcome back! ${hoursOffline.toFixed(1)} hours passed while away.`);
        if (majorEvents.length > 0) {
          console.log("Major events during your absence:", majorEvents);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load game";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveGame = useCallback(async (): Promise<Result<void>> => {
    if (!gameState) {
      return { success: false, error: "No game state to save" };
    }

    const result = GameStorage.saveGame(gameState);
    setStorageInfo(GameStorage.getStorageInfo());
    return result;
  }, [gameState]);

  // Pet care actions
  const feedPet = useCallback(() => performPetAction(PetSystem.feedPet, "feed pet"), [performPetAction]);

  const giveDrink = useCallback(() => performPetAction(PetSystem.giveDrink, "give drink"), [performPetAction]);

  const playWithPet = useCallback(() => performPetAction(PetSystem.playWithPet, "play with pet"), [performPetAction]);

  const cleanPoop = useCallback(() => performPetAction(PetSystem.cleanPoop, "clean poop"), [performPetAction]);

  const treatPet = useCallback(
    (medicineType: string) => performPetAction(pet => PetSystem.treatPet(pet, medicineType), "treat pet"),
    [performPetAction]
  );

  const toggleSleep = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    const pet = gameState.currentPet;
    const actionFn = pet.state === "sleeping" ? PetSystem.wakePet : PetSystem.putPetToSleep;
    const actionName = pet.state === "sleeping" ? "wake pet" : "put pet to sleep";

    return performPetAction(actionFn, actionName);
  }, [gameState, performPetAction]);

  // Game loop control
  const pauseGame = useCallback(() => {
    if (gameLoopRef.current) {
      gameLoopRef.current.stop();
      setIsPaused(true);
    }
  }, []);

  const resumeGame = useCallback(() => {
    if (gameLoopRef.current && gameState) {
      gameLoopRef.current.start();
      setIsPaused(false);
    }
  }, [gameState]);

  return {
    // State
    gameState,
    isLoading,
    error,

    // Game management
    startNewGame,
    loadExistingGame,
    saveGame,

    // Pet care actions
    feedPet,
    giveDrink,
    playWithPet,
    cleanPoop,
    treatPet,
    toggleSleep,

    // Game loop control
    pauseGame,
    resumeGame,
    isPaused,

    // Utility
    hasExistingSave,
    storageInfo,
  };
}
