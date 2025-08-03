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
import { PetValidator, ErrorHandler } from "@/lib/utils";
import { QUEST_ACTION_TYPES } from "@/constants/ActionTypes";

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
  // Updated to emit quest progress events for tutorial care objectives
  const feedPet = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }
    const result = PetSystem.feedPet(gameState.currentPet, 25);
    if (!result.success) return { success: false, error: result.error };

    // State update
    setGameState(prev => (prev ? { ...prev } : null));

    // Process quest progress for care action: feed
    if (gameState?.questLog) {
      QuestSystem.processGameAction(QUEST_ACTION_TYPES.PET_CARE, { action: "feed" }, QUESTS, gameState);
      setGameState(prev => (prev ? { ...prev } : null));
    }

    await triggerAutosave("feed pet", gameState);
    return { success: true };
  }, [gameState, triggerAutosave]);

  const giveDrink = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }
    const result = PetSystem.giveDrink(gameState.currentPet, 25);
    if (!result.success) return { success: false, error: result.error };

    setGameState(prev => (prev ? { ...prev } : null));

    if (gameState?.questLog) {
      QuestSystem.processGameAction(QUEST_ACTION_TYPES.PET_CARE, { action: "drink" }, QUESTS, gameState);
      setGameState(prev => (prev ? { ...prev } : null));
    }

    await triggerAutosave("give drink", gameState);
    return { success: true };
  }, [gameState, triggerAutosave]);

  const playWithPet = useCallback(async (): Promise<Result<void>> => {
    if (!gameState?.currentPet) {
      return { success: false, error: "No active pet" };
    }
    const result = PetSystem.playWithPet(gameState.currentPet, 20);
    if (!result.success) return { success: false, error: result.error };

    setGameState(prev => (prev ? { ...prev } : null));

    if (gameState?.questLog) {
      QuestSystem.processGameAction(QUEST_ACTION_TYPES.PET_CARE, { action: "play" }, QUESTS, gameState);
      setGameState(prev => (prev ? { ...prev } : null));
    }

    await triggerAutosave("play with pet", gameState);
    return { success: true };
  }, [gameState, triggerAutosave]);

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
    const actionFn = PetValidator.isSleeping(pet) ? PetSystem.wakePetUp : PetSystem.putPetToSleep;
    const actionName = PetValidator.isSleeping(pet) ? "wake pet" : "put pet to sleep";

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
          const updatedGameState: GameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          // Update both React state and GameLoop internal state
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          // Emit quest progress for feeding via item if applicable
          if (updatedGameState.questLog) {
            QuestSystem.processGameAction(QUEST_ACTION_TYPES.PET_CARE, { action: "feed" }, QUESTS, updatedGameState);
            // QuestSystem mutates questLog inside updatedGameState; we've already synced React and GameLoop above
          }

          await triggerAutosave(`feed pet with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.error };
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
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState: GameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          if (updatedGameState.questLog) {
            QuestSystem.processGameAction(QUEST_ACTION_TYPES.PET_CARE, { action: "drink" }, QUESTS, updatedGameState);
            // QuestSystem mutates questLog inside updatedGameState; we've already synced React and GameLoop above
          }

          await triggerAutosave(`give drink with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.error };
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
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState: GameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet,
          };

          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          if (updatedGameState.questLog) {
            QuestSystem.processGameAction(QUEST_ACTION_TYPES.PET_CARE, { action: "play" }, QUESTS, updatedGameState);
            // QuestSystem mutates questLog inside updatedGameState; we've already synced React and GameLoop above
          }

          await triggerAutosave(`play with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.error };
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
        // Use the cleaning item (this already handles the cleaning via "clean" effect)
        // eslint-disable-next-line react-hooks/rules-of-hooks -- ItemSystem.useItem is a static method, not a React Hook
        const result = ItemSystem.useItem(gameState.inventory, gameState.currentPet, itemId);
        if (result.success && result.data) {
          const updatedGameState = {
            ...gameState,
            inventory: result.data.inventory,
            currentPet: result.data.pet, // Pet is already cleaned by ItemSystem
          };

          // Update both React state and GameLoop internal state
          setGameState(updatedGameState);
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(updatedGameState);
          }

          await triggerAutosave(`clean with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.error };
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

          await triggerAutosave(`treat with ${itemId}`, updatedGameState);
          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (error) {
        return ErrorHandler.handleCatchError(error, "Failed to treat with item", "Treat with item");
      }
    },
    [gameState, triggerAutosave]
  );

  // Item action wrapper
  // CRITICAL FIX: Build explicit newState, update GameLoop immediately, and autosave with that state
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
          // Build an explicit new state snapshot to avoid timing/race conditions
          const newState: GameState = {
            ...(gameState as GameState),
            inventory: result.data?.inventory ?? gameState.inventory,
            currentPet: result.data?.pet ?? gameState.currentPet,
          };

          // Update React state
          setGameState(newState);

          // Keep GameLoop internal state in sync immediately
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(newState);
          }

          // Trigger autosave using the explicit updated state to avoid stale closure
          await triggerAutosave(actionName, newState);

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
    async (itemId: string, quantity: number): Promise<Result<void>> => {
      if (!gameState?.inventory) {
        return { success: false, error: "No inventory available" };
      }

      try {
        const result = ItemSystem.sellItem(gameState.inventory, itemId, quantity, 0.5);
        if (result.success && result.data) {
          const newState: GameState = {
            ...gameState,
            inventory: result.data,
          };

          // Update React state
          setGameState(newState);

          // Keep GameLoop internal state in sync immediately
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(newState);
          }

          // Process quest progress for item_sold action
          if (newState.questLog) {
            QuestSystem.processGameAction(QUEST_ACTION_TYPES.ITEM_SOLD, { itemId, amount: quantity }, QUESTS, newState);
          }

          // Trigger autosave using the explicit updated state to avoid stale closure
          await triggerAutosave("sell item", newState);

          return { success: true };
        }
        return { success: false, error: result.error };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error in sell item";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [gameState, triggerAutosave]
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
            const newState = {
              ...prev,
              world: result.data!.worldState,
              currentPet: result.data!.pet,
            };

            // CRITICAL FIX: Update GameLoop state immediately to prevent race condition
            if (gameLoopRef.current) {
              gameLoopRef.current.updateState(newState);
            }

            return newState;
          });

          // Trigger autosave after world state change
          await triggerAutosave(`start travel to: ${destinationId}`);

          return { success: true };
        }
        return { success: false, error: result.error };
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
        const result = WorldSystem.startActivity(gameState, activityId);
        if (result.success && result.data) {
          setGameState(prev => {
            if (!prev) return null;
            const newState = {
              ...prev,
              world: result.data!.worldState,
              currentPet: result.data!.pet,
            };

            // CRITICAL FIX: Update GameLoop state immediately to prevent race condition
            if (gameLoopRef.current) {
              gameLoopRef.current.updateState(newState);
            }

            return newState;
          });

          // Trigger autosave after world state change
          await triggerAutosave(`start activity: ${activityId}`);

          return { success: true };
        }
        return { success: false, error: result.error };
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
      const result = WorldSystem.cancelActivity(gameState, gameState.currentPet.id);
      if (result.success && result.data) {
        setGameState(prev => {
          if (!prev) return null;

          // Reset pet state to idle when cancelling activity
          const updatedPet =
            prev.currentPet?.state === "exploring" ? { ...prev.currentPet, state: "idle" as const } : prev.currentPet;

          const newState = {
            ...prev,
            currentPet: updatedPet,
            world: result.data!,
          };

          // CRITICAL FIX: Update GameLoop state immediately to prevent race condition
          if (gameLoopRef.current) {
            gameLoopRef.current.updateState(newState);
          }

          return newState;
        });

        // Trigger autosave after world state change
        await triggerAutosave("cancel activity");

        return { success: true };
      }
      return { success: false, error: result.error };
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
