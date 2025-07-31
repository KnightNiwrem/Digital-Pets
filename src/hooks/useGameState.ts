// React hook for managing game state and game loop

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, Pet, Result, PetCareAction, Inventory } from "@/types";
import type { Quest, QuestProgress } from "@/types/Quest";
import type { Battle } from "@/types/Battle";
import { GameLoop } from "@/engine/GameLoop";
import { GameStateFactory } from "@/engine/GameStateFactory";
import { GameStorage } from "@/storage/GameStorage";
import { PetSystem } from "@/systems/PetSystem";
import { ItemSystem } from "@/systems/ItemSystem";
import { QuestSystem } from "@/systems/QuestSystem";
import { WorldSystem } from "@/systems/WorldSystem";
import { QUESTS } from "@/data/quests";

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
  const triggerAutosave = useCallback(
    async (actionName: string): Promise<void> => {
      if (!gameState) return;

      try {
        const saveResult = GameStorage.saveGame(gameState);
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

          // Trigger autosave after user action
          await triggerAutosave(actionName);

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
    [gameState, triggerAutosave]
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

  // Item-based pet care actions
  const feedPetWithItem = useCallback(
    async (itemId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.inventory) {
        return { success: false, error: "No active pet or inventory" };
      }

      try {
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          // Update both React state and GameLoop internal state
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`feed pet with ${itemId}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to feed pet with item";
        console.error("Feed pet with item error:", error);
        return { success: false, error: message };
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
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          // Update both React state and GameLoop internal state
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`give drink with ${itemId}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to give drink with item";
        console.error("Give drink with item error:", error);
        return { success: false, error: message };
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
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          // Update both React state and GameLoop internal state
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`play with ${itemId}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to play with item";
        console.error("Play with item error:", error);
        return { success: false, error: message };
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
        // First use the cleaning item to clean the pet
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          // Then also trigger the poop cleaning effect
          const cleanResult = PetSystem.cleanPoop(result.data.pet);
          if (cleanResult.success) {
            const updatedGameState = {
              ...gameState,
              inventory: result.data.inventory,
              currentPet: result.data.pet,
            };

            // Update both React state and GameLoop internal state
            setGameState(updatedGameState);
            if (gameLoopRef.current) {
              gameLoopRef.current.updateState(updatedGameState);
            }

            await triggerAutosave(`clean with ${itemId}`);
            return { success: true };
          }
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to clean with item";
        console.error("Clean with item error:", error);
        return { success: false, error: message };
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
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          // Update both React state and GameLoop internal state
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`treat with ${itemId}`);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to treat with item";
        console.error("Treat with item error:", error);
        return { success: false, error: message };
      }
    },
    [gameState, triggerAutosave]
  );

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

          // Trigger autosave after inventory/money update
          await triggerAutosave(actionName);

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
    [gameState, triggerAutosave]
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

          // Trigger autosave after quest update
          await triggerAutosave(`start quest: ${quest.name}`);

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
    [gameState, triggerAutosave]
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

          // Trigger autosave after quest update
          await triggerAutosave(`abandon quest: ${questId}`);

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
    [gameState, triggerAutosave]
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

          // Trigger autosave after quest update
          await triggerAutosave(`complete quest: ${questId}`);

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

  // World actions
  const startTravel = useCallback(
    async (destinationId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.world) {
        return { success: false, error: "No active pet or world state" };
      }

      try {
        const result = WorldSystem.startTravel(gameState.world, gameState.currentPet, destinationId);
        if (result.success && result.data) {
          setGameState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              world: result.data!.worldState,
              currentPet: result.data!.pet,
            };
          });

          // Trigger autosave after world state change
          await triggerAutosave(`start travel to: ${destinationId}`);

          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start travel";
        console.error("Start travel error:", error);
        return { success: false, error: message };
      }
    },
    [gameState, triggerAutosave]
  );

  const startActivity = useCallback(
    async (activityId: string): Promise<Result<void>> => {
      if (!gameState?.currentPet || !gameState?.world) {
        return { success: false, error: "No active pet or world state" };
      }

      try {
        const result = WorldSystem.startActivity(
          gameState.world,
          gameState.currentPet,
          activityId,
          gameState.inventory
        );
        if (result.success && result.data) {
          setGameState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              world: result.data!.worldState,
              currentPet: result.data!.pet,
            };
          });

          // Trigger autosave after world state change
          await triggerAutosave(`start activity: ${activityId}`);

          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to start activity";
        console.error("Start activity error:", error);
        return { success: false, error: message };
      }
    },
    [gameState, triggerAutosave]
  );

  const cancelActivity = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet || !gameState?.world) {
      return { success: false, error: "No active pet or world state" };
    }

    try {
      const result = WorldSystem.cancelActivity(gameState.world, gameState.currentPet.id);
      if (result.success && result.data) {
        setGameState(prev => {
          if (!prev) return null;

          // Reset pet state to idle when cancelling activity
          const updatedPet =
            prev.currentPet?.state === "exploring" ? { ...prev.currentPet, state: "idle" as const } : prev.currentPet;

          return {
            ...prev,
            currentPet: updatedPet,
            world: result.data!,
          };
        });

        // Trigger autosave after world state change
        await triggerAutosave("cancel activity");

        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel activity";
      console.error("Cancel activity error:", error);
      return { success: false, error: message };
    }
  }, [gameState, triggerAutosave]);

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
        const message = error instanceof Error ? error.message : "Failed to apply battle results";
        console.error("Apply battle results error:", error);
        return { success: false, error: message };
      }
    },
    [gameState, triggerAutosave]
  );

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

    // Game loop control
    pauseGame,
    resumeGame,
    isPaused,

    // Utility
    hasExistingSave,
    storageInfo,
  };
}
