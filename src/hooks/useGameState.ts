// React hook for managing game state and game loop

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, Pet, Result, PetCareAction, Inventory } from "@/types";
import type { Quest, QuestProgress } from "@/types/Quest";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { GameStorage } from "@/storage/GameStorage";
import { PetSystem } from "@/systems/PetSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { QuestSystem } from "@/systems/QuestSystem";
import { QUESTS } from "@/data/quests";

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

  // Item actions
  useItem: (itemId: string) => Promise<Result<void>>;
  sellItem: (itemId: string, quantity: number) => Promise<Result<void>>;
  buyItem: (itemId: string, quantity: number) => Promise<Result<void>>;
  sortInventory: (sortBy: "name" | "value" | "rarity" | "type" | "quantity") => Promise<Result<void>>;

  // Quest actions
  startQuest: (questId: string) => Promise<Result<void>>;
  abandonQuest: (questId: string) => Promise<Result<void>>;
  completeQuest: (questId: string) => Promise<Result<void>>;
  getAvailableQuests: () => Quest[];
  getActiveQuests: () => QuestProgress[];
  getCompletedQuests: () => string[];

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
    async (action: (pet: Pet) => Result<PetCareAction>, actionName: string): Promise<Result<void>> => {
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
  const feedPet = useCallback(
    () => performPetAction(pet => PetSystem.feedPet(pet, 25), "feed pet"),
    [performPetAction]
  );

  const giveDrink = useCallback(
    () => performPetAction(pet => PetSystem.giveDrink(pet, 25), "give drink"),
    [performPetAction]
  );

  const playWithPet = useCallback(
    () => performPetAction(pet => PetSystem.playWithPet(pet, 20), "play with pet"),
    [performPetAction]
  );

  const cleanPoop = useCallback(() => performPetAction(PetSystem.cleanPoop, "clean poop"), [performPetAction]);

  const treatPet = useCallback(
    (_medicineType: string) => {
      // For now, create a simple medicine effect based on the medicine type
      const medicineEffect = [{ type: "cure" as const, value: 100 }];
      return performPetAction(pet => PetSystem.treatPet(pet, medicineEffect), "treat pet");
    },
    [performPetAction]
  );

  const toggleSleep = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    const pet = gameState.currentPet;
    const actionFn = pet.state === "sleeping" ? PetSystem.wakePetUp : PetSystem.putPetToSleep;
    const actionName = pet.state === "sleeping" ? "wake pet" : "put pet to sleep";

    return performPetAction(actionFn, actionName);
  }, [gameState, performPetAction]);

  // Item action wrapper
  const performItemAction = useCallback(
    async (
      action: (inventory: Inventory, pet: Pet) => Result<{ inventory?: Inventory; pet?: Pet }>,
      actionName: string
    ): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        const result = action(gameState.inventory, gameState.currentPet);

        if (result.success) {
          // Update the game state with new inventory and pet data
          setGameState(prev => {
            if (!prev) return null;
            const updates: Partial<GameState> = { ...prev };

            if (result.data?.inventory) {
              updates.inventory = result.data.inventory;
            }
            if (result.data?.pet) {
              updates.currentPet = result.data.pet;
            }

            return updates as GameState;
          });

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

  // Item actions
  const useItem = useCallback(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    (itemId: string) => performItemAction((inventory, pet) => ItemSystem.useItem(inventory, pet, itemId), "use item"),
    [performItemAction]
  );

  const sellItem = useCallback(
    (itemId: string, quantity: number) =>
      performItemAction(inventory => {
        const result = ItemSystem.sellItem(inventory, itemId, quantity, 0.5);
        return {
          success: result.success,
          error: result.error,
          data: result.success ? { inventory: result.data } : undefined,
        };
      }, "sell item"),
    [performItemAction]
  );

  const buyItem = useCallback(
    (itemId: string, quantity: number) =>
      performItemAction(inventory => {
        const result = ItemSystem.buyItem(inventory, itemId, quantity, 1.0);
        return {
          success: result.success,
          error: result.error,
          data: result.success ? { inventory: result.data } : undefined,
        };
      }, "buy item"),
    [performItemAction]
  );

  const sortInventory = useCallback(
    (sortBy: "name" | "value" | "rarity" | "type" | "quantity") =>
      performItemAction(
        inventory => ({
          success: true,
          data: { inventory: ItemSystem.sortInventory(inventory, sortBy) },
        }),
        "sort inventory"
      ),
    [performItemAction]
  );

  // Quest actions
  const startQuest = useCallback(
    async (questId: string): Promise<Result<void>> => {
      if (!gameState) {
        return { success: false, error: "No game state available" };
      }

      try {
        const quest = QUESTS.find(q => q.id === questId);
        if (!quest) {
          return { success: false, error: "Quest not found" };
        }

        const result = QuestSystem.startQuest(quest, gameState);
        if (result.success && result.data) {
          setGameState(result.data);
          console.log(`Started quest: ${quest.name}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start quest";
        console.error("Start quest error:", error);
        return { success: false, error: message };
      }
    },
    [gameState]
  );

  const abandonQuest = useCallback(
    async (questId: string): Promise<Result<void>> => {
      if (!gameState) {
        return { success: false, error: "No game state available" };
      }

      try {
        const result = QuestSystem.abandonQuest(gameState, questId);
        if (result.success && result.data) {
          setGameState(result.data);
          console.log(`Abandoned quest: ${questId}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to abandon quest";
        console.error("Abandon quest error:", error);
        return { success: false, error: message };
      }
    },
    [gameState]
  );

  const completeQuest = useCallback(
    async (questId: string): Promise<Result<void>> => {
      if (!gameState) {
        return { success: false, error: "No game state available" };
      }

      try {
        const result = QuestSystem.completeQuest(gameState, questId);
        if (result.success && result.data) {
          setGameState(result.data);
          console.log(`Completed quest: ${questId}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to complete quest";
        console.error("Complete quest error:", error);
        return { success: false, error: message };
      }
    },
    [gameState]
  );

  const getAvailableQuests = useCallback((): Quest[] => {
    if (!gameState) return [];

    try {
      return QuestSystem.getAvailableQuests(QUESTS, gameState);
    } catch (error) {
      console.error("Get available quests error:", error);
      return [];
    }
  }, [gameState]);

  const getActiveQuests = useCallback((): QuestProgress[] => {
    if (!gameState?.questLog) return [];
    return gameState.questLog.activeQuests;
  }, [gameState]);

  const getCompletedQuests = useCallback((): string[] => {
    if (!gameState?.questLog) return [];
    return gameState.questLog.completedQuests;
  }, [gameState]);

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

    // Item actions
    useItem,
    sellItem,
    buyItem,
    sortInventory,

    // Quest actions
    startQuest,
    abandonQuest,
    completeQuest,
    getAvailableQuests,
    getActiveQuests,
    getCompletedQuests,

    // Game loop control
    pauseGame,
    resumeGame,
    isPaused,

    // Utility
    hasExistingSave,
    storageInfo,
  };
}
