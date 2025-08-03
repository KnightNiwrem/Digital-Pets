// React hook for managing game state and game loop

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, Result, Quest, QuestProgress, Battle } from "@/types";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { GameStorage } from "@/storage/GameStorage";
import { ActionCoordinator } from "@/engine/ActionCoordinator";
import { ActionFactory } from "@/types/UnifiedActions";
import { ItemSystem } from "@/systems/ItemSystem";
import { QuestSystem } from "@/systems/QuestSystem";
import { QUESTS } from "@/data/quests";
import { PetValidator, ErrorHandler } from "@/lib/utils";

export interface UseGameStateReturn {
  // State
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;

  // Game management
  startNewGame: (starterPetName?: string, starterSpeciesId?: string) => Promise<void>;
  loadExistingGame: () => Promise<void>;
  saveGame: () => Promise<Result<void>>;

  // Pet care actions
  feedPet: () => Promise<Result<void>>;
  giveDrink: () => Promise<Result<void>>;
  playWithPet: () => Promise<Result<void>>;
  cleanPoop: () => Promise<Result<void>>;
  treatPet: (medicineType: string) => Promise<Result<void>>;
  toggleSleep: () => Promise<Result<void>>;

  // Item-based pet care actions
  feedPetWithItem: (itemId: string) => Promise<Result<void>>;
  giveDrinkWithItem: (itemId: string) => Promise<Result<void>>;
  playWithItem: (itemId: string) => Promise<Result<void>>;
  cleanWithItem: (itemId: string) => Promise<Result<void>>;
  treatWithItem: (itemId: string) => Promise<Result<void>>;

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

  // World actions
  startTravel: (destinationId: string) => Promise<Result<void>>;
  startActivity: (activityId: string) => Promise<Result<void>>;
  cancelActivity: () => Promise<Result<void>>;

  // Battle actions
  applyBattleResults: (battleResults: Battle) => Promise<Result<void>>;
  setPetBattling: () => Promise<Result<void>>;
  setPetIdleFromBattle: () => Promise<Result<void>>;

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

  // Enhanced autosave utility for user actions
  // Accepts an explicit state to avoid stale closure timing issues
  const triggerAutosave = useCallback(
    async (actionName: string, stateOverride?: GameState): Promise<void> => {
      const stateToSave = stateOverride ?? gameState;
      if (!stateToSave) return;

      try {
        const saveResult = GameStorage.saveGame(stateToSave);
        if (!saveResult.success) {
          console.warn(`${actionName} succeeded but autosave failed:`, saveResult.error);
        } else {
          console.log(`Autosave triggered after: ${actionName}`);
        }
      } catch (error) {
        console.warn(`Autosave error after ${actionName}:`, error);
      }
    },
    [gameState]
  );

  // Game management functions
  const startNewGame = useCallback(async (starterPetName = "Buddy", starterSpeciesId?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create new game state with proper starter pet
      const newGameState = GameStateFactory.createNewGameWithStarter(starterPetName, starterSpeciesId);

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

  // Pet care actions - now using unified dispatch pattern
  const feedPet = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    try {
      const action = ActionFactory.createPetCareAction("feed", { value: 25 });
      const result = await ActionCoordinator.dispatchAction(gameState, action);

      if (result.success && result.data) {
        const updatedGameState = result.data.gameState;
        setGameState(updatedGameState);
        if (gameLoopRef.current) {
          gameLoopRef.current.updateState(updatedGameState);
        }

        await triggerAutosave("feed pet", updatedGameState);
        return { success: true };
      }
      return { success: false, error: result.success ? "Unknown error" : result.error };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to feed pet", "Feed pet");
    }
  }, [gameState, triggerAutosave]);

  const giveDrink = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    try {
      const action = ActionFactory.createPetCareAction("drink", { value: 25 });
      const result = await ActionCoordinator.dispatchAction(gameState, action);

      if (result.success && result.data) {
        const updatedGameState = result.data.gameState;
        setGameState(updatedGameState);
        if (gameLoopRef.current) {
          gameLoopRef.current.updateState(updatedGameState);
        }

        await triggerAutosave("give drink", updatedGameState);
        return { success: true };
      }
      return { success: false, error: result.success ? "Unknown error" : result.error };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to give drink", "Give drink");
    }
  }, [gameState, triggerAutosave]);

  const playWithPet = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    try {
      const action = ActionFactory.createPetCareAction("play", { value: 20 });
      const result = await ActionCoordinator.dispatchAction(gameState, action);

      if (result.success && result.data) {
        const updatedGameState = result.data.gameState;
        setGameState(updatedGameState);
        if (gameLoopRef.current) {
          gameLoopRef.current.updateState(updatedGameState);
        }

        await triggerAutosave("play with pet", updatedGameState);
        return { success: true };
      }
      return { success: false, error: result.success ? "Unknown error" : result.error };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to play with pet", "Play with pet");
    }
  }, [gameState, triggerAutosave]);

  const cleanPoop = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    try {
      const action = ActionFactory.createPetCareAction("clean");
      const result = await ActionCoordinator.dispatchAction(gameState, action);

      if (result.success && result.data) {
        const updatedGameState = result.data.gameState;
        setGameState(updatedGameState);
        if (gameLoopRef.current) {
          gameLoopRef.current.updateState(updatedGameState);
        }

        await triggerAutosave("clean poop", updatedGameState);
        return { success: true };
      }
      return { success: false, error: result.success ? "Unknown error" : result.error };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to clean poop", "Clean poop");
    }
  }, [gameState, triggerAutosave]);

  const treatPet = useCallback(
    async (_medicineType: string): Promise<Result<void>> => {
      if (!gameState?.currentPet) {
        return { success: false, error: "No active pet" };
      }

      try {
        // For now, create a simple medicine effect based on the medicine type
        const medicineEffect = [{ type: "cure" as const, value: 100 }];
        const action = ActionFactory.createPetCareAction("medicine", { effects: medicineEffect });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave("treat pet", updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to treat pet", "Treat pet");
      }
    },
    [gameState, triggerAutosave]
  );

  const toggleSleep = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    const pet = gameState.currentPet;
    const careType = PetValidator.isSleeping(pet) ? "wake" : "sleep";
    const actionName = PetValidator.isSleeping(pet) ? "wake pet" : "put pet to sleep";

    try {
      const action = ActionFactory.createPetCareAction(careType);
      const result = await ActionCoordinator.dispatchAction(gameState, action);

      if (result.success && result.data) {
        const updatedGameState = result.data.gameState;
        setGameState(updatedGameState);
        if (gameLoopRef.current) {
          gameLoopRef.current.updateState(updatedGameState);
        }

        await triggerAutosave(actionName, updatedGameState);
        return { success: true };
      }
      return { success: false, error: result.success ? "Unknown error" : result.error };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, `Failed to ${actionName}`, actionName);
    }
  }, [gameState, triggerAutosave]);

  // Item-based pet care actions - now using unified dispatch pattern
  const feedPetWithItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        const action = ActionFactory.createPetCareAction("feed", { itemId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`feed pet with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to feed pet with item", "Feed pet with item");
      }
    },
    [gameState, triggerAutosave]
  );

  const giveDrinkWithItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        const action = ActionFactory.createPetCareAction("drink", { itemId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`give drink with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to give drink with item", "Give drink with item");
      }
    },
    [gameState, triggerAutosave]
  );

  const playWithItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        const action = ActionFactory.createPetCareAction("play", { itemId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`play with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to play with item", "Play with item");
      }
    },
    [gameState, triggerAutosave]
  );

  const cleanWithItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        const action = ActionFactory.createPetCareAction("clean", { itemId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`clean with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to clean with item", "Clean with item");
      }
    },
    [gameState, triggerAutosave]
  );

  const treatWithItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        const action = ActionFactory.createPetCareAction("medicine", { itemId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`treat with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to treat with item", "Treat with item");
      }
    },
    [gameState, triggerAutosave]
  );

  // Item actions - now using unified dispatch pattern
  const useItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        // Get the item to determine care action type
        const inventorySlot = ItemSystem.getInventoryItem(gameState.inventory, itemId);
        if (!inventorySlot) {
          return { success: false, error: "Item not found in inventory" };
        }

        const action = ActionFactory.createItemAction("use", itemId, 1);
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`use item ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to use item", "Use item");
      }
    },
    [gameState, triggerAutosave]
  );

  const sellItem = useCallback(
    async (itemId: string, quantity: number): Promise<Result<void>> => {
      if (!gameState?.inventory) {
        return { success: false, error: "No inventory available" };
      }

      try {
        const action = ActionFactory.createItemAction("sell", itemId, quantity, { priceMultiplier: 0.5 });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const newState = result.data.gameState;
          setGameState(newState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(newState);
          }

          await triggerAutosave("sell item", newState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error in sell item";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [gameState, triggerAutosave]
  );

  const buyItem = useCallback(
    async (itemId: string, quantity: number): Promise<Result<void>> => {
      if (!gameState?.inventory) {
        return { success: false, error: "No inventory available" };
      }

      try {
        const action = ActionFactory.createItemAction("buy", itemId, quantity, { priceMultiplier: 1.0 });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const newState = result.data.gameState;
          setGameState(newState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(newState);
          }

          await triggerAutosave("buy item", newState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error in buy item";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [gameState, triggerAutosave]
  );

  const sortInventory = useCallback(
    async (sortBy: "name" | "value" | "rarity" | "type" | "quantity"): Promise<Result<void>> => {
      if (!gameState?.inventory) {
        return { success: false, error: "No inventory available" };
      }

      try {
        const action = ActionFactory.createItemAction("sort", "dummy", 1, { sortBy });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const newState = result.data.gameState;
          setGameState(newState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(newState);
          }

          await triggerAutosave("sort inventory", newState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error in sort inventory";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [gameState, triggerAutosave]
  );

  // Quest actions - now using unified ActionCoordinator pattern
  const startQuest = useCallback(
    async (questId: string): Promise<Result<void>> => {
      if (!gameState) {
        return { success: false, error: "No game state available" };
      }

      try {
        const action = ActionFactory.createQuestAction("start", questId);
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`start quest: ${questId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to start quest", "Start quest");
      }
    },
    [gameState, triggerAutosave]
  );

  const abandonQuest = useCallback(
    async (questId: string): Promise<Result<void>> => {
      if (!gameState) {
        return { success: false, error: "No game state available" };
      }

      try {
        const action = ActionFactory.createQuestAction("abandon", questId);
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`abandon quest: ${questId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to abandon quest", "Abandon quest");
      }
    },
    [gameState, triggerAutosave]
  );

  const completeQuest = useCallback(
    async (questId: string): Promise<Result<void>> => {
      if (!gameState) {
        return { success: false, error: "No game state available" };
      }

      try {
        const action = ActionFactory.createQuestAction("complete", questId);
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`complete quest: ${questId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to complete quest", "Complete quest");
      }
    },
    [gameState, triggerAutosave]
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

  // World actions - now using unified ActionCoordinator pattern
  const startTravel = useCallback(
    async (destinationId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.world) {
        return { success: false, error: "No active pet or world state" };
      }

      try {
        const action = ActionFactory.createWorldAction("travel", { destinationId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`start travel to: ${destinationId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to start travel", "Start travel");
      }
    },
    [gameState, triggerAutosave, gameLoopRef]
  );

  const startActivity = useCallback(
    async (activityId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.world) {
        return { success: false, error: "No active pet or world state" };
      }

      try {
        const action = ActionFactory.createWorldAction("activity", { activityId });
        const result = await ActionCoordinator.dispatchAction(gameState, action);

        if (result.success && result.data) {
          const updatedGameState = result.data.gameState;
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`start activity: ${activityId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.success ? "Unknown error" : result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to start activity", "Start activity");
      }
    },
    [gameState, triggerAutosave, gameLoopRef]
  );

  const cancelActivity = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet || !gameState?.world) {
      return { success: false, error: "No active pet or world state" };
    }

    try {
      const action = ActionFactory.createWorldAction("cancel_activity");
      const result = await ActionCoordinator.dispatchAction(gameState, action);

      if (result.success && result.data) {
        const updatedGameState = result.data.gameState;
        setGameState(updatedGameState);
        if (gameLoopRef.current) {
          gameLoopRef.current.updateState(updatedGameState);
        }

        await triggerAutosave("cancel activity", updatedGameState);
        return { success: true };
      }
      return { success: false, error: result.success ? "Unknown error" : result.error };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to cancel activity", "Cancel activity");
    }
  }, [gameState, triggerAutosave, gameLoopRef]);

  // Battle actions
  const applyBattleResults = useCallback(
    async (battleResults: Battle): Promise<Result<void>> => {
      if (!gameState?.currentPet) {
        return { success: false, error: "No active pet" };
      }

      try {
        // Import BattleSystem dynamically
        const { BattleSystem } = await import("@/systems/BattleSystem");
        const result = BattleSystem.applyBattleResults(gameState.currentPet, battleResults);

        if (result.success && result.data) {
          setGameState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              currentPet: result.data!,
            };
          });

          // Trigger autosave after pet state change from battle
          await triggerAutosave("apply battle results");

          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to apply battle results", "Apply battle results");
      }
    },
    [gameState, triggerAutosave]
  );

  const setPetBattling = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    try {
      setGameState(prev => {
        if (!prev?.currentPet) return prev;
        return {
          ...prev,
          currentPet: {
            ...prev.currentPet,
            state: "battling",
          },
        };
      });

      await triggerAutosave("set pet battling");
      return { success: true };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to set pet battling", "Set pet battling");
    }
  }, [gameState, triggerAutosave]);

  const setPetIdleFromBattle = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }

    try {
      setGameState(prev => {
        if (!prev?.currentPet) return prev;
        return {
          ...prev,
          currentPet: {
            ...prev.currentPet,
            state: "idle",
          },
        };
      });

      await triggerAutosave("set pet idle from battle");
      return { success: true };
    } catch (error) {
      return ErrorHandler.handleCatchError(error, "Failed to set pet idle", "Set pet idle");
    }
  }, [gameState, triggerAutosave]);

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

    // Item-based pet care actions
    feedPetWithItem,
    giveDrinkWithItem,
    playWithItem,
    cleanWithItem,
    treatWithItem,

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

    // World actions
    startTravel,
    startActivity,
    cancelActivity,

    // Battle actions
    applyBattleResults,
    setPetBattling,
    setPetIdleFromBattle,

    // Game loop control
    pauseGame,
    resumeGame,
    isPaused,

    // Utility
    hasExistingSave,
    storageInfo,
  };
}
